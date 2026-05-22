# Cursor project layout (PakBuddy)

| Path | Purpose |
|------|---------|
| [rules/](rules/) | Project rules (`.mdc`) — auto-attached by glob or always-on |
| [commands/](commands/) | Slash commands — type `/` in chat (`next`, `next-local`) |
| [prompts/](prompts/) | Reusable prompt templates (e.g. summarize handover) |
| [skills/](skills/) | Agent skills (`skills/*/SKILL.md`) |

## Rules

| File | When |
|------|------|
| `project.mdc` | Always — repo context |
| `frontend.mdc` | `frontend/**` |
| `backend.mdc` | `backend/**` |
| `cursor_rules.mdc` | Editing `.cursor/rules/*.mdc` |
| `regression-external-first.mdc` | Pair/SSH skills |

## Commands

- **`/next`** — `commands/next.md` — status → commit → push
- **`/next-local`** — `commands/next-local.md` — local git summary only

`prompts/next.md` is deprecated; use the commands above.

## Skills

- **`connect_pair`** — SSH to Pair (`ssh pair-working`). Use when deploying or shell work on Pair; not required for local React/FastAPI dev.

## Prompts

- **`Prompts.md`** — ask clarifying questions before large changes
- **`Summarizing Chats.md`** — handover doc for a new chat
