# PakBuddy

Landing page and blog for **Pak Buddy** — reusable vacuum bags for commercial backpack vacuums (Floor Lord Industries).

## Stack

| Area | Tech |
|------|------|
| Frontend | React 19, CRA + craco, Tailwind, shadcn/ui |
| Backend | FastAPI, SQLAlchemy (async MySQL) |
| Content | Markdown blog → static HTML via `scripts/build-blog.js` |

Product notes and backlog: [`memory/PRD.md`](memory/PRD.md).

**Production:** https://pakbuddystore.com → `~/public_html/pakbuddystore.com/` on Pair. See [`memory/DEPLOY.md`](memory/DEPLOY.md).

## Development

### Frontend

```bash
cd frontend
yarn install
yarn start
```

Build for production (includes blog render):

```bash
cd frontend
yarn build:blog
```

Blog only:

```bash
cd frontend
yarn blog:render
```

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
# Copy and fill backend/.env (MYSQL_URL, CORS_ORIGINS, etc.)
uvicorn server:app --reload
```

## Cursor

| Folder | Use |
|--------|-----|
| [`.cursor/rules/`](.cursor/rules/) | Auto context (project, frontend, backend) |
| [`.cursor/commands/`](.cursor/commands/) | Slash commands: `/next`, `/next-local` |
| [`.cursor/prompts/`](.cursor/prompts/) | Reusable prompts (summarize chat, clarify before coding) |
| [`.cursor/skills/`](.cursor/skills/) | Skills e.g. `connect_pair` for Pair SSH |

Index: [`.cursor/README.md`](.cursor/README.md). Open the repo root in **Cursor** so rules and `/` commands load.

## Git

Remote: `origin` → GitHub (`TalkingHeadsJed/PakBuddy-`).

```bash
git status
git pull
git push
```

Do not commit `.env`, generated blog artifacts (`frontend/public/blog/`, `feed.xml`), or local agent config (`.gitconfig` at repo root).
