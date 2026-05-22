# Pak Buddy — Website

The marketing site for **Pak Buddy™**, the patented reusable replacement for disposable backpack vacuum bags. Built and maintained by **The Floor Lord**.

Live at: **https://pakbuddystore.com**

---

## Stack at a glance

- **Frontend**: React (CRA + craco) → builds to static HTML/CSS/JS
- **Backend**: FastAPI (Python) → tiny service for fleet-inquiry submissions, behind an Apache reverse proxy
- **Database**: MySQL (MariaDB) — single table, `fleet_inquiries`
- **Blog**: Markdown files in `/content/blog/` → rendered to static HTML at build time by `scripts/build-blog.js`. No CMS, no database.
- **Hosting**: pair.com VPS, Apache 2.4, Let's Encrypt SSL

---

## Repo layout

```
.
├── backend/                  FastAPI app (fleet-inquiry + admin)
├── content/blog/             Markdown blog posts (source of truth)
├── deploy/                   Apache vhost, systemd unit, env template
├── frontend/                 React app + static assets
├── scripts/                  Build helpers (blog renderer, platform stripper)
├── DEPLOY.md                 Full step-by-step deploy guide
└── README.md
```

---

## Deploying / updating the live site

See **[DEPLOY.md](./DEPLOY.md)** — written so a non-expert can follow it end-to-end.

The two commands you'll use most:

```bash
# Add or update a blog post (Markdown only — write it in GitHub's web editor):
#   1. drop a new .md file in content/blog/
#   2. SSH to the VPS and run:
sudo -i -u pakbuddy
cd /var/www/pakbuddystore.com && git pull
cd frontend && yarn build:blog

# Push a code change:
git push origin main
# then on the VPS:
sudo /var/www/pakbuddystore.com/deploy/redeploy.sh
```

---

## Local development

```bash
# Backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# create a local backend/.env (see deploy/backend.env.example)
uvicorn server:app --reload --port 8001

# Frontend (new terminal)
cd frontend
yarn install
yarn blog:render          # render blog posts once
yarn start                # CRA dev server on http://localhost:3000
```

---

## Writing a blog post

See **[content/blog/README.md](./content/blog/README.md)**. Short version: copy the template, fill in the frontmatter, commit to GitHub, redeploy.

Posts with `publish_date` in the future are automatically excluded from the build — useful for scheduling.

---

## Security posture

This site has been hardened against the breach patterns we've seen elsewhere:

- **No live admin UI.** Blog authoring is via GitHub commits, gated by your 2FA — not by a server-side login.
- **No file upload endpoints.** Images are committed to the repo.
- **Form submissions** are rate-limited per-IP, honeypot-screened, and length-capped before they ever touch MySQL.
- **API listing endpoints** require a Bearer token; without it they return 404 (not 401), so they can't be enumerated.
- **Markdown sanitization** is strict — no `<script>` tags survive the build, ever.
- **Security headers** (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy) are set at both the FastAPI layer and the Apache layer (defence-in-depth).

Full security checklist is at the bottom of `DEPLOY.md`.
