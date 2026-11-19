import { constants, copyFileSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout } from 'node:timers/promises'
import { assert, mockHost, mountWorker, test } from 'orca/testing'
import * as main from './worker'
import type { ProgressState } from './protocol'

const first = { workspaceId: 'w1', branch: 'main', displayName: 'main', terminals: [] }
const second = { ...first, workspaceId: 'w2' }
const source = fileURLToPath(new URL('../fixtures/sample/PROJECT_PLAN.md', import.meta.url))
const other = fileURLToPath(new URL('../fixtures/other/PLAN.md', import.meta.url))

async function useFixture(run: (fixture: {
  dir: string
  host: ReturnType<typeof mockHost>
  worker: Awaited<ReturnType<typeof mountWorker>>
  restart: () => Promise<Awaited<ReturnType<typeof mountWorker>>>
}) => Promise<void>) {
  const dir = mkdtempSync(join(tmpdir(), 'orca-progress-'))
  const secondDir = join(dir, 'outro')
  mkdirSync(secondDir)
  copyFileSync(source, join(dir, 'PROJECT_PLAN.md'), constants.COPYFILE_EXCL)
  copyFileSync(other, join(secondDir, 'PLAN.md'), constants.COPYFILE_EXCL)
  const host = mockHost({
    results: {
      'workspace.readContext': first,
      'workspace.list': {
        workspaces: [
          { id: 'w1', kind: 'worktree', name: 'main', project: 'Primeiro projeto', path: dir, branch: 'refs/heads/main', hostId: 'local' },
          { id: 'w2', kind: 'worktree', name: 'main', project: 'Segundo projeto', path: secondDir, branch: 'main', hostId: 'local' }
        ],
        truncated: false
      }
    }
  })
  const mount = () => mountWorker(main, { host, events: ['workspace.changed'] })
  let worker = await mount()
  try {
    await run({ dir, host, worker, restart: async () => {
      await worker.deactivate()
      worker = await mount()
      return worker
    } })
  } finally {
    await worker.deactivate()
    rmSync(dir, { recursive: true, force: true })
  }
}

async function waitForPost(worker: Awaited<ReturnType<typeof mountWorker>>, file: string, done: number) {
  const deadline = Date.now() + 2500
  do {
    const latest = worker.posts.at(-1)?.payload as ProgressState | undefined
    if (latest?.file === file && latest.plan?.progress.done === done) return latest
    await setTimeout(25)
  } while (Date.now() < deadline)
  assert.fail(`O watcher não publicou ${file} com ${done} tarefas concluídas`)
}

test('prioriza um único plano e atualiza o progresso em uma troca atômica do arquivo', () => useFixture(async ({ dir, worker }) => {
  const file = join(dir, 'PROJECT_PLAN.md')
  writeFileSync(join(dir, 'TODO.md'), '- [x] Tarefa legada\n')
  const initial = await worker.request('progress.get')
  assert.equal(initial.file, 'PROJECT_PLAN.md')
  assert.equal(initial.plan?.progress.percent, 60)
  const updated = readFileSync(file, 'utf8').replace('- [ ] Validar responsividade', '- [x] Validar responsividade')
  writeFileSync(join(dir, 'rascunho.tmp'), updated)
  renameSync(join(dir, 'rascunho.tmp'), file)
  assert.equal((await waitForPost(worker, 'PROJECT_PLAN.md', 10)).plan?.progress.percent, 67)
  assert.equal(readFileSync(file, 'utf8'), updated)
  await assert.rejects(worker.request('todos.create'), /handler|unknown_method/i)
  assert.deepEqual(worker.refusals, [])
}))

test('isola workspaces com mesmo nome, preserva a escolha e relê o Markdown após reiniciar', () => useFixture(async ({ dir, host, worker, restart }) => {
  writeFileSync(join(dir, 'TODO.md'), '- [x] Tarefa legada\n')
  await worker.request('progress.get')
  await assert.rejects(worker.request('progress.select', { workspaceId: 'w1', file: '../fora.md' }))
  const chosen = await worker.request('progress.select', { workspaceId: 'w1', file: 'TODO.md' })
  assert.equal(chosen.plan?.progress.total, 1)
  await worker.emit('workspace.changed', { context: second })
  const switched = worker.posts.at(-1)?.payload as ProgressState
  assert.equal(switched.workspace?.name, 'Segundo projeto')
  assert.equal(switched.file, 'PLAN.md')
  assert.equal(switched.plan?.progress.done, 0)
  await assert.rejects(worker.request('progress.select', { workspaceId: 'w1', file: 'TODO.md' }))
  await worker.emit('workspace.changed', { context: first })
  assert.equal((worker.posts.at(-1)?.payload as ProgressState).file, 'TODO.md')
  host.respond('workspace.readContext', first)
  const fresh = await restart()
  assert.deepEqual(await fresh.request('progress.get'), chosen)
}))

test('descobre docs criados depois e sinaliza falha sem confundir o último plano com dados atuais', () => useFixture(async ({ dir, worker }) => {
  const rootPlan = join(dir, 'PROJECT_PLAN.md')
  writeFileSync(rootPlan, '# Sem tarefas\n')
  assert.equal((await worker.request('progress.get')).plan, null)
  const docs = join(dir, 'docs')
  mkdirSync(docs)
  copyFileSync(source, join(docs, 'PLAN.md'))
  await waitForPost(worker, 'docs/PLAN.md', 9)
  renameSync(join(docs, 'PLAN.md'), join(docs, 'anterior.md'))
  symlinkSync(source, join(docs, 'PLAN.md'))
  const failed = await worker.request('progress.get')
  assert.ok(failed.problem)
  assert.equal(failed.file, 'docs/PLAN.md')
  assert.equal(failed.plan?.progress.percent, 60)
}))
