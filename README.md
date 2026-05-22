# Put PakBuddy on pakbuddystore.com

**Checked:** The server folder exists but is **empty**. The site cannot work until files are uploaded there. This is a first deploy, not an update.

**Upload to (SSH):** `~/public_html/pakbuddystore.com/`  
**URL:** https://pakbuddystore.com

---

## How you log in (SSH only)

Already set up on your PC — not in this Git repo:

| What | Where |
|------|--------|
| SSH settings | `C:\Users\paris\.ssh\config` — look for `Host pair-working` |
| Private key | `C:\Users\paris\.ssh\id_ed25519_pair` |
| Open a shell on Pair | In any terminal: `ssh pair-working` |

No password file in the project — login is the key above.

---

## What has to happen (two steps)

1. **Build** the website on your PC → creates a folder `frontend\build\` full of HTML/JS/images.  
2. **Copy** everything inside `frontend\build\` into `~/public_html/pakbuddystore.com/` on the server (over SSH, not FileZilla).

You said you don’t want to fight the terminal. **In Cursor Agent chat, type:**

```text
deploy pakbuddystore
```

The agent should run the build and upload for you. If it errors, paste the error back — don’t guess.

---

## If you must do it yourself (copy/paste)

**Build (PowerShell, once per machine):**

```powershell
cd C:\Users\paris\PakBuddy\frontend
npm install
$env:NODE_PATH = ".\node_modules"
node ..\scripts\build-blog.js
npm run build
```

**Upload (PowerShell, after build succeeds):**

```powershell
cd C:\Users\paris\PakBuddy\frontend\build
scp -r * pair-working:public_html/pakbuddystore.com/
```

**Check on server:**

```powershell
ssh pair-working "ls public_html/pakbuddystore.com/"
```

You should see `index.html` and folders like `static` and `images`.

Then open https://pakbuddystore.com in a browser.

---

## Nothing else in this file on purpose

No repo map, no backlog, no editor setup. Product/deploy details for admins: `memory/DEPLOY.md` and `memory/PRD.md`.
