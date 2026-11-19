// Painel TSX nativo, adaptado da sidebar do orca-todos.
import {
  atom, Badge, Box, Callout, Code, Collapsible, EmptyState, Heading, plugin,
  Progress, read, Row, Select, set, Spinner, Stack, Text, type PanelContext
} from 'orca'
import type { ProgressState } from './protocol'
import type { Phase, Task } from './todo-file'

const state = atom<ProgressState | null>(null)
const error = atom<string | null>(null)
const status = {
  done: { icon: '☑', phaseIcon: '✓', label: 'Concluída', tone: 'success' },
  doing: { icon: '◉', phaseIcon: '◉', label: 'Em andamento', tone: 'accent' },
  pending: { icon: '☐', phaseIcon: '○', label: 'Pendente', tone: 'neutral' },
  empty: { icon: '–', phaseIcon: '–', label: 'Sem tarefas', tone: 'neutral' }
} as const

let revision = 0

async function run(work: () => Promise<ProgressState>): Promise<void> {
  const started = revision
  try {
    const next = await work()
    if (revision === started) {
      set(error, null)
      set(state, next)
    }
  } catch {
    if (revision === started) set(error, 'Não foi possível consultar o plano no ORCA.')
  }
}

export function setup(ctx: PanelContext): void {
  ctx.subscriptions.push(plugin.on('progress.changed', (next) => {
    revision++
    set(error, null)
    set(state, next)
  }))
  void run(() => plugin.request('progress.get'))
}

// Preserva a apresentação de código inline do painel original.
function RichText({ text, muted }: { text: string; muted?: boolean }) {
  const parts = text.split(/(`[^`]+`)/).filter(Boolean)
  return (
    <Text muted={muted} size="sm">
      {parts.map((part, index) => part.startsWith('`') && part.endsWith('`')
        ? <Code key={index}>{part.slice(1, -1)}</Code>
        : part)}
    </Text>
  )
}

function TaskRow({ task }: { task: Task }) {
  const item = status[task.status]
  return (
    <Stack gap="xs">
      <Box direction="row" gap="sm" align="start">
        <Text size="sm" tone={item.tone}>{item.icon}</Text>
        <Box grow shrink minWidth={0}>
          <RichText text={task.text} muted={task.status === 'done'}/>
          {task.status === 'doing' ? <Text muted size="xs">{item.label}</Text> : null}
        </Box>
      </Box>
      {task.children.length ? (
        <Box paddingX="sm" gap="xs">
          {task.children.map((child) => <TaskRow key={child.id} task={child} />)}
        </Box>
      ) : null}
    </Stack>
  )
}

function PhaseSection({ phase }: { phase: Phase }) {
  const { done, total, percent, status: phaseStatus } = phase.progress
  const meta = status[phaseStatus]
  return (
    <Collapsible title={`${meta.phaseIcon} ${phase.title} · ${done}/${total}`} defaultOpen>
      <Stack gap="xs">
        <Text size="xs" muted>{total ? `${meta.label} · ${percent}%` : meta.label}</Text>
        {phase.items.map((item) => item.kind === 'phase'
          ? <PhaseSection key={item.id} phase={item} />
          : <TaskRow key={item.id} task={item} />)}
      </Stack>
    </Collapsible>
  )
}

export default function Panel() {
  const current = read(state)
  const requestError = read(error)
  if (requestError && !current) return <Callout tone="danger">{requestError}</Callout>
  if (!current) return <Spinner label="Carregando plano" />
  if (!current.workspace && !current.problem) {
    return <EmptyState icon="folder" title="Nenhum workspace em foco" description="Abra um workspace local para ver seu plano." />
  }

  const { workspace, file, candidates, plan, problem } = current
  const notice = problem ?? requestError
  return (
    <Box gap="md" paddingY="sm">
      <Stack gap="xs">
        <Row justify="between" align="start" gap="sm" wrap>
          <Heading level={2}>{workspace?.name ?? 'Project Progress'}</Heading>
          {plan ? <Badge tone="accent">{`${plan.progress.percent}%`}</Badge> : null}
        </Row>
        {file ? <Text muted size="xs">{file}</Text> : null}
      </Stack>

      {notice ? <Callout tone="danger" title="Falha ao atualizar o plano">{notice}</Callout> : null}
      {workspace && candidates.length > 1 ? (
        <Select
          label="Plano canônico"
          value={file ?? ''}
          options={candidates.map((candidate) => ({ value: candidate, label: candidate }))}
          onChange={(next) => run(() => plugin.request('progress.select', { workspaceId: workspace.id, file: next }))}
        />
      ) : null}

      {plan ? (
        <Stack gap="sm">
          {notice ? <Text size="xs" muted>Última leitura válida</Text> : null}
          <Progress label="Progresso geral" labelHidden value={plan.progress.percent} />
          <Text size="sm" muted>{`${plan.progress.done} de ${plan.progress.total} tarefas concluídas`}</Text>
          {plan.phases.map((phase) => <PhaseSection key={`${workspace?.id}:${file}:${phase.id}`} phase={phase} />)}
        </Stack>
      ) : !notice ? (
        <EmptyState
          icon="file-text"
          title="Nenhum plano Markdown com checkboxes encontrado"
          description="Inclua uma lista com checkboxes em PROJECT_PLAN.md ou PLAN.md na raiz do workspace."
        />
      ) : null}
    </Box>
  )
}
