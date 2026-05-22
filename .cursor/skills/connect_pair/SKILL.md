---
name: connect_pair
description: >-
  Opens SSH to Pair Networks shell for TalkingHeadsPair using the host alias and key
  from the user SSH config. Use when the user asks to connect to Pair SSH, Pair shell,
  connect_pair, or SSH into Pair before other remote commands. Connection only — do not
  cd or assume a remote working path unless the user asks later. On failure: TCP timeout
  defaults to Pair reachability per regression-external-first; do not blame local network first.
---

# connect_pair — Pair SSH (TalkingHeadsPair)

## SSH (shell) — use this

**Always use the SSH config host alias** (do not guess `user@host` from SFTP env):

| Item | Value |
|------|--------|
| **Command** | `ssh pair-working` |
| **Resolves to** | `User working` @ `working.pairserver.com` with `IdentityFile` `C:/Users/paris/.ssh/id_ed25519_pair` |
| **Config** | `C:\Users\paris\.ssh\config` → `Host pair-working` |

Interactive session on the user’s PC:

```bash
ssh pair-working
```

Agent / one-shot (no auto `cd`):

```bash
ssh -o BatchMode=yes -o ConnectTimeout=15 pair-working "command"
```

Remote shell may show hostname `vps798.pairvps.com`; the SSH config target remains **`pair-working`** → `working.pairserver.com`.

## PakBuddy production (pakbuddystore.com)

When deploying or checking live files for **this repo**:

| Item | Path |
|------|------|
| **URL** | https://pakbuddystore.com/ |
| **Docroot (absolute)** | `/usr/home/working/public_html/pakbuddystore.com/` |
| **From SSH** | `cd ~/public_html/pakbuddystore.com/` |

Upload target: contents of `frontend/build/` after `yarn build:blog`. Details: [memory/DEPLOY.md](mdc:memory/DEPLOY.md).

## SFTP vs SSH (do not conflate)

| Purpose | User / host |
|---------|-------------|
| **FTP/SFTP** (VS Code `sftp.json`) | `SFTP_USER` (e.g. `working_talkingheads`) @ `working.pairserver.com` |
| **SSH shell** | `working` via alias **`pair-working`** and **`id_ed25519_pair`** |

If Pair ACC shows different shell settings, update `C:\Users\paris\.ssh\config` and this skill.

## When SSH fails (agents)

Follow **[regression-external-first.mdc](mdc:.cursor/rules/regression-external-first.mdc)**.

- **`Connection timed out` / no TCP to port 22:** Default explanation is **Pair reachability** (intermittent SSH, edge/routing, host overload, maintenance)—**not** the user’s firewall, VPN, or ISP. Do **not** open with a generic “check your network” checklist.
- **Assume local/environment regression** only if the user says something **on their side** changed, or they **explicitly** ask for local diagnostics.
- **`Permission denied (publickey)` / auth failure:** Key or server-side account/SSH config may be wrong; still **do not** prescribe `ssh -v`, config dumps, or credential traces unless the user requests that check.

Report the **exact** SSH stderr line, then **retry later** or **Pair ACC/status**—not a invented local root-cause story.

## Rules

1. **Connect only** — no `cd` to `/public_html` or any path unless the user asks.
2. **Pair only** — use **`pair-working`** for this project’s Pair shell. Do not use other skills’ hosts (e.g. `root@` IPs) unless the user names that host for that task.
3. **Do not** substitute other hosts or keys from unrelated skills.
4. **After connect**, wait for the user’s next instruction.
