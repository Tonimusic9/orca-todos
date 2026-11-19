import { assert, mockHost, mount, test } from 'orca/testing'
import * as panel from './panel'
import type { ProgressState } from './protocol'
import { parseTasks } from './todo-file'

const base: ProgressState = {
  workspace: { id: 'w1', name: 'Projeto Orion' },
  problem: null,
  file: 'PLAN.md',
  candidates: ['PLAN.md'],
  plan: parseTasks('# Roteiro\n## Lançamento\n- [x] Planejar\n  - [x] Escrever\n- [ ] @doing Revisar\n## Fase vazia')
}

test('mostra totais, fases expansíveis e tarefas de somente leitura', async () => {
  const host = mockHost({ requests: { 'progress.get': () => base } })
  const view = await mount(panel, { host })
  try {
    assert.ok(view.find({ text: 'Projeto Orion' }))
    assert.ok(view.find({ text: '50%' }))
    assert.ok(view.find({ text: '1 de 2 tarefas concluídas' }))
    assert.ok(view.find({ text: 'PLAN.md' }))
    assert.ok(view.find({ text: 'Escrever' }))
    assert.ok(view.find({ text: 'Revisar' }))
    assert.ok(view.find({ text: 'Sem tarefas' }))
    assert.equal(view.findAll({ type: 'Checkbox' }).length, 0)
    assert.equal(view.findAll({ type: 'Button' }).length, 0)
    await view.toggle({ type: 'Collapsible', text: /Lançamento/ })
    assert.equal(view.find({ text: 'Escrever' }), null)
    assert.deepEqual(view.errors, [])
    assert.deepEqual(view.warnings, [])
  } finally {
    await view.unmount()
  }
})

test('recebe atualizações do worker e sinaliza quando os números são antigos', async () => {
  const host = mockHost({ requests: { 'progress.get': () => base } })
  const view = await mount(panel, { host })
  try {
    await view.post('progress.changed', { ...base, problem: 'Erro de leitura' })
    assert.ok(view.find({ type: 'Callout', text: /Erro de leitura/ }))
    assert.ok(view.find({ text: 'Última leitura válida' }))
    await view.post('progress.changed', { ...base, plan: null, file: null, candidates: [] })
    assert.ok(view.find({ type: 'EmptyState', label: 'Nenhum plano Markdown com checkboxes encontrado' }))
    assert.equal(view.find({ text: '50%' }), null)
  } finally {
    await view.unmount()
  }
})

test('oferece a escolha canônica apenas quando há mais de um plano', async () => {
  const picks: unknown[] = []
  const host = mockHost({
    requests: {
      'progress.get': () => ({ ...base, candidates: ['PLAN.md', 'TODO.md'] }),
      'progress.select': (input) => {
        picks.push(input)
        return { ...base, file: 'TODO.md' }
      }
    }
  })
  const view = await mount(panel, { host })
  try {
    await view.select({ label: 'Plano canônico' }, 'TODO.md')
    assert.deepEqual(picks, [{ workspaceId: 'w1', file: 'TODO.md' }])
    assert.ok(view.find({ text: 'TODO.md' }))
  } finally {
    await view.unmount()
  }
})
