import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { parseTasks } from './todo-file.ts'

test('conta 9 de 15 folhas em quatro fases, ignora a cerca e preserva a hierarquia', () => {
  const source = readFileSync(new URL('../fixtures/sample/PROJECT_PLAN.md', import.meta.url), 'utf8')
  const plan = parseTasks(source)
  assert.deepEqual(plan.progress, { done: 9, total: 15, percent: 60, status: 'doing' })
  assert.deepEqual(plan.phases.map(({ title, progress }) => [title, progress.done, progress.total]), [
    ['Planejamento', 3, 3], ['Backend', 3, 3], ['Frontend', 3, 5], ['Testes e entrega', 0, 4]
  ])
  const [parent, , active] = plan.phases[2].items
  assert.equal(parent.kind, 'task')
  const [child] = parent.children
  assert.equal(child.children[0].text, 'Implementar navegação')
  assert.equal(active.kind, 'task')
  assert.equal(active.status, 'doing')
})

test('respeita ordem, fases repetidas e fases vazias, sem inferir tarefas', () => {
  const plan = parseTasks([
    '# Plano', '## Fase', '- [ ] @me Primeiro', '### Subfase', '* [X] @agent Segundo',
    '~~~md', '- [x] Ignorar', '~~', '- [x] Ignorar também', '~~~',
    '<!--', '## Ignorar comentário', '- [x] Ignorar', '-->', '## Fase'
  ].join('\n'))
  assert.deepEqual(plan.phases.map(({ title }) => title), ['Fase', 'Fase'])
  const [task, subphase] = plan.phases[0].items
  assert.equal(task.kind, 'task')
  assert.equal(task.text, 'Primeiro')
  assert.equal(subphase.kind, 'phase')
  assert.equal(subphase.title, 'Subfase')
  assert.equal(plan.progress.total, 2)
  assert.deepEqual(plan.phases[1].progress, { done: 0, total: 0, percent: 0, status: 'empty' })
  assert.equal(parseTasks('# Título').progress.status, 'empty')
})

test('uma tarefa pendente com menção literal a @doing segue pendente', () => {
  const plan = parseTasks('- [ ] Explicar `@doing`\n- [ ] @doing Executar')
  assert.deepEqual(plan.phases[0].items.map((item) => item.kind === 'task' && item.status), ['pending', 'doing'])
})

test('respeita listas intermediárias e não anexa checkbox a um pai anterior', () => {
  const plan = parseTasks('- [x] Primeiro\n- Agrupador sem checkbox\n  - [ ] Segundo\n\nParágrafo\n    - [x] código indentado')
  assert.deepEqual(plan.progress, { done: 1, total: 2, percent: 50, status: 'doing' })
})
