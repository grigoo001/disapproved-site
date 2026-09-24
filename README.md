# disapproved.site

Unconventional ways to build and enjoy cars. Landing page for **Project MX52** and the future disapproved shop (stickers → clothing → parts).

Instagram: [@disapproved.site](https://www.instagram.com/disapproved.site/)

## Structure

```
index.html          The site
base.css / base.js  Shared reset, email signup handling, reveal helper
fonts/              Self-hosted Archivo (trimmed variable font)
logo.svg            Logo lockup as outlines; favicon.svg is the compact "dis" mark
img/                Photos and brand assets (see CLAUDE.md, "Assets still to add")
directions/         Early design explorations A–D
.claude/            Design skills (impeccable + taste-skill pack)
```

See `CLAUDE.md` for brand rules and how to turn on email signups.

Plain static HTML/CSS/JS — no build step. Open `index.html` in a browser, or run:

```sh
python3 -m http.server 8000
```

Opening the file directly works too, but the self-hosted font only loads over http.

## Hosting (GitHub Pages)

Settings → Pages → Source: *Deploy from a branch* → `main` / root.
The site is then live at `https://<user>.github.io/disapproved-site/`.

To use a custom domain later (e.g. `disapproved.site` once registered): add a `CNAME` file containing the domain, then point its DNS at GitHub Pages (apex `A` records 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153; `www` `CNAME` to `grigoo001.github.io`).

## To do

- [ ] Replace `img/` with full-resolution photos
- [ ] Fill in the real MX52 spec and mod list (`index.html`, `#build`)
- [ ] Upload `img/poster.jpg`, `img/badge.png`, `img/tribal.png`
- [ ] Connect the email form: set `data-endpoint` (e.g. Formspree, Buttondown)
- [ ] Register `disapproved.site`, then add a `CNAME` file and DNS records
- [ ] Add Shopify when Drop 01 (stickers) is ready
