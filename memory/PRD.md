# Pak Buddy — Landing Page PRD

## Original Problem
Landing page for Pak Buddy, a reusable vacuum bag for commercial backpack vacuums, under Floor Lord Industries. Content supplied by user. All CTAs point to https://thefloorlord.com/product/pak-buddy/.

## User Choices
- CTA destination: https://thefloorlord.com/product/pak-buddy/
- Hero video: Vimeo (1187115103 / 5f13bd3cbe)
- 2-chamber demo video: uploaded webm asset
- Colors: blues + greys from Floor Lord logo
- Font: bold editorial (Playfair Display + Archivo Black + Inter + Space Mono)
- No phone/email (deferred)

## Architecture
- Frontend-only React landing page (no backend routes needed).
- Single-file App.js with sections: Nav, Hero, MicroProof marquee, Cost, How It Works, Benefits, Testimonials, Sustainability, Final CTA, Footer.
- Tailwind + custom CSS in index.css.
- External links via <a target="_blank">.

## Implemented (2026-04-27)
- Hero with Vimeo embed, headline, subline, dual CTAs, crew avatars.
- Marquee ticker with 4 micro-proof quotes.
- Cost section with 5 numbered pain points + "bottom line" callout and overheating-vacuum image.
- How It Works with looping 2-chamber video, airflow comparison bars, 4 feature points, pull quote.
- Benefits: 3-card grid (Save Money / Work Faster / Protect Equipment) with images.
- Testimonials: 4-quote grid with 5-star glyphs.
- Sustainability: copy + stats (0 daily disposal / ∞ reuses / 1 smarter operation) + product imagery.
- Final CTA: oversized display headline + primary/ghost CTAs + two editorial callouts.
- Footer: brand block, nav, CTA, © line.

## Not Implemented / Deferred (P1/P2)
- Lead-capture form / email signup (user chose direct external store link).
- Phone/email contact info (user declined for now).
- Analytics events on CTA clicks (PostHog auto-installed but no custom events).
- Mobile nav hamburger menu (desktop nav currently hides on <md; CTAs remain visible).
- Actual Pak Buddy branded logo in nav (placeholder using Floor Lord logo until user supplies).

## Backlog
- P1: Add a sticky "Get Pak Buddy" bar on mobile after scroll.
- P1: Swap Floor Lord logo in nav for dedicated Pak Buddy logo when supplied.
- P2: Add ROI calculator ("enter # crews → see yearly bag spend saved").
- P2: Add FAQ accordion.
- P2: Add bulk/fleet inquiry form.
