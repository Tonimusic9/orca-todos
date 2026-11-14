// The plugin's worker: owns TODO.md for the focused worktree, watches it, and delivers the
// messages the person confirms to an agent's terminal once that agent is idle.
import { existsSync, watch, type FSWatcher } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { OrcaWorkerApi } from 'orca/worker'
import type { AgentInfo, QueuedMessage, TodoState } from './protocol'
import { addTask, parseTasks, setTaskDone, TODO_TEMPLATE, type Owner, type Task } from './todo-file'

const FILE = 'TODO.md'
const QUEUE = 'queue'
/** terminal id -> workspace id, learned from agent events and the person's picks. */
const TERMINALS = 'terminalWorkspaces'
/** States in which typing into the agent's terminal lands in its prompt, not mid-turn or in a
 *  permission dialog (`blocked`). */
const IDLE = new Set<AgentInfo['state']>(['waiting', 'done'])

type Context = { branch: string; displayName: string; terminals: { id: string }[] } | null
type Candidate = { id: string; name: string; path: string; hostId: string | null }
type Workspace = { id: string; name: string; path: string } | null

const shortBranch = (branch: string | null | undefined) => (branch ?? '').replace(/^refs\/heads\//, '')

function hostError(code: string, message: string): Error {
  return Object.assign(new Error(message), { code })
}

// Module scope so deactivate() can close them; a live watch keeps the worker process running.
let watcher: FSWatcher | null = null
let debounce: ReturnType<typeof setTimeout> | null = null

export default function activate(orca: OrcaWorkerApi): void {
  let workspace: Workspace = null
  let problem: string | null = null
  /** Workspaces that match the focused one's name and branch when Orca's context cannot tell them apart. */
  let choices: Candidate[] = []
  let lastContext: Context = null
  /** Serializes file writes and queue changes so two quick clicks cannot interleave. */
  let chain: Promise<unknown> = Promise.resolve()
  const serial = <T>(work: () => Promise<T>): Promise<T> => {
    const next = chain.then(work, work)
    chain = next.catch(() => undefined)
    return next
  }

  const filePath = () => (workspace ? join(workspace.path, FILE) : null)

  async function readTodo(): Promise<string | null> {
    const path = filePath()
    if (!path) return null
    try {
      return await readFile(path, 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
      throw error
    }
  }

  async function readQueue(): Promise<QueuedMessage[]> {
    const value = await orca.storage.get(QUEUE)
    return Array.isArray(value) ? (value as unknown as QueuedMessage[]) : []
  }

  async function writeQueue(queue: QueuedMessage[]): Promise<void> {
    await orca.storage.set(QUEUE, queue as unknown as never)
  }

  async function listAgents(): Promise<AgentInfo[]> {
    try {
      const { agents } = await orca.host.call('agents.list')
      const rows = agents.filter((a): a is typeof a & { terminalId: string } => !!a.terminalId)
      const labels = rows.map((a) => a.title?.trim() || a.agent || 'Agent')
      return rows.map((a, i) => ({
        terminalId: a.terminalId,
        // Two agents with the same title get their terminal id's tail so the picker can tell them apart.
        label:
          labels.indexOf(labels[i]) !== labels.lastIndexOf(labels[i])
            ? `${labels[i]} (${a.terminalId.slice(-4)})`
            : labels[i],
        agent: a.agent,
        state: a.state
      }))
    } catch (error) {
      orca.log(`agents.list failed: ${String(error)}`)
      return []
    }
  }

  async function state(): Promise<TodoState> {
    let tasks: Task[] = []
    let exists = false
    let fileProblem = problem
    if (workspace && !problem) {
      try {
        const source = await readTodo()
        exists = source !== null
        tasks = source ? parseTasks(source) : []
      } catch (error) {
        fileProblem = `Could not read ${FILE}: ${String(error)}`
      }
    }
    return {
      workspace: workspace && { name: workspace.name, path: workspace.path },
      choices: choices.map((c) => ({ id: c.id, name: c.name, path: c.path })),
      problem: fileProblem,
      exists,
      tasks,
      agents: workspace ? await listAgents() : [],
      queue: await readQueue()
    }
  }

  async function broadcast(): Promise<TodoState> {
    const current = await state()
    orca.panels.post('todos.changed', current)
    return current
  }

  function watchFile(): void {
    watcher?.close()
    watcher = null
    if (!workspace || problem) return
    try {
      // Watch the folder, not the file: editors and agents often replace the file on save,
      // which ends a watch on the old file.
      watcher = watch(workspace.path, (_event, name) => {
        if (name && name.toString() !== FILE) return
        if (debounce) clearTimeout(debounce)
        debounce = setTimeout(() => void broadcast(), 80)
      })
    } catch (error) {
      orca.log(`watch failed: ${String(error)}`)
    }
  }

  async function terminalMap(): Promise<Record<string, string>> {
    const value = await orca.storage.get(TERMINALS)
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, string>) : {}
  }

  async function remember(terminalIds: string[], workspaceId: string): Promise<void> {
    const map = await terminalMap()
    if (terminalIds.every((id) => map[id] === workspaceId)) return
    for (const id of terminalIds) map[id] = workspaceId
    // Keep the map small: terminal ids do not come back once closed.
    const entries = Object.entries(map).slice(-500)
    await orca.storage.set(TERMINALS, Object.fromEntries(entries))
  }

  function useWorkspace(match: Candidate | null): void {
    const next: Workspace = match && { id: match.id, name: match.name, path: match.path }
    problem = null
    if (match?.hostId && match.hostId !== 'local') problem = 'Remote workspaces are not supported yet.'
    else if (match && !existsSync(match.path)) problem = `Folder not found: ${match.path}`
    const changed = next?.path !== workspace?.path
    workspace = next
    if (changed) watchFile()
  }

  /**
   * Orca's context names the focused workspace only by display name and branch, which many
   * repos share ("main"). Narrow by those, then by terminals we have seen in a workspace, else
   * ask the person to pick.
   */
  async function resolveWorkspace(context: Context): Promise<void> {
    lastContext = context
    choices = []
    if (!context) {
      useWorkspace(null)
      return void (await broadcast())
    }
    const { workspaces } = await orca.host.call('workspace.list')
    const branch = shortBranch(context.branch)
    let candidates: Candidate[] = workspaces.filter(
      (w) => w.name === context.displayName && shortBranch(w.branch) === branch
    )
    if (!candidates.length) candidates = workspaces.filter((w) => w.name === context.displayName)
    let match: Candidate | null = candidates.length === 1 ? candidates[0] : null
    if (!match && candidates.length > 1) {
      const map = await terminalMap()
      const known = new Set(context.terminals.map((t) => map[t.id]).filter(Boolean))
      const hits = candidates.filter((c) => known.has(c.id))
      if (hits.length === 1) match = hits[0]
      else choices = hits.length > 1 ? hits : candidates
    }
    useWorkspace(match)
    await broadcast()
  }

  async function editFile(change: (source: string | null) => string | null): Promise<void> {
    const path = filePath()
    if (!path || problem) throw hostError('not_permitted', 'No local worktree is focused.')
    const next = change(await readTodo())
    if (next === null) throw hostError('conflict', `${FILE} changed; showing the latest version.`)
    await writeFile(path, next, 'utf8')
  }

  /** Sends every queued message for an idle agent's terminal as one prompt. */
  async function flush(terminalId: string): Promise<void> {
    const queue = await readQueue()
    const mine = queue.filter((m) => m.terminalId === terminalId)
    if (!mine.length) return
    const text =
      mine.length === 1
        ? mine[0].text
        : `[todos] ${mine.map((m) => m.text.replace(/^\[todos\]\s*/, '')).join(' Also: ')}`
    try {
      await orca.host.call('terminal.sendText', { terminalId, text, enter: true })
    } catch (error) {
      // The terminal is gone: drop its messages instead of retrying forever.
      orca.log(`send to ${terminalId} failed, dropping ${mine.length} message(s): ${String(error)}`)
    }
    await writeQueue((await readQueue()).filter((m) => m.terminalId !== terminalId))
  }

  async function enqueue(terminalId: string, taskText: string, text: string): Promise<void> {
    const agents = await listAgents()
    const agent = agents.find((a) => a.terminalId === terminalId)
    const message: QueuedMessage = {
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      terminalId,
      agentLabel: agent?.label ?? 'Agent',
      taskText,
      text,
      createdAt: Date.now()
    }
    await writeQueue([...(await readQueue()), message])
    // Already idle: nothing to wait for.
    if (agent && IDLE.has(agent.state)) await flush(terminalId)
  }

  // --- Events -------------------------------------------------------------------------------

  orca.events.on('workspace.changed', ({ context }) => serial(() => resolveWorkspace(context)))

  orca.events.on('agent.status.changed', ({ terminalId, workspaceId, state: agentState }) =>
    serial(async () => {
      if (terminalId && workspaceId) {
        await remember([terminalId], workspaceId)
        // A terminal of the focused workspace just told us which workspace it is.
        if (choices.length && lastContext?.terminals.some((t) => t.id === terminalId)) {
          const hit = choices.find((c) => c.id === workspaceId)
          if (hit) {
            choices = []
            useWorkspace(hit)
          }
        }
      }
      if (terminalId && IDLE.has(agentState)) await flush(terminalId)
      await broadcast()
    })
  )

  // --- Panel requests -----------------------------------------------------------------------

  orca.panels.handle('todos.get', () =>
    serial(async () => {
      if (!workspace && !choices.length) await resolveWorkspace(await orca.host.call('workspace.readContext'))
      return state()
    })
  )

  orca.panels.handle('todos.setDone', ({ id, done }) =>
    serial(async () => {
      await editFile((source) => (source === null ? null : setTaskDone(source, id, done)))
      return broadcast()
    })
  )

  orca.panels.handle('todos.confirm', ({ id, terminalId }) =>
    serial(async () => {
      const task = parseTasks((await readTodo()) ?? '').find((t) => t.id === id)
      if (!task) throw hostError('conflict', `${FILE} changed; showing the latest version.`)
      await editFile((source) => (source === null ? null : setTaskDone(source, id, true)))
      await enqueue(
        terminalId,
        task.text,
        `[todos] I finished a task you asked me to do in ${FILE}: "${task.text}". It is checked off; carry on with anything that was waiting on it.`
      )
      return broadcast()
    })
  )

  orca.panels.handle('todos.add', ({ owner, text }: { owner: Owner; text: string }) =>
    serial(async () => {
      if (!text.trim()) throw hostError('invalid_params', 'A task needs some text.')
      await editFile((source) => addTask(source, owner, text))
      return broadcast()
    })
  )

  orca.panels.handle('todos.create', () =>
    serial(async () => {
      await editFile((source) => source ?? TODO_TEMPLATE)
      return broadcast()
    })
  )

  orca.panels.handle('todos.brief', ({ terminalId }) =>
    serial(async () => {
      await enqueue(
        terminalId,
        'How to use TODO.md',
        `[todos] This worktree keeps a shared task list in ${FILE} at its root, which I see in a side panel. ` +
          `As you work, add tasks you plan to do as "- [ ] @agent <task>" and check them off ("- [x]") when done. ` +
          `When you need me to do something by hand, add "- [ ] @me <task>"; when I check it off you will get a message starting with "[todos]". ` +
          `Only edit task lines. Read ${FILE} now if it exists.`
      )
      return broadcast()
    })
  )

  orca.panels.handle('todos.pick', ({ workspaceId }) =>
    serial(async () => {
      const hit = choices.find((c) => c.id === workspaceId)
      if (!hit) throw hostError('invalid_params', 'That project is not one of the choices.')
      choices = []
      useWorkspace(hit)
      // Remember through this workspace's terminals, so the next focus resolves on its own.
      if (lastContext?.terminals.length) await remember(lastContext.terminals.map((t) => t.id), hit.id)
      return broadcast()
    })
  )

  orca.panels.handle('todos.cancelQueued', ({ id }) =>
    serial(async () => {
      await writeQueue((await readQueue()).filter((m) => m.id !== id))
      return broadcast()
    })
  )
}

export function deactivate(): void {
  watcher?.close()
  watcher = null
  if (debounce) clearTimeout(debounce)
  debounce = null
}
