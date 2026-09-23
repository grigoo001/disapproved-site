# disapproved.site

Unconventional ways to build and enjoy cars. Landing page for **Project MX52** and the future disapproved shop (stickers → clothing → parts).

Instagram: [@disapproved.site](https://www.instagram.com/disapproved.site/)

## Structure

```
index.html          Main landing page (direction D · Garage)
base.css / base.js  Shared reset, scroll reveal, signup form stub
img/                Photos (currently cropped from the Instagram grid — replace with full-res originals)
directions/         Design exploration: overview + directions A (Mono), B (Stamp), C (Dark)
```

Plain static HTML/CSS/JS — no build step. Open `index.html` in a browser, or run:

```sh
python3 -m http.server 8000
```

## Hosting (GitHub Pages)

Settings → Pages → Source: *Deploy from a branch* → `main` / root.
The site is then live at `https://<user>.github.io/disapproved-site/`.

To use the real domain, add a `CNAME` file containing `disapproved.site` and point the domain's DNS at GitHub Pages.

## To do

- [ ] Replace `img/` with full-resolution photos
- [ ] Fill in the real MX52 spec and mod list (`index.html`, `#build`)
- [ ] Connect the email form to a real list (e.g. Shopify Email, Klaviyo, Mailchimp)
- [ ] Connect `disapproved.site` domain
- [ ] Add Shopify when Drop 01 (stickers) is ready
