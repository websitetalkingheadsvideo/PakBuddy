# /next-local — local git check (no network)

For **PakBuddy** when the user invokes `/next-local`. **No** `git fetch`, `git pull`, or `git push`.

## Steps

```bash
git status
git diff --stat
git log -5 --oneline
```

## Report

- Branch name and whether it tracks `origin`
- Staged / unstaged / untracked summary
- Suggested commit message **if** there are uncommitted changes (do not commit unless the user asks)
- Whether the branch appears ahead/behind remote **only if** `git status` already shows tracking info (do not fetch)
