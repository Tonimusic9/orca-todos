import { assert, test } from 'orca/testing'
import { addTask, parseTasks, setTaskDone, TODO_TEMPLATE } from './todo-file'

const SAMPLE = `# TODO

Some notes stay put.

- [ ] @me Add STRIPE_KEY to .env
- [x] @agent Write tests
- [ ] Untagged means agent
  - [ ] @ME nested, any case
`

test('parses owners, done state and text', () => {
  const tasks = parseTasks(SAMPLE)
  assert.deepEqual(
    tasks.map((t) => [t.owner, t.done, t.text]),
    [
      ['me', false, 'Add STRIPE_KEY to .env'],
      ['agent', true, 'Write tests'],
      ['agent', false, 'Untagged means agent'],
      ['me', false, 'nested, any case']
    ]
  )
})

test('ignores the example tasks inside the template comment', () => {
  assert.equal(parseTasks(TODO_TEMPLATE).length, 0)
})

test('checks one task and keeps every other line', () => {
  const [stripe] = parseTasks(SAMPLE)
  const next = setTaskDone(SAMPLE, stripe.id, true)
  assert.equal(next, SAMPLE.replace('- [ ] @me Add', '- [x] @me Add'))
})

test('refuses a stale id after the line changed', () => {
  const [stripe] = parseTasks(SAMPLE)
  const edited = SAMPLE.replace('Add STRIPE_KEY', 'Add STRIPE_SECRET')
  assert.equal(setTaskDone(edited, stripe.id, true), null)
})

test('adds tasks to an existing file and to a new one', () => {
  assert.ok(addTask(SAMPLE, 'me', '  Rotate   keys ').endsWith('  - [ ] @ME nested, any case\n- [ ] @me Rotate keys\n'))
  const fresh = addTask(null, 'agent', 'First')
  assert.ok(fresh.startsWith('# TODO'))
  assert.deepEqual(parseTasks(fresh).map((t) => t.text), ['First'])
})
