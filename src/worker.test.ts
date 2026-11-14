import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { assert, mockHost, mountWorker, test } from 'orca/testing'
import type {} from './protocol'
import * as main from './worker'

type Send = { terminalId: string; text: string; enter: boolean }
const sendsOf = (host: { calls: readonly { method: string; params: unknown }[] }) =>
  host.calls.filter((c) => c.method === 'terminal.sendText').map((c) => c.params as Send)

const EVENTS = ['workspace.changed', 'agent.status.changed']

function setup(state: 'working' | 'waiting') {
  const dir = mkdtempSync(join(tmpdir(), 'orca-todos-'))
  writeFileSync(join(dir, 'TODO.md'), '# TODO\n\n- [ ] @me Add the API key\n- [ ] @agent Wire it up\n')
  const host = mockHost({
    results: {
      'workspace.readContext': { branch: 'feat/x', displayName: 'feat/x', terminals: [{ id: 't1' }] },
      'workspace.list': {
        workspaces: [{ id: 'w1', kind: 'worktree', name: 'feat/x', path: dir, branch: 'refs/heads/feat/x', hostId: 'local' }],
        truncated: false
      },
      'agents.list': {
        agents: [
          { terminalId: 't1', title: 'Claude', agent: 'claude', state, stateStartedAt: 0 },
          { terminalId: 't2', title: 'Codex', agent: 'codex', state: 'waiting', stateStartedAt: 0 }
        ]
      },
      'terminal.sendText': { accepted: true }
    }
  })
  return { dir, host }
}

test('reads the focused worktree TODO.md', async () => {
  const { host } = setup('waiting')
  const worker = await mountWorker(main, { host, events: EVENTS })
  const state = await worker.request('todos.get')
  assert.equal(state.exists, true)
  assert.deepEqual(state.tasks.map((t) => [t.owner, t.text]), [['me', 'Add the API key'], ['agent', 'Wire it up']])
  assert.deepEqual(state.agents.map((a) => a.label), ['Claude', 'Codex'])
  assert.deepEqual(worker.refusals, [])
  await worker.deactivate()
})

test('confirming a busy agent queues the message until it is idle', async () => {
  const { dir, host } = setup('working')
  const worker = await mountWorker(main, { host, events: EVENTS })
  const { tasks } = await worker.request('todos.get')
  const after = await worker.request('todos.confirm', { id: tasks[0].id, terminalId: 't1' })

  assert.match(readFileSync(join(dir, 'TODO.md'), 'utf8'), /- \[x\] @me Add the API key/)
  assert.equal(after.queue.length, 1)
  assert.equal(sendsOf(host).length, 0)

  await worker.emit('agent.status.changed', { workspaceId: 'w1', paneKey: 'p1', terminalId: 't1', state: 'waiting', receivedAt: 1 })
  const sends = sendsOf(host)
  assert.equal(sends.length, 1)
  const params = sends[0]
  assert.equal(params.terminalId, 't1')
  assert.equal(params.enter, true)
  assert.match(params.text, /^\[todos\] .*"Add the API key"/)
  const final = await worker.request('todos.get')
  assert.equal(final.queue.length, 0)
  await worker.deactivate()
})

test('confirming an idle agent sends right away', async () => {
  const { host } = setup('waiting')
  const worker = await mountWorker(main, { host, events: EVENTS })
  const { tasks } = await worker.request('todos.get')
  const after = await worker.request('todos.confirm', { id: tasks[0].id, terminalId: 't2' })
  assert.equal(after.queue.length, 0)
  assert.equal(sendsOf(host)[0].terminalId, 't2')
  await worker.deactivate()
})

test('a blocked agent (permission prompt) does not get typed into', async () => {
  const { host } = setup('working')
  const worker = await mountWorker(main, { host, events: EVENTS })
  const { tasks } = await worker.request('todos.get')
  await worker.request('todos.confirm', { id: tasks[0].id, terminalId: 't1' })
  await worker.emit('agent.status.changed', { workspaceId: 'w1', paneKey: 'p1', terminalId: 't1', state: 'blocked', receivedAt: 1 })
  assert.equal(sendsOf(host).length, 0)
  await worker.deactivate()
})

test('adds, toggles and cancels', async () => {
  const { dir, host } = setup('working')
  const worker = await mountWorker(main, { host, events: EVENTS })
  let state = await worker.request('todos.add', { owner: 'me', text: 'Approve the PR' })
  assert.equal(state.tasks.at(-1)?.text, 'Approve the PR')
  state = await worker.request('todos.setDone', { id: state.tasks[1].id, done: true })
  assert.match(readFileSync(join(dir, 'TODO.md'), 'utf8'), /- \[x\] @agent Wire it up/)
  state = await worker.request('todos.brief', { terminalId: 't1' })
  assert.equal(state.queue.length, 1)
  state = await worker.request('todos.cancelQueued', { id: state.queue[0].id })
  assert.equal(state.queue.length, 0)
  await worker.deactivate()
})

test('tells same-named workspaces apart by terminals, else asks', async () => {
  const { dir } = setup('waiting')
  const other = mkdtempSync(join(tmpdir(), 'orca-todos-'))
  const host = mockHost({
    results: {
      'workspace.readContext': { branch: 'main', displayName: 'main', terminals: [{ id: 't9' }] },
      'workspace.list': {
        workspaces: [
          { id: 'w1', kind: 'worktree', name: 'main', path: dir, branch: 'main', hostId: 'local' },
          { id: 'w2', kind: 'worktree', name: 'main', path: other, branch: 'main', hostId: 'local' }
        ],
        truncated: false
      },
      'agents.list': { agents: [] }
    }
  })
  const worker = await mountWorker(main, { host, events: EVENTS })
  let state = await worker.request('todos.get')
  assert.equal(state.workspace, null)
  assert.deepEqual(state.choices.map((c) => c.id), ['w1', 'w2'])

  // An agent in the focused workspace reports in: now we know.
  await worker.emit('agent.status.changed', { workspaceId: 'w1', paneKey: 'p', terminalId: 't9', state: 'working', receivedAt: 1 })
  state = await worker.request('todos.get')
  assert.equal(state.workspace?.path, dir)
  assert.equal(state.tasks.length, 2)
  await worker.deactivate()
})
