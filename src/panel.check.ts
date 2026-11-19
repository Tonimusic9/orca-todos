// O ORCA renderiza cada cenário com um workspace de fixture.
import { defineCheck } from 'orca/testing'
import { fileURLToPath } from 'node:url'

function scenario(folder: string, project: string) {
  const path = fileURLToPath(new URL(`../fixtures/${folder}`, import.meta.url))
  return {
    results: {
      'workspace.readContext': { workspaceId: 'w1', branch: 'main', displayName: 'main', terminals: [] },
      'workspace.list': {
        workspaces: [{ id: 'w1', kind: 'worktree', name: 'main', project, path, branch: 'main', hostId: 'local' }],
        truncated: false
      }
    }
  }
}

export default defineCheck({
  noWorkspace: {},
  tasks: scenario('sample', 'Projeto exemplo'),
  emptyPhase: scenario('other', 'Documentação')
})
