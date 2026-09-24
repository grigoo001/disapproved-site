# disapproved.site

Landing page for **disapproved**, a Hungarian car-build brand: "Unconventional ways to build and enjoy cars."
Current project: **MX52**, a silver 2nd-gen (NB) Mazda MX-5 with a 1.6. Instagram: @disapproved.site.
The brand is car-first; a shop comes later in this order: stickers → clothing → parts.

## Stack
Static HTML/CSS/JS, no build step. Hosted on Cloudflare (Workers static assets): `wrangler.jsonc` serves this folder,
`.assetsignore` keeps docs/skills/drafts private, `_headers` sets caching, `404.html` handles unknown paths.
Cloudflare's Git integration redeploys on every push to `main`.
- `index.html`: the site (styles inline in `<style>`, logo as inline SVG `<symbol>`s)
- `base.css` / `base.js`: shared reset, signup handling, reveal helper (reveal is only used in `directions/`)
- `fonts/`: self-hosted Archivo variable (wght 400–900, wdth 62–100). `archivo-hu.woff2` only carries ŐőŰű.
- `logo.svg`, `favicon.svg`: logo outlined from Archivo, so it never depends on font loading
- `img/`: photos; see "Assets still to add" below
- `directions/`: early design explorations; not linked from the site

Preview locally with `python3 -m http.server` (the font doesn't load over `file://`).

## Brand rules
- **Logo:** lowercase "dis" on top, three rotated "APPROVE" lines stacked under the "d", reading bottom to top.
  Use the `#logo` symbol (full lockup) or `#dis` (compact mark). Never rebuild it from live text.
  An outer `<svg>` that `<use>`s a symbol needs a viewBox starting at `0 0` (e.g. `0 0 1507 1983`), not the symbol's own.
- **Colour:** black/white first (`--bg #0c0c0c`, `--fg #f4f4f2`), silver from the car, `--paper #e6e5e1` for light panels.
  Red (`--high`) only means "stress / happening now". Green and amber only live in the cortisol gauge.
- **Type:** Archivo only. Condensed 900 uppercase (`.cond`) for section headings; normal width for everything else.
- **Voice:** short, dry, self-aware garage humour. Hungarian captions stay in Hungarian with an English gloss and `lang="hu"`.
- **Motion:** runs for everyone, even with the OS "reduce motion" setting on (owner's decision). Don't add
  `prefers-reduced-motion` switches that disable it. The status ticker has a pause/play button instead.
- **Honesty:** no invented specs, numbers, reviews or shipping promises. If a fact isn't known, leave it out.
  The signup never claims success unless a real endpoint accepted the email.

## Design skills
`.claude/skills/impeccable` (audit, critique, polish, …) plus the taste-skill pack are installed.
Run the bundled detector after UI edits: `sh .claude/skills/impeccable/scripts/impeccable detect --json index.html base.css`.
Known false positives: `cramped-padding` on elements padded with `clamp()`, and `flat-type-hierarchy` from the sr-only h1 text.

## Assets still to add
Upload these to `img/`. The page already references them and hides them cleanly while they're missing:
- `img/poster.jpg`: the dis/APPROVE poster with the engine-bay cutout (Clothing row)
- `img/badge.png`: the grunge DISAPPROVED badge (Stickers row, footer)
- `img/tribal.png`: the tribal flame graphic (faint background in the Shop section)

The photos in `img/*.jpg` (hero collage and build log) are 238px crops from an Instagram screenshot; replace them with full-res originals under the same names.

## Email signup
Set `data-endpoint` on the form in `#shop` to a form service URL (Formspree, Buttondown, …). Until then the form stays
hidden and an Instagram link is shown instead.

## Live Instagram feed (Behold)
The feed section has no fixed posts. `<ul class="feed">` holds 6 loading placeholders, and `feed.js` fetches the Behold JSON
feed in `data-feed-src` (`https://feeds.behold.so/6z6ih2IyPgfZUAzjR31Z`) on every page load and renders the latest posts
(max 12; the free Behold plan returns 6). Posts under 7 days old get a "New" badge; reels and carousels get a corner icon;
"Latest post …" shows under the heading. If Behold fails or times out (10 s), a link to the Instagram profile replaces the grid.
New posts appear as soon as Behold refreshes its feed; the site itself needs no rebuild.
Feed settings (which account, how many posts) live in the Behold dashboard.
`snippets/instagram-feed.html` is a self-contained copy of the same section for other sites.
