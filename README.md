# Todos for Orca

A sidebar panel that shows the focused worktree's `TODO.md`, shared between you and your coding agents. It works with any agent, because agents just edit a markdown file.

- **Agents** add tasks as they work and check them off when done. The panel updates live.
- **Tasks for you** (`@me`): when you check one off, a confirm step asks which agent to tell. The message is queued and typed into that agent's terminal once it is idle (never mid-turn, never into a permission prompt).

## TODO.md format

```markdown
- [ ] @agent Write the users migration   <- the agent does it (untagged also means agent)
- [ ] @me Add STRIPE_KEY to .env         <- the agent needs you to do it
- [x] @agent Add tests                   <- done
```

All other lines are left as they are. "Create TODO.md" in the panel writes a header comment that explains the format to agents.

## Teaching agents the format

Either press **Brief** next to an agent in the panel's "Agents here" section, or add this to your `AGENTS.md` / `CLAUDE.md`:

```markdown
## Task list
Keep `TODO.md` at the worktree root current as you work. Add tasks you plan to do as
`- [ ] @agent <task>` and check them off when done. When you need me to do something by hand,
add `- [ ] @me <task>`; when I check it off you will get a terminal message starting with `[todos]`.
```

## How it works

- `src/worker.ts`: a Node worker that finds the focused worktree, watches `TODO.md`, edits it, and keeps the message queue in plugin storage (so it survives restarts).
- `src/panel.tsx`: the components panel.
- `src/todo-file.ts`: parsing and editing, pure functions.

Orca identifies the focused workspace only by display name and branch. When several projects share them (lots of `main`s), the worker uses agent events (which carry the workspace id) to tell them apart. If that isn't enough, the panel asks once and remembers the answer through that workspace's terminals.

## Develop

```sh
npm install
npm run typecheck
npm test                       # orca plugin test + orca plugin check
orca plugin dev load . --json  # load into Orca (asks for approval the first time)
```
