# Hemanth Mahesh — Portfolio

Five-page immersive static portfolio built with vanilla HTML/CSS/JS plus GSAP, Three.js and Anime.js loaded as ES modules from jsDelivr. No npm install is required to preview it.

## Pages
- `index.html` — Home
- `work.html` — Work archive + filters
- `case-study.html` — Narrative case-study template
- `lab.html` — Open source + technical experiments
- `about.html` — About + timeline + contact

## Run locally
```bash
python3 serve.py
```
Then open `http://localhost:4173`. Internet access is needed for the animation libraries and Google-hosted font CSS.

## Deploy
Upload the folder directly to Netlify, Vercel, Cloudflare Pages, GitHub Pages (adjust root-relative paths if using a project subpath), or any static host.

## What to replace before launch
1. Replace placeholder project copy with verified project facts.
2. Replace the About portrait placeholder with a strong photo.
3. Replace `hello@example.com` with Hemanth Mahesh's real email.
4. Add the real GitHub URL and repository/contribution data.
5. Replace sample metrics and exact timeline dates with verified data.
6. Add real screenshots/video to project media slots.

## Motion responsibilities
- **GSAP:** page choreography, entrance/reveal motion, scroll-driven sequences, cursor, transitions.
- **Three.js:** atmospheric hero/Lab WebGL scenes.
- **Anime.js:** loader count, filters, SVG architecture drawing, numeric counters.

## Accessibility
- Native page scrolling; no scroll hijacking.
- HTML text stays HTML instead of being rendered into WebGL.
- `prefers-reduced-motion` disables decorative motion.
- Mobile layout removes the custom cursor and simplifies interaction.


## Typography

The portfolio uses a readability-first editorial system:

- **Newsreader** — display headlines and editorial statements
- **Onest** — body copy, navigation, UI and long-form reading
- **IBM Plex Mono** — code, metadata, dates and technical labels

Display sizes are intentionally restrained compared with typical experimental portfolios. Long-form copy uses wider line-height and narrower measure for comfortable reading.


## Intro behavior

The minimal Hemanth Mahesh signature intro appears only on the first Home-page entry in a browser tab/session. Internal page navigation never replays it. The state is stored in `sessionStorage` as `hm-intro-seen`, and reduced-motion users skip the intro entirely.
