# /next — status, commit, push

Run this workflow for **PakBuddy** when the user invokes `/next`.

## 1. Status

```bash
git status
git diff --stat
```

Summarize what changed (frontend, backend, content, `.cursor/`).

## 2. Commit (only if there are changes)

- Do **not** commit `.env`, secrets, `frontend/public/blog/`, `feed.xml`, or generated artifacts.
- Match recent commit message style (`git log -5 --oneline`).
- One concise message focused on **why**.

Stage relevant files, commit, then `git status` to confirm.

## 3. Push

```bash
git push origin HEAD
```

Report branch, commit hash, and push result. If push fails, show the error and stop — do not force-push.

## Rules

- Never amend or force-push unless the user explicitly asked in this chat.
- Never skip git hooks (`--no-verify`).
- If nothing to commit, say so and still push only if the branch is ahead of `origin`.
