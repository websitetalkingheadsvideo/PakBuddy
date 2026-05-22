#!/usr/bin/env node
/**
 * Strips Emergent-platform-only scripts from the built index.html so
 * production deploys don't ship analytics/badge/preview-environment code.
 *
 * Operates on frontend/build/index.html AFTER `craco build`. The source
 * public/index.html is untouched (the dev preview still needs those scripts).
 *
 * Works against minified CRA output by matching script blocks containing
 * unique identifier strings rather than fragile structural regexes.
 */
const fs = require("fs");
const path = require("path");

const BUILD_HTML = path.resolve(__dirname, "..", "frontend", "build", "index.html");

if (!fs.existsSync(BUILD_HTML)) {
  console.error(`ERR  ${BUILD_HTML} not found. Run \`craco build\` first.`);
  process.exit(1);
}

let html = fs.readFileSync(BUILD_HTML, "utf-8");
const before = html.length;

/**
 * Remove any <script>...</script> block whose body contains the given marker.
 * Handles minified output where the opener may be `<script>` or `<script defer="defer">` etc.
 */
function stripScriptContaining(html, marker) {
  // Inline scripts (no src) containing the marker
  const re = new RegExp(
    `<script\\b[^>]*>(?:(?!<\\/script>)[\\s\\S])*?${marker}(?:(?!<\\/script>)[\\s\\S])*?<\\/script>`,
    "g"
  );
  return html.replace(re, "");
}

/**
 * Remove external <script src="..."> tags where src matches a substring.
 */
function stripScriptSrc(html, srcMarker) {
  const re = new RegExp(
    `<script\\b[^>]*\\bsrc=["'][^"']*${srcMarker}[^"']*["'][^>]*>(?:\\s*</script>)?`,
    "g"
  );
  return html.replace(re, "");
}

// 1. The Emergent inline error handler (contains PerformanceServerTiming)
html = stripScriptContaining(html, "PerformanceServerTiming");

// 2. PostHog inline init block
html = stripScriptContaining(html, "posthog\\.init");
html = stripScriptContaining(html, "posthog\\.__SV");

// 3. External Emergent main script
html = stripScriptSrc(html, "assets\\.emergent\\.sh/scripts/emergent-main\\.js");

// 4. "Made with Emergent" floating badge link
html = html.replace(/<a\b[^>]*id=["']emergent-badge["'][\s\S]*?<\/a>/g, "");

// Collapse any blank lines left behind
html = html.replace(/\n\s*\n\s*\n+/g, "\n\n");

fs.writeFileSync(BUILD_HTML, html, "utf-8");
const after = html.length;
console.log(
  `✓ Stripped Emergent platform code from build/index.html (${before - after} bytes removed)`
);
