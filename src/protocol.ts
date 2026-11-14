// The panel <-> worker contract, declared once: src/panel.tsx and src/worker.ts both read it.
import type { Owner, Task } from './todo-file'

export type { Owner, Task }

export interface AgentInfo {
  terminalId: string
  /** What the panel shows: the terminal title, else the agent kind. */
  label: string
  agent: string | null
  state: 'working' | 'blocked' | 'waiting' | 'done'
}

export interface QueuedMessage {
  id: string
  terminalId: string
  agentLabel: string
  /** The task the person checked off, for the panel to show. */
  taskText: string
  text: string
  createdAt: number
}

export interface TodoState {
  /** null when no workspace is focused. */
  workspace: { name: string; path: string } | null
  /** Several workspaces match the focused one; the person picks which (see `todos.pick`). */
  choices: { id: string; name: string; path: string }[]
  /** Why the list cannot be shown (remote workspace, unreadable file). */
  problem: string | null
  /** False when the workspace has no TODO.md yet. */
  exists: boolean
  tasks: Task[]
  agents: AgentInfo[]
  queue: QueuedMessage[]
}

declare module 'orca' {
  interface PluginRequests {
    'todos.get': { output: TodoState }
    /** Checks or unchecks a task with no message (agent tasks, or "check off only"). */
    'todos.setDone': { input: { id: string; done: boolean }; output: TodoState }
    /** Checks off a task and queues a message for one agent, sent once that agent is idle. */
    'todos.confirm': { input: { id: string; terminalId: string }; output: TodoState }
    'todos.add': { input: { owner: Owner; text: string }; output: TodoState }
    'todos.create': { output: TodoState }
    /** Queues a short explanation of TODO.md for an agent that has not seen it. */
    'todos.brief': { input: { terminalId: string }; output: TodoState }
    /** Says which of `choices` the focused workspace is. */
    'todos.pick': { input: { workspaceId: string }; output: TodoState }
    'todos.cancelQueued': { input: { id: string }; output: TodoState }
  }
  interface PluginPanelEvents {
    /** Posted to every open panel whenever the file, the agents or the queue change. */
    'todos.changed': TodoState
  }
}
