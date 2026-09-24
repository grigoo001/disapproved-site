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

## Hosting (Cloudflare)

Deployed as a Cloudflare Worker that only serves static files (`wrangler.jsonc`). No build step.

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Import a repository** → pick `grigoo001/disapproved-site`.
2. Keep the defaults: build command empty, deploy command `npx wrangler deploy`. Save and deploy.
3. The site goes live at `https://disapproved-site.<your-subdomain>.workers.dev`. Every push to `main` redeploys.

`.assetsignore` keeps `CLAUDE.md`, `README.md`, `.claude/`, `directions/` and `snippets/` off the public site.
A custom domain can be added later under the Worker's **Settings → Domains & Routes** once one is registered.

## To do

- [ ] Replace `img/` with full-resolution photos
- [ ] Fill in the real MX52 spec and mod list (`index.html`, `#build`)
- [ ] Upload `img/poster.jpg`, `img/badge.png`, `img/tribal.png`
- [ ] Connect the email form: set `data-endpoint` (e.g. Formspree, Buttondown)
- [ ] Register `disapproved.site`, then add a `CNAME` file and DNS records
- [ ] Add Shopify when Drop 01 (stickers) is ready
