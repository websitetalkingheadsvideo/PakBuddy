#!/usr/bin/env node
/**
 * Pak Buddy blog builder.
 *
 * Reads Markdown posts from /content/blog/*.md, renders each as a complete
 * static HTML page (no React), and emits:
 *   public/blog/index.html              ← listing
 *   public/blog/<slug>/index.html       ← per-post pages
 *   public/blog/posts.json              ← 3-latest manifest for the BlogStrip
 *   public/feed.xml                     ← RSS
 *   public/sitemap.xml                  ← regenerated with blog URLs
 *
 * Security:
 *   • Markdown → HTML with `marked`
 *   • Output sanitized with `sanitize-html` (strict allowlist)
 *   • Frontmatter fields HTML-escaped
 *   • Future-dated posts excluded from build
 *   • No script tags ever
 */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");
const sanitizeHtml = require("sanitize-html");

const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content", "blog");
const PUBLIC_DIR = path.join(ROOT, "frontend", "public");
const BLOG_OUT = path.join(PUBLIC_DIR, "blog");

const SITE_URL = "https://pakbuddystore.com";
const SITE_NAME = "Pak Buddy";
const ORDER_URL = "https://thefloorlord.com/product/pak-buddy/";

/* ──────────────────────────── helpers ──────────────────────────── */

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const sanitizeOpts = {
  allowedTags: [
    "p", "br", "strong", "em", "a", "ul", "ol", "li",
    "h2", "h3", "h4", "blockquote", "code", "pre",
    "img", "table", "thead", "tbody", "tr", "th", "td", "hr",
  ],
  allowedAttributes: {
    a: ["href", "title", "rel", "target"],
    img: ["src", "alt", "title", "loading"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: (tag, attribs) => ({
      tagName: "a",
      attribs: {
        ...attribs,
        rel: "noopener noreferrer",
        target:
          /^https?:\/\//.test(attribs.href || "") &&
          !(attribs.href || "").startsWith(SITE_URL)
            ? "_blank"
            : "_self",
      },
    }),
    img: (tag, attribs) => ({
      tagName: "img",
      attribs: { ...attribs, loading: "lazy" },
    }),
  },
};

/* ──────────────────────── parse all posts ──────────────────────── */

function loadPosts() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const today = new Date().toISOString().slice(0, 10);
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((f) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, f), "utf-8");
      const { data, content } = matter(raw);
      const fileSlug = f.replace(/\.md$/, "");
      const slug = (data.slug || fileSlug).trim();
      if (slug !== fileSlug) {
        console.warn(
          `WARN  ${f}: frontmatter slug "${slug}" doesn't match filename ` +
            `"${fileSlug}". Using filename as authoritative slug.`
        );
      }
      const html = sanitizeHtml(
        marked.parse(content, { gfm: true, breaks: false }),
        sanitizeOpts
      );
      return {
        slug: fileSlug,
        title: data.title || fileSlug,
        excerpt: data.excerpt || "",
        hero_image: data.hero_image || "",
        hero_alt: data.hero_alt || data.title || "",
        author: data.author || SITE_NAME,
        tags: Array.isArray(data.tags) ? data.tags : [],
        publish_date: data.publish_date || today,
        html,
      };
    })
    .filter((p) => p.publish_date <= today)
    .sort((a, b) => (a.publish_date < b.publish_date ? 1 : -1));
}

/* ─────────────────────── HTML templates ─────────────────────── */

function pageShell({ title, description, canonical, ogImage, robots, jsonLd, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${esc(canonical)}" />
<meta name="robots" content="${esc(robots || "index, follow, max-image-preview:large")}" />

<meta property="og:type" content="article" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${esc(canonical)}" />
${ogImage ? `<meta property="og:image" content="${esc(ogImage.startsWith("http") ? ogImage : SITE_URL + ogImage)}" />` : ""}
<meta property="og:site_name" content="${esc(SITE_NAME)}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
${ogImage ? `<meta name="twitter:image" content="${esc(ogImage.startsWith("http") ? ogImage : SITE_URL + ogImage)}" />` : ""}

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700;1,900&family=Archivo+Black&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

<link rel="icon" href="/images/pakbuddy-full-logo.png" />

<style>
:root{
  --pb-ink:#07101f; --pb-ink-2:#0c1629; --pb-ink-3:#142238;
  --pb-cream:#f5f7fb; --pb-cream-2:#e8edf5;
  --pb-blue:#1e88ff; --pb-blue-bright:#45a4ff; --pb-blue-deep:#0a5bd1;
  --pb-grey:#5a6a82; --pb-grey-2:#8c9bb3;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:var(--pb-cream);color:var(--pb-ink);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.65}
a{color:var(--pb-blue-deep);text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px;transition:color .15s,background .15s}
a:hover{color:var(--pb-ink);background:#dde6f5}
header.nav{background:var(--pb-ink);color:var(--pb-cream);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid var(--pb-blue-bright)}
header.nav a.brand{color:var(--pb-cream);font-family:'Archivo Black',Impact,sans-serif;font-size:20px;text-decoration:none;letter-spacing:.04em}
header.nav a.brand:hover{background:transparent;color:var(--pb-blue-bright)}
header.nav nav{display:flex;align-items:center;gap:22px}
header.nav nav a{color:var(--pb-cream);font-family:'Space Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.22em;text-decoration:none;text-transform:uppercase}
header.nav nav a:hover{color:var(--pb-blue-bright);background:transparent}
main{max-width:760px;margin:0 auto;padding:48px 24px 80px}
main.wide{max-width:1180px}
.kicker{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.3em;color:var(--pb-blue-deep);text-transform:uppercase;margin:0 0 14px;display:inline-flex;align-items:center;gap:10px}
.kicker:before{content:"";display:inline-block;width:28px;height:1px;background:var(--pb-blue-deep)}
h1.title{font-family:'Playfair Display',Georgia,serif;font-weight:900;font-size:clamp(2.2rem,4.2vw,3.8rem);line-height:1.0;letter-spacing:-.02em;margin:0 0 18px;color:var(--pb-ink)}
.byline{font-family:Inter,sans-serif;font-size:14px;color:var(--pb-grey);margin-bottom:32px}
.byline .dot{margin:0 8px;opacity:.5}
.hero-img{width:100%;border:2px solid var(--pb-ink);margin:8px 0 36px;display:block;background:#fff}
.post{font-size:18px;color:var(--pb-ink)}
.post p,.post ul,.post ol,.post blockquote,.post table{margin:0 0 22px}
.post h2{font-family:'Archivo Black',Impact,sans-serif;font-size:30px;line-height:1.1;margin:44px 0 18px;letter-spacing:-.01em;color:var(--pb-ink)}
.post h3{font-family:'Archivo Black',Impact,sans-serif;font-size:21px;margin:32px 0 14px;color:var(--pb-ink)}
.post h4{font-family:'Archivo Black',Impact,sans-serif;font-size:17px;margin:26px 0 10px}
.post ul,.post ol{padding-left:24px}
.post li{margin:6px 0}
.post blockquote{border-left:4px solid var(--pb-blue-bright);padding:14px 20px;background:var(--pb-cream-2);font-family:'Playfair Display',Georgia,serif;font-style:italic;font-size:21px;color:var(--pb-ink);line-height:1.4}
.post blockquote p:last-child{margin-bottom:0}
.post code{background:var(--pb-cream-2);padding:2px 6px;border-radius:3px;font-size:.92em;font-family:'Space Mono',ui-monospace,monospace}
.post pre{background:var(--pb-ink);color:var(--pb-cream);padding:16px;overflow:auto;border:2px solid var(--pb-ink);font-family:'Space Mono',monospace;font-size:14px}
.post pre code{background:transparent;color:inherit;padding:0}
.post img{max-width:100%;height:auto;border:2px solid var(--pb-ink)}
.post table{width:100%;border-collapse:collapse;font-size:15px}
.post th,.post td{border:1px solid var(--pb-ink);padding:10px 12px;text-align:left;vertical-align:top}
.post th{background:var(--pb-ink);color:var(--pb-cream);font-family:'Archivo Black',sans-serif;text-transform:uppercase;font-size:12px;letter-spacing:.06em}
.post hr{border:0;border-top:1px solid var(--pb-grey-2);margin:36px 0}
.tag{display:inline-block;background:var(--pb-ink);color:var(--pb-cream);font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.18em;padding:5px 11px;margin-right:6px;margin-bottom:6px;text-transform:uppercase}
.cta-card{margin-top:56px;padding:32px;background:var(--pb-ink-2);color:var(--pb-cream);border:2px solid var(--pb-blue-bright);text-align:center;position:relative;overflow:hidden}
.cta-card h3{font-family:'Playfair Display',Georgia,serif;font-weight:900;font-size:30px;margin:0 0 10px;color:var(--pb-cream);line-height:1.05;letter-spacing:-.01em}
.cta-card p{color:var(--pb-grey-2);margin:0 0 22px;font-size:16px}
.cta-card a.btn{display:inline-flex;align-items:center;gap:10px;background:var(--pb-blue);color:var(--pb-ink);font-family:'Archivo Black',sans-serif;font-size:14px;letter-spacing:.05em;padding:14px 22px;border:2px solid var(--pb-ink);text-decoration:none;text-transform:uppercase;box-shadow:5px 5px 0 0 var(--pb-blue-bright);transition:transform .15s,box-shadow .15s,background .2s}
.cta-card a.btn:hover{background:var(--pb-blue-bright);transform:translate(-2px,-2px);box-shadow:7px 7px 0 0 var(--pb-cream)}
.back-link{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.22em;text-transform:uppercase}
footer.foot{background:var(--pb-ink);color:var(--pb-grey-2);padding:32px 24px;text-align:center;font-size:12px;font-family:'Space Mono',monospace;letter-spacing:.18em;text-transform:uppercase}
footer.foot a{color:var(--pb-blue-bright);background:transparent}
.list-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;margin-top:40px}
.card{background:#fff;border:2px solid var(--pb-ink);text-decoration:none;color:var(--pb-ink);display:block;transition:transform .15s,box-shadow .15s}
.card:hover{transform:translate(-3px,-3px);background:#fff;box-shadow:6px 6px 0 0 var(--pb-blue)}
.card .ph{height:200px;background:var(--pb-cream-2) center/cover no-repeat;border-bottom:2px solid var(--pb-ink)}
.card .ph.empty{display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-weight:900;font-style:italic;font-size:28px;color:var(--pb-blue-deep);opacity:.45}
.card .body{padding:18px 20px 22px}
.card .meta{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.22em;color:var(--pb-blue-deep);text-transform:uppercase}
.card h2{font-family:'Playfair Display',Georgia,serif;font-weight:900;font-size:22px;line-height:1.15;margin:8px 0 10px;letter-spacing:-.01em}
.card p{font-size:14px;color:var(--pb-grey);margin:0;line-height:1.5}
.index-intro{font-size:18px;color:var(--pb-grey);max-width:580px;margin-top:14px}
</style>

${jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : ""}
</head>
<body>

<header class="nav">
  <a href="/" class="brand">${esc(SITE_NAME).toUpperCase()}</a>
  <nav>
    <a href="/">Home</a>
    <a href="/blog">Blog</a>
    <a href="/#fleet">Fleet</a>
  </nav>
</header>

${body}

<footer class="foot">
  © ${new Date().getFullYear()} ${esc(SITE_NAME)} · Created by The Floor Lord · <a href="/">Home</a> · <a href="/blog">Blog</a>
</footer>
</body></html>`;
}

function renderPost(p) {
  const url = `${SITE_URL}/blog/${p.slug}`;
  const heroSrc = p.hero_image
    ? (p.hero_image.startsWith("http") ? p.hero_image : p.hero_image)
    : "";
  const heroImg = p.hero_image
    ? `<img class="hero-img" src="${esc(heroSrc)}" alt="${esc(p.hero_alt)}" />`
    : "";
  const tags = p.tags.length
    ? `<div style="margin-bottom:28px">${p.tags
        .map((t) => `<span class="tag">${esc(t)}</span>`)
        .join("")}</div>`
    : "";

  const ogImage = p.hero_image
    ? (p.hero_image.startsWith("http") ? p.hero_image : SITE_URL + p.hero_image)
    : `${SITE_URL}/images/pakbuddy-full-logo.png`;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: p.title,
    description: p.excerpt,
    image: [ogImage],
    datePublished: p.publish_date,
    dateModified: p.publish_date,
    author: { "@type": "Person", name: p.author },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/images/pakbuddy-full-logo.png` },
    },
  });

  const dateFmt = new Date(p.publish_date + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  const body = `
<main>
  <p class="kicker">From the Field</p>
  <h1 class="title">${esc(p.title)}</h1>
  <div class="byline">
    By ${esc(p.author)}<span class="dot">·</span>
    <time datetime="${esc(p.publish_date)}">${esc(dateFmt)}</time>
  </div>
  ${heroImg}
  ${tags}
  <article class="post">${p.html}</article>

  <div class="cta-card">
    <h3>Ready to try ${esc(SITE_NAME)}?</h3>
    <p>The patented reusable replacement for disposable backpack vacuum bags. Save money, maintain suction, protect your motors.</p>
    <a class="btn" href="${esc(ORDER_URL)}" rel="noopener noreferrer" target="_blank">Get ${esc(SITE_NAME)} →</a>
  </div>

  <p style="margin-top:40px"><a class="back-link" href="/blog">← Back to all posts</a></p>
</main>`;

  return pageShell({
    title: `${p.title} | ${SITE_NAME} Blog`,
    description: p.excerpt,
    canonical: url,
    ogImage: p.hero_image,
    jsonLd,
    body,
  });
}

function renderIndex(posts) {
  const url = `${SITE_URL}/blog`;
  const cards = posts
    .map((p) => {
      const bg = p.hero_image
        ? `<div class="ph" style="background-image:url('${esc(p.hero_image)}')"></div>`
        : `<div class="ph empty">Pak Buddy</div>`;
      return `<a class="card" href="/blog/${esc(p.slug)}">
  ${bg}
  <div class="body">
    <div class="meta">${esc(
      new Date(p.publish_date + "T00:00:00Z").toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      })
    )}</div>
    <h2>${esc(p.title)}</h2>
    <p>${esc(p.excerpt)}</p>
  </div>
</a>`;
    })
    .join("\n");

  const empty = `<p style="margin-top:32px;color:var(--pb-grey)">No posts yet. Check back soon.</p>`;

  const body = `
<main class="wide">
  <p class="kicker">From the Field</p>
  <h1 class="title">${esc(SITE_NAME)} Blog</h1>
  <p class="index-intro">
    Hands-on guides and field-tested tips for commercial, industrial, and cordless backpack vacuum operators.
  </p>
  ${posts.length ? `<div class="list-grid">${cards}</div>` : empty}
</main>`;

  return pageShell({
    title: `Blog | ${SITE_NAME}`,
    description: `Hands-on guides and field-tested tips from ${SITE_NAME} — for commercial, industrial, and cordless backpack vacuum crews.`,
    canonical: url,
    body,
  });
}

function renderRss(posts) {
  const items = posts
    .map((p) => {
      const link = `${SITE_URL}/blog/${p.slug}`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(p.publish_date + "T00:00:00Z").toUTCString()}</pubDate>
      <description>${esc(p.excerpt)}</description>
    </item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(SITE_NAME)} Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Field-tested tips for commercial backpack vacuum crews from ${esc(SITE_NAME)}.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;
}

function renderSitemap(posts) {
  const today = new Date().toISOString().slice(0, 10);
  const base = [
    { loc: `${SITE_URL}/`, priority: "1.0", changefreq: "weekly" },
    { loc: `${SITE_URL}/blog`, priority: "0.8", changefreq: "weekly" },
    { loc: `${SITE_URL}/#fleet`, priority: "0.7", changefreq: "monthly" },
  ];
  const postUrls = posts.map((p) => ({
    loc: `${SITE_URL}/blog/${p.slug}`,
    priority: "0.7",
    changefreq: "monthly",
    lastmod: p.publish_date,
  }));
  const urls = [...base, ...postUrls]
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod || today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/* ──────────────────────── main ──────────────────────── */

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content, "utf-8");
}

function main() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error(`ERR  ${PUBLIC_DIR} doesn't exist.`);
    process.exit(1);
  }

  const posts = loadPosts();
  console.log(`Found ${posts.length} published blog post(s).`);

  ensureDir(BLOG_OUT);

  writeFile(path.join(BLOG_OUT, "index.html"), renderIndex(posts));
  console.log(`  → wrote public/blog/index.html`);

  for (const p of posts) {
    writeFile(path.join(BLOG_OUT, p.slug, "index.html"), renderPost(p));
    console.log(`  → wrote public/blog/${p.slug}/index.html`);
  }

  writeFile(path.join(PUBLIC_DIR, "feed.xml"), renderRss(posts));
  console.log(`  → wrote public/feed.xml`);

  writeFile(path.join(PUBLIC_DIR, "sitemap.xml"), renderSitemap(posts));
  console.log(`  → wrote public/sitemap.xml`);

  const manifest = posts.slice(0, 3).map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    hero_image: p.hero_image,
    publish_date: p.publish_date,
  }));
  writeFile(
    path.join(PUBLIC_DIR, "blog", "posts.json"),
    JSON.stringify(manifest, null, 2)
  );
  console.log(`  → wrote public/blog/posts.json`);

  console.log("✓ Blog build complete.");
}

main();
