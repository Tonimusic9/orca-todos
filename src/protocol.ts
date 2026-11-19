// Contrato compartilhado pelo painel e pelo worker.
import type { Plan } from './todo-file'

export type ProgressState = {
  workspace: { id: string; name: string } | null
  file: string | null
  candidates: string[]
  plan: Plan | null
  problem: string | null
}

declare module 'orca' {
  interface PluginRequests {
    'progress.get': { output: ProgressState }
    'progress.select': { input: { workspaceId: string; file: string }; output: ProgressState }
  }
  interface PluginPanelEvents {
    'progress.changed': ProgressState
  }
}
