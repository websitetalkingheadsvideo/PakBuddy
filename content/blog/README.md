# How to write a Pak Buddy blog post

This folder holds the source for every blog post on `pakbuddystore.com/blog`.

## Author a new post (the secure way)

1. Go to your repo on **github.com** in your browser (signed in with 2FA enabled).
2. Navigate to `content/blog/`.
3. Click **Add file → Create new file**.
4. Name it like `your-post-slug.md` (use kebab-case — no spaces, lowercase).
5. Paste the template below and replace the contents.
6. Commit → the next site build renders it as static HTML → post is live.

That's it. No login on the live server. No admin UI. No file upload endpoints.
All authoring goes through GitHub's auth + audit trail.

---

## Post template — copy this and edit

```markdown
---
title: "Your post title here (this becomes the H1 and the <title> tag)"
slug: "your-post-slug"            # MUST match the filename without .md
excerpt: "One- or two-sentence preview shown on the /blog index page and in social previews. ~155 chars max for clean Google snippets."
hero_image: "/images/blog/your-hero.jpg"   # 1200x630 recommended. Drop into /frontend/public/images/blog/ via GitHub.
hero_alt: "Descriptive alt text for the hero image — important for SEO + accessibility."
author: "The Floor Lord"
tags: ["backpack vacuum", "savings"]      # 1–4 lowercase tags for grouping
publish_date: "2026-05-21"        # ISO date. Future dates = scheduled (post hidden until then).
---

Write your post in **Markdown** below the `---` block.

## Subheadings use double-hash
### And triple-hash for sub-subheadings

Bullet lists:

- Strong, scannable points
- Plain language, no fluff
- Real numbers where possible

Bold uses **double asterisks**. Italic uses *single asterisks*.

Links are inline: [link text](https://destination.com).

Images inside the body:

![Alt text describing the image](/images/blog/your-image.jpg)

> Pull-quotes use a leading angle bracket. Great for testimonials or punchline moments.

End every post with a 1–2 sentence wrap + a CTA.
```

---

## Rules / Best practices

| Rule | Why |
|---|---|
| Always set `title`, `excerpt`, `hero_image`, `publish_date` | SEO + social previews break without these |
| Slug must match filename | The build wiring relies on this |
| Hero image 1200×630px | Standard OG/Twitter card size — looks right on Facebook, LinkedIn, Twitter previews |
| Don't paste raw HTML / `<script>` tags | The build sanitizes Markdown and strips unsafe HTML. Safe markdown only |
| One `# heading` only — and the build adds it automatically from your `title` | Don't put `# Title` in the body |
| Keep paragraphs short (2–3 sentences) | Reader-friendly, mobile-readable |
| Aim for 800–1500 words | Sweet spot for SEO ranking on niche terms |

---

## What happens after you commit

1. Your push triggers your CI/CD (or your manual `yarn build:blog` step on the VPS).
2. `scripts/build-blog.js` reads every `.md` in this folder.
3. Renders each as a clean static HTML page at `pakbuddystore.com/blog/<slug>`.
4. Regenerates the `/blog` index page (latest first).
5. Regenerates `sitemap.xml` to include all posts.
6. Regenerates `/feed.xml` (RSS).
7. Apache on the VPS serves the static HTML files directly — zero database calls, zero new attack surface.
