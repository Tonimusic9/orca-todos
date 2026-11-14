import { assert, mockHost, mount, test } from 'orca/testing'
import * as panel from './panel'
import type { TodoState } from './protocol'

const base: TodoState = {
  workspace: { name: 'feat/x', path: '/tmp/x' },
  choices: [],
  problem: null,
  exists: true,
  tasks: [
    { id: '2:- [ ] @me Add the API key', line: 2, done: false, owner: 'me', text: 'Add the API key' },
    { id: '3:- [ ] @agent Wire it up', line: 3, done: false, owner: 'agent', text: 'Wire it up' }
  ],
  agents: [
    { terminalId: 't1', label: 'Claude', agent: 'claude', state: 'working' },
    { terminalId: 't2', label: 'Codex', agent: 'codex', state: 'waiting' }
  ],
  queue: []
}

test('checking a manual task opens the confirm step and sends to the picked agent', async () => {
  const confirms: unknown[] = []
  const host = mockHost({
    requests: {
      'todos.get': () => base,
      'todos.confirm': (input) => (confirms.push(input), base)
    }
  })
  const view = await mount(panel, { host })
  await view.toggle({ label: 'Add the API key' })
  assert.ok(view.find({ text: 'Done with this?' }))
  // Defaults to the idle agent.
  assert.equal(view.valueOf({ label: 'Tell which agent' }), 't2')
  await view.select({ label: 'Tell which agent' }, 't1')
  assert.ok(view.find({ text: 'Claude is working; the message waits until it is idle.' }))
  await view.press({ text: 'Check off & tell agent' })
  assert.deepEqual(confirms, [{ id: base.tasks[0].id, terminalId: 't1' }])
  assert.equal(view.find({ text: 'Done with this?' }), null)
  assert.deepEqual(view.errors, [])
  assert.deepEqual(view.warnings, [])
  await view.unmount()
})

test('checking an agent task needs no confirm', async () => {
  const sets: unknown[] = []
  const host = mockHost({
    requests: { 'todos.get': () => base, 'todos.setDone': (input) => (sets.push(input), base) }
  })
  const view = await mount(panel, { host })
  await view.toggle({ label: 'Wire it up' })
  assert.deepEqual(sets, [{ id: base.tasks[1].id, done: true }])
  assert.equal(view.find({ text: 'Done with this?' }), null)
  await view.unmount()
})

test('offers to create TODO.md when missing', async () => {
  const host = mockHost({ requests: { 'todos.get': () => ({ ...base, exists: false, tasks: [] }) } })
  const view = await mount(panel, { host })
  assert.ok(view.find({ text: 'Create TODO.md' }))
  await view.unmount()
})

test('asks which project when the branch is ambiguous', async () => {
  const picks: unknown[] = []
  const ambiguous: TodoState = {
    ...base,
    workspace: null,
    choices: [
      { id: 'a', name: 'main', path: '/Users/me/code/a' },
      { id: 'b', name: 'main', path: '/Users/me/code/b' }
    ]
  }
  const host = mockHost({ requests: { 'todos.get': () => ambiguous, 'todos.pick': (input) => (picks.push(input), base) } })
  const view = await mount(panel, { host })
  await view.select({ label: 'Project' }, 'b')
  assert.deepEqual(picks, [{ workspaceId: 'b' }])
  assert.ok(view.find({ text: 'Agent tasks' }))
  await view.unmount()
})
