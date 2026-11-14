// The Todos sidebar panel. All state comes from the worker (src/worker.ts), which owns TODO.md.
import {
  atom,
  Badge,
  Box,
  Button,
  Callout,
  Checkbox,
  Collapsible,
  EmptyState,
  Heading,
  IconButton,
  Input,
  plugin,
  read,
  Row,
  Select,
  set,
  Spinner,
  Stack,
  Text,
  type PanelContext
} from 'orca'
import type { AgentInfo, Owner, Task, TodoState } from './protocol'

const todo = atom<TodoState | null>(null)
/** The @me task whose confirm step is open. */
const confirming = atom<string | null>(null)
/** The agent picked in the confirm step. */
const target = atom<string>('')
const draft = atom('draft', '')
const draftOwner = atom<Owner>('draftOwner', 'agent', { persist: 'plugin' })
const error = atom<string | null>(null)

async function run(work: () => Promise<TodoState>): Promise<void> {
  try {
    set(error, null)
    set(todo, await work())
  } catch (e) {
    set(error, (e as Error).message || 'Something went wrong.')
    set(todo, await plugin.request('todos.get').catch(() => read(todo)))
  }
}

function defaultAgent(agents: AgentInfo[]): string {
  return (agents.find((a) => a.state === 'waiting' || a.state === 'done') ?? agents[0])?.terminalId ?? ''
}

function openConfirm(task: Task): void {
  set(confirming, task.id)
  set(target, defaultAgent(read(todo)?.agents ?? []))
}

async function confirm(task: Task, send: boolean): Promise<void> {
  const terminalId = read(target)
  set(confirming, null)
  await run(() =>
    send && terminalId
      ? plugin.request('todos.confirm', { id: task.id, terminalId })
      : plugin.request('todos.setDone', { id: task.id, done: true })
  )
}

async function addDraft(): Promise<void> {
  const text = read(draft).trim()
  if (!text) return
  set(draft, '')
  await run(() => plugin.request('todos.add', { owner: read(draftOwner), text }))
}

export function setup(ctx: PanelContext): void {
  ctx.subscriptions.push(plugin.on('todos.changed', (next) => set(todo, next)))
  void run(() => plugin.request('todos.get'))
}

const stateTone = (state: AgentInfo['state']) =>
  state === 'working' ? 'accent' : state === 'blocked' ? 'warning' : 'success'
const stateLabel = (state: AgentInfo['state']) =>
  state === 'working' ? 'working' : state === 'blocked' ? 'needs you' : 'idle'

function ConfirmStep({ task, agents }: { task: Task; agents: AgentInfo[] }) {
  const chosen = agents.find((a) => a.terminalId === read(target))
  const busy = chosen && !(chosen.state === 'waiting' || chosen.state === 'done')
  return (
    <Box border="accent" radius="md" padding="sm" background="muted">
      <Stack gap="sm">
        <Text weight="medium">Done with this?</Text>
        {agents.length === 0 ? (
          <Text muted size="sm">
            No agents are running in this worktree, so no one gets a message.
          </Text>
        ) : agents.length === 1 ? (
          <Text size="sm">
            Tell <Badge tone="accent">{agents[0].label}</Badge>
          </Text>
        ) : (
          <Select
            label="Tell which agent"
            value={read(target)}
            options={agents.map((a) => ({ value: a.terminalId, label: `${a.label} · ${stateLabel(a.state)}` }))}
            onChange={(value) => set(target, value)}
          />
        )}
        {busy ? (
          <Text muted size="xs">
            {`${chosen.label} is ${stateLabel(chosen.state)}; the message waits until it is idle.`}
          </Text>
        ) : null}
        <Row gap="xs" wrap>
          {agents.length > 0 ? (
            <Button tone="accent" icon="check" onPress={() => confirm(task, true)}>
              Check off & tell agent
            </Button>
          ) : null}
          <Button variant={agents.length ? 'outline' : 'solid'} onPress={() => confirm(task, false)}>
            {agents.length ? 'Just check off' : 'Check off'}
          </Button>
          <Button variant="ghost" onPress={() => set(confirming, null)}>
            Cancel
          </Button>
        </Row>
      </Stack>
    </Box>
  )
}

function TaskRow({ task, agents }: { task: Task; agents: AgentInfo[] }) {
  const open = read(confirming) === task.id
  return (
    <Stack gap="xs">
      <Checkbox
        label={task.text}
        checked={task.done || open}
        onChange={(checked) => {
          if (task.owner === 'me' && checked && !task.done) openConfirm(task)
          else if (open && !checked) set(confirming, null)
          else void run(() => plugin.request('todos.setDone', { id: task.id, done: checked }))
        }}
      />
      {open ? <ConfirmStep task={task} agents={agents} /> : null}
    </Stack>
  )
}

function Section({ title, tasks, agents, tone }: { title: string; tasks: Task[]; agents: AgentInfo[]; tone: 'warning' | 'neutral' }) {
  if (!tasks.length) return null
  return (
    <Stack gap="xs">
      <Row justify="between">
        <Text weight="semibold" size="sm">
          {title}
        </Text>
        <Badge tone={tone}>{String(tasks.length)}</Badge>
      </Row>
      {tasks.map((task) => (
        <TaskRow task={task} agents={agents} />
      ))}
    </Stack>
  )
}

export default function Panel() {
  const current = read(todo)
  if (!current) return <Spinner label="Loading TODO.md" />
  if (!current.workspace && current.choices.length)
    return (
      <Stack gap="md">
        <Heading>Todos</Heading>
        <Callout tone="accent" icon="folder" title="Which project is this?">
          Orca names this workspace only by its branch, which several projects share. Pick it once;
          Todos remembers it through this workspace's terminals.
        </Callout>
        <Select
          label="Project"
          placeholder="Choose a project"
          options={current.choices.map((c) => ({ value: c.id, label: c.path.replace(/^\/Users\/[^/]+/, '~') }))}
          onChange={(workspaceId) => run(() => plugin.request('todos.pick', { workspaceId }))}
        />
      </Stack>
    )
  if (!current.workspace)
    return <EmptyState icon="folder" title="No worktree focused" description="Open a worktree to see its TODO.md." />

  const { tasks, agents, queue } = current
  const mine = tasks.filter((t) => t.owner === 'me' && !t.done)
  const theirs = tasks.filter((t) => t.owner === 'agent' && !t.done)
  const done = tasks.filter((t) => t.done)
  const message = read(error)

  return (
    <Stack gap="md">
      <Stack gap="xs">
        <Row justify="between">
          <Heading>Todos</Heading>
          {current.exists ? <Badge tone={mine.length ? 'warning' : 'neutral'}>{`${mine.length + theirs.length} open`}</Badge> : null}
        </Row>
        <Text muted size="xs" truncate>
          {current.workspace.name} · TODO.md
        </Text>
      </Stack>

      {current.problem ? <Callout tone="danger" title="Can't show this worktree">{current.problem}</Callout> : null}
      {message ? (
        <Callout tone="warning" icon="warning">
          {message}
        </Callout>
      ) : null}

      {!current.problem && !current.exists ? (
        <EmptyState icon="file-text" title="No TODO.md yet" description="Create one, or ask an agent to.">
          <Button tone="accent" icon="add" onPress={() => run(() => plugin.request('todos.create'))}>
            Create TODO.md
          </Button>
        </EmptyState>
      ) : null}

      {current.exists && !tasks.length ? (
        <Text muted size="sm">
          No tasks yet. Agents add them as they work, or add one below.
        </Text>
      ) : null}

      <Section title="Waiting on you" tasks={mine} agents={agents} tone="warning" />
      <Section title="Agent tasks" tasks={theirs} agents={agents} tone="neutral" />

      {queue.length ? (
        <Stack gap="xs">
          <Text weight="semibold" size="sm">
            Queued messages
          </Text>
          {queue.map((m) => (
            <Row justify="between" gap="xs">
              <Text size="xs" truncate>
                {`→ ${m.agentLabel}: ${m.taskText}`}
              </Text>
              <IconButton
                icon="close"
                size="xs"
                variant="ghost"
                label="Cancel message"
                onPress={() => run(() => plugin.request('todos.cancelQueued', { id: m.id }))}
              />
            </Row>
          ))}
        </Stack>
      ) : null}

      {done.length ? (
        <Collapsible title={`Done (${done.length})`}>
          <Stack gap="xs">
            {done.map((task) => (
              <TaskRow task={task} agents={agents} />
            ))}
          </Stack>
        </Collapsible>
      ) : null}

      {!current.problem ? (
        <Stack gap="xs">
          <Input
            label="New task"
            labelHidden
            placeholder="Add a task…"
            value={read(draft)}
            onChange={(value) => set(draft, value)}
            onSubmit={addDraft}
          />
          <Row gap="xs">
            <Select
              label="For"
              labelHidden
              value={read(draftOwner)}
              options={[
                { value: 'agent', label: 'For an agent' },
                { value: 'me', label: 'For me' }
              ]}
              onChange={(value) => set(draftOwner, value as Owner)}
            />
            <Button icon="add" onPress={addDraft} disabled={!read(draft).trim()}>
              Add
            </Button>
          </Row>
        </Stack>
      ) : null}

      {agents.length ? (
        <Collapsible title={`Agents here (${agents.length})`}>
          <Stack gap="xs">
            {agents.map((a) => (
              <Row justify="between" gap="xs">
                <Row gap="xs">
                  <Text size="sm" truncate>
                    {a.label}
                  </Text>
                  <Badge tone={stateTone(a.state)}>{stateLabel(a.state)}</Badge>
                </Row>
                <Button
                  size="xs"
                  variant="ghost"
                  tooltip="Explain the TODO.md format to this agent (sent when idle)"
                  onPress={() => run(() => plugin.request('todos.brief', { terminalId: a.terminalId }))}
                >
                  Brief
                </Button>
              </Row>
            ))}
          </Stack>
        </Collapsible>
      ) : null}
    </Stack>
  )
}
