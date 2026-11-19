// Reutiliza a resolução de workspace e a observação de diretórios de orca-todos.
import { constants, lstatSync, watch, type FSWatcher } from 'node:fs'
import { open, realpath } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { OrcaWorkerApi } from 'orca/worker'
import type { ProgressState } from './protocol'
import { parseTasks, type Plan } from './todo-file'

const FILES = ['PROJECT_PLAN.md', 'PLAN.md', 'ROADMAP.md', 'TASKS.md', 'TODO.md', 'docs/PLAN.md', 'docs/ROADMAP.md']
const shortBranch = (branch: string | null) => (branch ?? '').replace(/^refs\/heads\//, '')
const errorCode = (error: unknown) => (error as NodeJS.ErrnoException).code
const missing = (error: unknown) => ['ENOENT', 'ENOTDIR'].includes(errorCode(error) ?? '')

type Context = { workspaceId?: string; branch: string; displayName: string } | null
type Workspace = NonNullable<ProgressState['workspace']> & { path: string }
type Snapshot = Pick<ProgressState, 'file' | 'candidates' | 'plan'>

let stopWatching: (() => void) | undefined

async function readPlan(root: string, file: string): Promise<Plan | null> {
  const path = join(root, file)
  try {
    // A lista é fixa e não acompanha links intermediários para fora do workspace.
    if (await realpath(dirname(path)) !== dirname(path)) throw new Error('Link simbólico no caminho')
    const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK)
    try {
      if (!(await handle.stat()).isFile()) throw new Error('O caminho não é um arquivo regular')
      const plan = parseTasks(await handle.readFile('utf8'))
      return plan.progress.total ? plan : null
    } finally {
      await handle.close()
    }
  } catch (error) {
    if (missing(error)) return null
    throw error
  }
}

export default function activate(orca: OrcaWorkerApi): void {
  let workspace: Workspace | null = null
  let problem: string | null = null
  let watchProblem: string | null = null
  let rootWatcher: FSWatcher | undefined
  let docsWatcher: FSWatcher | undefined
  let debounce: ReturnType<typeof setTimeout> | undefined
  let refreshDocs = false
  let preferred: string | undefined
  let lastGood: Snapshot | undefined
  let chain: Promise<unknown> = Promise.resolve()
  const serial = <T>(work: () => Promise<T>): Promise<T> => {
    const next = chain.then(work, work)
    chain = next.catch(() => undefined)
    return next
  }

  async function state(selection = preferred): Promise<ProgressState> {
    const visibleWorkspace = workspace && { id: workspace.id, name: workspace.name }
    const empty = { workspace: visibleWorkspace, file: null, candidates: [], plan: null, problem }
    if (!workspace || problem) return empty
    const root = workspace.path
    const results = await Promise.all(FILES.map(async (file) => {
      try {
        return { file, plan: await readPlan(root, file), failed: false }
      } catch {
        return { file, plan: null, failed: true }
      }
    }))
    const candidates = results.filter((result) => result.plan).map((result) => result.file)
    const chosen = results.find((result) => result.file === selection && (result.plan || result.failed))
      ?? results.find((result) => result.plan || result.failed)
    if (chosen?.failed) {
      return {
        ...empty, ...lastGood, candidates,
        problem: `Falha ao ler ${chosen.file}.`
      }
    }
    lastGood = { file: chosen?.file ?? null, plan: chosen?.plan ?? null, candidates }
    return { workspace: visibleWorkspace, ...lastGood, problem: watchProblem }
  }

  async function broadcast(): Promise<void> {
    orca.panels.post('progress.changed', await state())
  }

  function closeWatchers(): void {
    rootWatcher?.close()
    docsWatcher?.close()
    rootWatcher = docsWatcher = undefined
    clearTimeout(debounce)
    refreshDocs = false
  }
  stopWatching = closeWatchers

  function scheduleUpdate(rebind = false): void {
    refreshDocs ||= rebind
    clearTimeout(debounce)
    const watched = workspace
    debounce = setTimeout(() => {
      void serial(async () => {
        if (workspace !== watched) return
        if (refreshDocs && workspace) {
          refreshDocs = false
          watchDocs(workspace.path)
        }
        await broadcast()
      }).catch((error) => orca.log(`Falha ao atualizar o plano: ${String(error)}`))
    }, 80)
  }

  function watchFolder(path: string, scope: '' | 'docs/'): FSWatcher {
    // Um save por rename troca o inode do arquivo, então observamos o diretório.
    const watcher = watch(path, (_event, name) => {
      const relative = name && scope + name.toString()
      if (!relative || FILES.includes(relative) || relative === 'docs') {
        scheduleUpdate(!scope && (!relative || relative === 'docs'))
      }
    })
    watcher.on('error', (error) => {
      if (scope && missing(error)) {
        scheduleUpdate(true)
        return
      }
      watcher.close()
      if (scope) docsWatcher = undefined
      else rootWatcher = undefined
      watchProblem = 'Não foi possível observar o plano. Reabra o painel para tentar novamente.'
      scheduleUpdate()
    })
    return watcher
  }

  function watchDocs(root: string): void {
    docsWatcher?.close()
    docsWatcher = undefined
    try {
      const docs = join(root, 'docs')
      if (lstatSync(docs).isDirectory()) docsWatcher = watchFolder(docs, 'docs/')
    } catch (error) {
      if (!missing(error)) watchProblem = 'Não foi possível observar a pasta docs.'
    }
  }

  async function resolveWorkspace(context: Context): Promise<void> {
    let next: Workspace | null = null
    problem = null
    if (context) {
      try {
        const { workspaces } = await orca.host.call('workspace.list')
        const matches = context.workspaceId
          ? workspaces.filter((candidate) => candidate.id === context.workspaceId)
          : workspaces.filter((candidate) =>
            candidate.name === context.displayName && shortBranch(candidate.branch) === shortBranch(context.branch))
        const match = matches.length === 1 ? matches[0] : undefined
        if (!match) problem = 'O ORCA não identificou um workspace único para este painel.'
        else if (match.hostId && match.hostId !== 'local') problem = 'Abra um workspace local para ver seu plano.'
        else next = { id: match.id, name: match.project || match.name, path: await realpath(match.path) }
      } catch {
        problem = 'Não foi possível localizar a pasta do workspace em foco.'
      }
    }
    if (workspace?.id !== next?.id || workspace?.path !== next?.path) {
      closeWatchers()
      lastGood = undefined
      preferred = undefined
      workspace = next
      if (next) {
        try {
          const saved = await orca.storage.get(`plan:${next.id}`)
          if (typeof saved === 'string' && FILES.includes(saved)) preferred = saved
        } catch (error) {
          orca.log(`Falha ao ler a escolha do plano: ${String(error)}`)
        }
      }
    }
    if (workspace && (!rootWatcher || watchProblem)) {
      closeWatchers()
      watchProblem = null
      try {
        rootWatcher = watchFolder(workspace.path, '')
        watchDocs(workspace.path)
      } catch {
        watchProblem = 'Não foi possível observar o plano. Reabra o painel para tentar novamente.'
      }
    }
  }

  orca.events.on('workspace.changed', ({ context }) => serial(async () => {
    await resolveWorkspace(context)
    await broadcast()
  }))

  orca.panels.handle('progress.get', () => serial(async () => {
    await resolveWorkspace(await orca.host.call('workspace.readContext'))
    return state()
  }))

  orca.panels.handle('progress.select', ({ workspaceId, file }) => serial(async () => {
    if (workspace?.id !== workspaceId || !FILES.includes(file)) throw new Error('Plano indisponível neste workspace.')
    const before = await state()
    if (!before.candidates.includes(file)) throw new Error('Este arquivo não contém um plano disponível.')
    await orca.storage.set(`plan:${workspaceId}`, file)
    preferred = file
    const current = await state()
    orca.panels.post('progress.changed', current)
    return current
  }))
}

export function deactivate(): void {
  stopWatching?.()
  stopWatching = undefined
}
