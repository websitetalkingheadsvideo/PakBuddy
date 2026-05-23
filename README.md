# Put PakBuddy on pakbuddystore.com

**Live:** https://pakbuddystore.com (use **http** until SSL is enabled in Pair ACC)

**Your server folder (SSH):** `~/public_html/pakbuddystore.com/`  
**Login:** `ssh pair-working` — key/config in `C:\Users\paris\.ssh\` (see `Host pair-working`)

---

## Update the live site

**Easiest:** In Cursor Agent, type `deploy pakbuddystore` (build + upload + fix permissions).

**Manual (PowerShell):**

```powershell
cd C:\Users\paris\PakBuddy\frontend
npm install --legacy-peer-deps
$env:NODE_PATH = ".\node_modules"
node ..\scripts\build-blog.js
npm run build
cd build
scp -r * pair-working:public_html/pakbuddystore.com/
ssh pair-working "chmod -R a+rX public_html/pakbuddystore.com"
```

Hard refresh the browser after deploy (**Ctrl+Shift+R**).

---

## More docs (from upstream)

| Doc | Use when |
|-----|----------|
| [`memory/DEPLOY.md`](memory/DEPLOY.md) | **Your** Pair shared-hosting path (what we actually use) |
| [`DEPLOY.md`](DEPLOY.md) | Full VPS setup (Apache, MySQL, systemd) — different layout (`/var/www/…`) |
| [`memory/PRD.md`](memory/PRD.md) | Product scope and backlog |
| [`content/blog/README.md`](content/blog/README.md) | Writing blog posts |

Upstream also added `deploy/` configs and `scripts/strip-platform.js` (removes Emergent badge/scripts on production build).

---

## Git

- **Your repo:** https://github.com/websitetalkingheadsvideo/PakBuddy (`origin`)
- **Original:** `TalkingHeadsJed/PakBuddy-` (`upstream`) — pull with `git fetch upstream && git merge upstream/main`
