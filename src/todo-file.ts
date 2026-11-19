// Parser do plano Markdown, derivado da leitura de checkboxes de orca-todos.
export type TaskStatus = 'done' | 'doing' | 'pending'
export type Progress = { done: number; total: number; percent: number; status: TaskStatus | 'empty' }

export type Task = {
  kind: 'task'
  id: number
  text: string
  status: TaskStatus
  children: Task[]
}

export type Phase = {
  kind: 'phase'
  id: number
  title: string
  items: (Task | Phase)[]
  progress: Progress
}

export type Plan = { phases: Phase[]; progress: Progress }

const TASK = /^[-*+]\s+\[([ xX])\]\s+(.*)$/
const TAG = /^@(me|agent|doing)(?=\s|$)\s*/i
const HEADING = /^ {0,3}(#{1,6})(?:[ \t]+(.*?)\s*)?$/
const LIST = /^([-*+]|\d{1,9}[.)])([ \t]+)\S/
const FENCE = /^(`{3,}|~{3,})(.*)$/

function progress(done: number, total: number, active: boolean): Progress {
  return {
    done,
    total,
    percent: total ? Math.round((100 * done) / total) : 0,
    status: total === 0 ? 'empty' : done === total ? 'done' : done || active ? 'doing' : 'pending'
  }
}

function summarize(items: (Task | Phase)[]): Progress {
  let done = 0
  let total = 0
  let active = false
  for (const item of items) {
    if (item.kind === 'phase') {
      item.progress = summarize(item.items)
      done += item.progress.done
      total += item.progress.total
      active ||= item.progress.status === 'doing'
    } else if (item.children.length) {
      const children = summarize(item.children)
      done += children.done
      total += children.total
      active ||= item.status === 'doing' || children.status === 'doing'
    } else {
      total++
      if (item.status === 'done') done++
      active ||= item.status === 'doing'
    }
  }
  return progress(done, total, active)
}

function newPhase(id: number, title: string): Phase {
  return { kind: 'phase', id, title, items: [], progress: progress(0, 0, false) }
}

function columns(prefix: string): number {
  let width = 0
  for (const char of prefix) width += char === '\t' ? 4 - width % 4 : 1
  return width
}

export function parseTasks(source: string): Plan {
  const phases: Phase[] = []
  const headings: { level: number; phase: Phase }[] = []
  const list: { contentIndent: number; task?: Task }[] = []
  let fence: string | undefined
  let inComment = false
  let hasTitle = false

  source.replace(/^\uFEFF/, '').split(/\r?\n/).forEach((raw, id) => {
    if (fence) {
      const closing = FENCE.exec(raw.trim())
      if (closing && closing[1][0] === fence[0] && closing[1].length >= fence.length && !closing[2].trim()) {
        fence = undefined
      }
      return
    }

    // Remove comentários antes de procurar cabeçalhos e checkboxes.
    let line = raw
    if (inComment) {
      const end = line.indexOf('-->')
      if (end < 0) return
      line = line.slice(end + 3)
      inComment = false
    }
    line = line.replace(/<!--.*?-->/g, '')
    const comment = line.indexOf('<!--')
    if (comment >= 0) {
      inComment = true
      line = line.slice(0, comment)
    }
    if (!line.trim()) return

    const indentation = columns(/^[ \t]*/.exec(line)![0])
    while (list.length && indentation < list.at(-1)!.contentIndent) list.pop()
    if (indentation >= (list.at(-1)?.contentIndent ?? 0) + 4) return

    const body = line.trimStart()
    const opening = FENCE.exec(body)
    if (opening && (opening[1][0] === '~' || !opening[2].includes('`'))) {
      fence = opening[1]
      return
    }
    const heading = !list.length && HEADING.exec(line)
    if (heading) {
      const level = heading[1].length
      const title = (heading[2] ?? '').replace(/(?:^|\s+)#+$/, '').trim()
      if (level === 1 && !hasTitle && !phases.length) {
        hasTitle = true
        return
      }
      while (headings.length && headings.at(-1)!.level >= level) headings.pop()
      const phase = newPhase(id, title || 'Fase sem título')
      const parent = headings.at(-1)?.phase
      if (parent) parent.items.push(phase)
      else phases.push(phase)
      headings.push({ level, phase })
      return
    }

    const marker = LIST.exec(body)
    if (!marker) return
    const contentIndent = columns(line.slice(0, line.length - body.length) + marker[1] + marker[2])
    const parent = list.at(-1)?.task
    const match = TASK.exec(body)
    if (!match) {
      list.push({ contentIndent, task: parent })
      return
    }
    let text = match[2].trim()
    let active = false
    for (let tag = TAG.exec(text); tag; tag = TAG.exec(text)) {
      active ||= tag[1].toLowerCase() === 'doing'
      text = text.slice(tag[0].length)
    }
    if (!text) {
      list.push({ contentIndent, task: parent })
      return
    }
    const task: Task = {
      kind: 'task', id, text, status: match[1] !== ' ' ? 'done' : active ? 'doing' : 'pending', children: []
    }
    if (parent) parent.children.push(task)
    else {
      if (!headings.length && phases.at(-1)?.id !== -1) phases.push(newPhase(-1, 'Tarefas gerais'))
      const phase = headings.at(-1)?.phase ?? phases.at(-1)!
      phase.items.push(task)
    }
    list.push({ contentIndent, task })
  })

  return { phases, progress: summarize(phases) }
}
