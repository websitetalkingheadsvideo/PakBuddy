# PakBuddy — production deploy (Pair)

## Site

| Item | Value |
|------|--------|
| **URL** | https://pakbuddystore.com/ |
| **Document root (absolute)** | `/usr/home/working/public_html/pakbuddystore.com/` |
| **From SSH home** | `~/public_html/pakbuddystore.com/` |

Pair maps the domain to that folder. Static files (built React + blog output) go **in the docroot**, not in a subdirectory.

## Build (local)

```bash
cd frontend
yarn install
yarn build:blog
```

Artifacts to upload: everything under `frontend/build/` (includes `index.html`, `static/`, `images/`, generated `blog/`, `feed.xml`, `sitemap.xml` when blog build ran).

## Upload

- **SFTP** user/host: see VS Code SFTP config or Pair ACC (often `working_talkingheads` @ `working.pairserver.com`).
- **SSH shell**: `ssh pair-working` → then `cd ~/public_html/pakbuddystore.com/`
- **rsync/scp example** (from repo root, after build):

```bash
scp -r frontend/build/* pair-working:public_html/pakbuddystore.com/
```

Adjust if your SSH config uses a different remote path alias.

## Backend

`backend/` (FastAPI) is **not** served from this docroot unless you add a separate Pair app/subdomain. Current production is frontend-static only per `memory/PRD.md`.

## Do not upload

- `node_modules/`, source `src/`, `.env`, unbuilt repo files
- Commit secrets or overwrite unrelated sites under `public_html/`
