// `orca plugin check` renders the panel once per scenario against a stand-in host.
import { defineCheck } from 'orca/testing'

const sample = new URL('../fixtures/sample', import.meta.url).pathname

export default defineCheck({
  noWorkspace: {},
  tasks: {
    results: {
      'workspace.readContext': { branch: 'main', displayName: 'main', terminals: [] },
      'workspace.list': {
        workspaces: [{ id: 'w1', kind: 'worktree', name: 'main', path: sample, branch: 'main', hostId: 'local' }],
        truncated: false
      },
      'agents.list': {
        agents: [
          { terminalId: 't1', title: 'Claude', agent: 'claude', state: 'working', stateStartedAt: 0 },
          { terminalId: 't2', title: 'Codex', agent: 'codex', state: 'waiting', stateStartedAt: 0 }
        ]
      }
    }
  }
})
