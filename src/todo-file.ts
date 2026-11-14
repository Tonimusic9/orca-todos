// Parsing and editing TODO.md. Pure functions: no fs, no Orca, so tests cover them directly.
//
// Format (GitHub task list). Anything that is not a task line is kept as is.
//   - [ ] @me Add STRIPE_KEY to .env        <- a task the agent needs the person to do
//   - [ ] @agent Write the users migration  <- a task the agent does itself (the default)
//   - [x] @agent Add tests                  <- done

export type Owner = 'me' | 'agent'

export interface Task {
  /** Stable while the line is unchanged: `<line index>:<text>`. */
  id: string
  line: number
  done: boolean
  owner: Owner
  /** The task text without the checkbox or the owner tag. */
  text: string
}

const TASK = /^(\s*[-*+]\s+\[)([ xX])(\]\s+)(.*)$/
const TAG = /^@(me|agent)\b\s*/i

export const TODO_TEMPLATE = `# TODO

<!--
Shared task list between you and your coding agents, shown in Orca's Todos panel.

Agents: keep this list current as you work.
- Add tasks you plan to do as "- [ ] @agent <task>" and check them off ("- [x]") when done.
- When you need the person to do something by hand (a secret, an account, a manual
  check), add "- [ ] @me <task>" and carry on with other work or wait. When they check it
  off, you will get a message in your terminal starting with "[todos]".
- Only edit task lines; keep the rest of this file as it is.
-->

`

export function parseTasks(source: string): Task[] {
  const tasks: Task[] = []
  const lines = source.split(/\r?\n/)
  let inComment = false
  lines.forEach((raw, line) => {
    // Skip task-looking lines inside the HTML comment that documents the format.
    if (inComment) {
      if (raw.includes('-->')) inComment = false
      return
    }
    if (raw.includes('<!--') && !raw.includes('-->')) {
      inComment = true
      return
    }
    const match = TASK.exec(raw)
    if (!match) return
    const body = match[4].trim()
    const tag = TAG.exec(body)
    const owner: Owner = tag?.[1].toLowerCase() === 'me' ? 'me' : 'agent'
    const text = tag ? body.slice(tag[0].length).trim() : body
    tasks.push({ id: `${line}:${raw.trim()}`, line, done: match[2] !== ' ', owner, text })
  })
  return tasks
}

/**
 * Sets one task's checkbox. Returns null when the task is gone or its line changed since the
 * panel read it (an agent edited the file meanwhile), so the caller can re-read and retry.
 */
export function setTaskDone(source: string, id: string, done: boolean): string | null {
  const lines = source.split(/\r?\n/)
  const eol = source.includes('\r\n') ? '\r\n' : '\n'
  const index = lines.findIndex((raw, line) => `${line}:${raw.trim()}` === id)
  if (index === -1) return null
  const match = TASK.exec(lines[index])
  if (!match) return null
  lines[index] = `${match[1]}${done ? 'x' : ' '}${match[3]}${match[4]}`
  return lines.join(eol)
}

/** Appends a task at the end of the file (or makes a new file from the template). */
export function addTask(source: string | null, owner: Owner, text: string): string {
  const base = source ?? TODO_TEMPLATE
  const eol = base.includes('\r\n') ? '\r\n' : '\n'
  const clean = text.replace(/\s+/g, ' ').trim()
  const trimmed = base.replace(/\s+$/, '')
  return `${trimmed}${eol}${base === TODO_TEMPLATE || !parseTasks(base).length ? eol : ''}- [ ] @${owner} ${clean}${eol}`
}
