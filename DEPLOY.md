# Pak Buddy — Deployment Guide (pair.com VPS)

This is the complete, step-by-step guide to deploy `pakbuddystore.com` to a pair Networks VPS. It assumes the VPS is freshly provisioned with Debian or Ubuntu. If your VPS is different, adjust package names (e.g. `dnf` instead of `apt`) but the flow is identical.

> Total time end-to-end: ~30 minutes. You don't have to be an expert — just follow the steps in order.

---

## 1. What you're deploying

There are **two things** running on the VPS:

| Piece | What it is | Lives where |
|---|---|---|
| **Frontend** | The static React landing page + blog | `/var/www/pakbuddystore.com/frontend/build/` |
| **Backend** | A small FastAPI service that receives fleet-inquiry form submissions and writes them to MySQL | `127.0.0.1:8001` (only the local Apache can talk to it) |

Apache sits in front and routes:
- `/api/...` → backend on port 8001
- everything else → static files

---

## 2. Prerequisites on the VPS

SSH in as a sudo user, then install:

```bash
sudo apt update
sudo apt install -y \
    apache2 \
    mariadb-server \
    python3 python3-venv python3-pip \
    git curl ca-certificates \
    certbot python3-certbot-apache

# Enable Apache modules we'll need
sudo a2enmod proxy proxy_http rewrite headers ssl deflate expires
sudo systemctl restart apache2
```

Install **Node.js 20** + **Yarn**:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs
sudo corepack enable
sudo corepack prepare yarn@1.22.22 --activate
node --version   # should print v20.x
yarn --version   # should print 1.22.x
```

Create a dedicated unprivileged user for the app (better than running as root):

```bash
sudo useradd -m -s /bin/bash pakbuddy
sudo mkdir -p /var/www/pakbuddystore.com
sudo chown -R pakbuddy:pakbuddy /var/www/pakbuddystore.com
```

---

## 3. Set up MySQL

Lock down MariaDB and create the app's database + user:

```bash
sudo mysql_secure_installation        # follow the prompts; set a strong root password
```

```bash
sudo mysql -u root -p
```

Inside the MySQL prompt:

```sql
CREATE DATABASE pakbuddy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pakbuddy'@'localhost' IDENTIFIED BY 'CHOOSE_A_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON pakbuddy.* TO 'pakbuddy'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Write the password down — you'll paste it into `.env` in a minute.

---

## 4. Clone the repo

Switch to the `pakbuddy` user and clone:

```bash
sudo -i -u pakbuddy
cd /var/www/pakbuddystore.com
git clone https://github.com/YOUR_USER/YOUR_REPO.git .
ls
# you should see: backend  content  deploy  frontend  scripts  DEPLOY.md  README.md  .gitignore
```

---

## 5. Configure the backend

```bash
cd /var/www/pakbuddystore.com/backend

# Create a Python virtualenv (keeps deps isolated from system Python)
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Create the .env file (NEVER commit this)
cp ../deploy/backend.env.example .env
nano .env
```

Edit `.env` and fill in:

- `MYSQL_URL` — replace `REPLACE_USER`, `REPLACE_PASSWORD`, `REPLACE_DB` with your real values from step 3. Example:
  ```
  MYSQL_URL="mysql+aiomysql://pakbuddy:YourStrongPasswordHere@127.0.0.1:3306/pakbuddy"
  ```
- `ADMIN_TOKEN` — generate one and paste it in:
  ```bash
  openssl rand -hex 32
  ```
  Save this token in your password manager — you'll need it to read fleet inquiries later.
- `CORS_ORIGINS` — leave as is (it's already set to your domains).

Save (`Ctrl+O`, `Enter`, `Ctrl+X`).

Verify the backend starts manually:

```bash
cd /var/www/pakbuddystore.com/backend
source venv/bin/activate
uvicorn server:app --host 127.0.0.1 --port 8001
```

You should see `Pak Buddy backend started; MySQL schema ensured.` Stop it with `Ctrl+C`.

---

## 6. Make the backend run as a service

This makes uvicorn start automatically on boot and restart if it crashes.

```bash
exit                                                    # exit the pakbuddy user shell
sudo cp /var/www/pakbuddystore.com/deploy/pakbuddy-backend.service \
        /etc/systemd/system/pakbuddy-backend.service
sudo systemctl daemon-reload
sudo systemctl enable --now pakbuddy-backend
sudo systemctl status pakbuddy-backend          # should say active (running)
```

Quick test:

```bash
curl http://127.0.0.1:8001/api/
# → {"message":"Pak Buddy API up"}
```

If something fails, view logs with:
```bash
sudo journalctl -u pakbuddy-backend -n 100 --no-pager
```

---

## 7. Build the frontend (this is the build command — write it down)

```bash
sudo -i -u pakbuddy
cd /var/www/pakbuddystore.com/frontend
yarn install
yarn build:blog
```

**`yarn build:blog`** is the magic command. It does three things in order:

1. Renders every `.md` file in `/content/blog/` into static HTML pages under `frontend/public/blog/`
2. Runs `craco build` to bundle the React landing page into `frontend/build/`
3. Strips Emergent dev-environment scripts (analytics, badge, etc.) from `build/index.html`

When it finishes you'll have a `frontend/build/` directory — that's the live website.

---

## 8. Apache: point the domain at the build folder

```bash
exit                                                    # back to sudo user
sudo cp /var/www/pakbuddystore.com/deploy/apache-vhost.conf \
        /etc/apache2/sites-available/pakbuddystore.com.conf
sudo a2ensite pakbuddystore.com.conf
sudo a2dissite 000-default.conf       # optional: turn off the default site
sudo apachectl configtest              # should say Syntax OK
sudo systemctl reload apache2
```

---

## 9. Get the SSL certificate

```bash
sudo certbot --apache -d pakbuddystore.com -d www.pakbuddystore.com
```

Follow the prompts. Certbot will:
- Get a free Let's Encrypt cert
- Update the Apache config to use it
- Set up auto-renewal

Verify in a browser: `https://pakbuddystore.com` should load the site with a valid green padlock.

---

## 10. Smoke test everything

From your laptop (not the VPS):

```bash
curl -I https://pakbuddystore.com/                                # → 200, HTML
curl -I https://pakbuddystore.com/blog/                           # → 200, HTML
curl -I https://pakbuddystore.com/blog/reused-disposable-bags-killing-vacuum-motor/  # → 200
curl -I https://pakbuddystore.com/feed.xml                        # → 200, XML
curl -I https://pakbuddystore.com/sitemap.xml                     # → 200, XML
curl -I https://pakbuddystore.com/robots.txt                      # → 200
curl    https://pakbuddystore.com/api/                            # → {"message":"Pak Buddy API up"}
```

Submit a real fleet inquiry from the form on the live page. Then on the VPS:

```bash
sudo mysql -u pakbuddy -p pakbuddy -e "SELECT id, name, email, company, created_at FROM fleet_inquiries ORDER BY created_at DESC LIMIT 5;"
```

If you see your submission, you're done. 🎉

---

## How to add a new blog post (after launch)

You don't need to SSH to the VPS for normal posts — you just write Markdown in GitHub:

1. Open `https://github.com/YOUR_USER/YOUR_REPO/tree/main/content/blog` in your browser.
2. Click **Add file → Create new file**.
3. Name it `your-post-slug.md` (kebab-case, lowercase).
4. Paste the template from `content/blog/README.md` and write your post.
5. Commit to `main`.

Then redeploy the site. The simplest way: SSH to the VPS and run

```bash
sudo -i -u pakbuddy
cd /var/www/pakbuddystore.com
git pull
cd frontend
yarn build:blog
```

Or run the helper script in step 12 below.

---

## How to view fleet inquiries

**Option A — direct database (easiest):**

```bash
sudo mysql -u pakbuddy -p pakbuddy -e \
  "SELECT created_at, name, email, company, crews, message FROM fleet_inquiries ORDER BY created_at DESC;"
```

**Option B — over HTTPS with your admin token:**

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN_FROM_ENV" \
  https://pakbuddystore.com/api/fleet-inquiry
```

(No admin UI is exposed on the live site — by design.)

---

## 11. The "update the site" workflow (you'll use this constantly)

After launch, whenever you push a change to GitHub:

```bash
sudo -i -u pakbuddy
cd /var/www/pakbuddystore.com
git pull origin main
cd frontend
yarn install --frozen-lockfile    # only needed if package.json changed
yarn build:blog
exit
sudo systemctl restart pakbuddy-backend    # only needed if backend/ changed
```

That's it. Apache picks up the new `build/` files immediately (they replace the old ones in place).

---

## 12. Optional: one-command redeploy script

Save this as `/var/www/pakbuddystore.com/deploy/redeploy.sh` and `chmod +x` it. Then any update is just `sudo /var/www/pakbuddystore.com/deploy/redeploy.sh`.

```bash
#!/usr/bin/env bash
set -e
cd /var/www/pakbuddystore.com
sudo -u pakbuddy git pull origin main
sudo -u pakbuddy bash -c "cd frontend && yarn install --frozen-lockfile && yarn build:blog"
if git diff --name-only HEAD@{1} HEAD | grep -q '^backend/'; then
    systemctl restart pakbuddy-backend
    echo "Backend restarted."
fi
echo "Deploy complete."
```

---

## 13. Backups (do this before you forget)

**MySQL nightly dump** — add to root's crontab (`sudo crontab -e`):

```cron
0 3 * * * mysqldump -u root -pYOUR_ROOT_PASSWORD pakbuddy | gzip > /var/backups/pakbuddy-$(date +\%Y\%m\%d).sql.gz && find /var/backups -name "pakbuddy-*.sql.gz" -mtime +30 -delete
```

The site itself is in Git, so a repo clone is your "backup" for code.

---

## 14. Common problems

| Symptom | Likely cause | Fix |
|---|---|---|
| `https://pakbuddystore.com/api/` returns **502 Bad Gateway** | Backend isn't running | `sudo systemctl status pakbuddy-backend` then check `journalctl -u pakbuddy-backend -n 50` |
| Form submits but inquiry doesn't appear in DB | `MYSQL_URL` wrong in `backend/.env` | Re-check creds, then `sudo systemctl restart pakbuddy-backend` |
| Form returns **CORS error** in browser console | Domain not in `CORS_ORIGINS` | Edit `backend/.env`, add the domain to `CORS_ORIGINS`, restart backend |
| Browser shows old version of the site after deploy | Apache cached HTML | Hard refresh (Ctrl+Shift+R). The `Cache-Control` headers we set keep HTML cache short (5 min) |
| `yarn build:blog` fails with "marked not found" | Forgot `yarn install` | `cd frontend && yarn install && yarn build:blog` |
| Certbot renewal fails | Apache config not pristine | `sudo certbot renew --dry-run` shows the real error |
| New blog post not appearing | You pushed Markdown but didn't redeploy | Run the redeploy script in §12 |

---

## 15. Where everything lives at a glance

```
/var/www/pakbuddystore.com/
├── backend/                          # FastAPI service
│   ├── .env                          # ← secrets (NEVER commit)
│   ├── server.py
│   ├── requirements.txt
│   └── venv/                         # Python virtualenv (gitignored)
├── content/blog/                     # Markdown blog posts (source of truth)
│   ├── README.md
│   └── *.md
├── deploy/                           # Reference configs (this folder)
│   ├── apache-vhost.conf
│   ├── pakbuddy-backend.service
│   └── backend.env.example
├── frontend/
│   ├── public/                       # Static assets (images, fonts)
│   │   └── images/                   # All site images — hosted from here, not Emergent
│   ├── src/                          # React source
│   ├── build/                        # ← what Apache actually serves (created by yarn build:blog)
│   └── package.json
├── scripts/
│   ├── build-blog.js                 # Markdown → HTML renderer
│   └── strip-platform.js             # Removes Emergent dev scripts from production HTML
├── .gitignore
├── DEPLOY.md                         # ← this file
└── README.md
```

---

## 16. Security checklist (you've already got most of this)

- [x] Backend bound to `127.0.0.1` only — not exposed to the internet directly
- [x] All API requests gated by Apache reverse proxy
- [x] Rate limiting on the fleet-inquiry endpoint (5/IP/hr)
- [x] Honeypot field in the form silently discards bot submissions
- [x] Admin endpoint requires Bearer token, returns 404 if token unset
- [x] HSTS / X-Frame-Options / X-Content-Type-Options headers at both backend and Apache
- [x] No `<script>` allowed in blog posts (sanitized at build time)
- [x] No admin panel on the live server — blog authoring goes through GitHub's auth
- [x] Server identity headers stripped
- [ ] **You do:** keep `backend/.env` outside Git (already in `.gitignore`)
- [ ] **You do:** rotate `ADMIN_TOKEN` if anyone sees it
- [ ] **You do:** set up the MySQL backup cron in §13

---

That's everything. If your web guy hits a snag, the troubleshooting table in §14 plus `journalctl -u pakbuddy-backend` and `tail /var/log/apache2/pakbuddystore.error.log` will surface 90% of issues immediately.
