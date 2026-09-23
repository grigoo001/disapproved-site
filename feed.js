// Live Instagram feed.
// On every page load, fetch the latest posts from the source in <ul class="feed" data-feed-src="...">
// and rebuild the grid. If the source is missing, empty or broken, the static tiles in the HTML stay.
//
// Accepted sources (auto-detected):
//   - data/instagram.json written by .github/workflows/instagram-feed.yml (Instagram API format: { data: [...] })
//   - a Behold.so JSON feed URL (array of posts, or { posts: [...] }) – currently used
(() => {
  const list = document.querySelector('.feed[data-feed-src]');
  if (!list || !list.dataset.feedSrc || !('fetch' in window)) return;

  const MAX = 12;
  const NEW_DAYS = 7;
  const FALLBACK_LINK = 'https://www.instagram.com/disapproved.site/';
  const SIZES = '(min-width: 1800px) 8vw, (min-width: 961px) 16vw, 33vw';

  const safeUrl = (u) => {
    try {
      const url = new URL(u, location.href);
      return url.protocol === 'https:' || url.origin === location.origin ? url.href : null;
    } catch { return null; }
  };

  // First line of the caption, trimmed to a tile-sized label.
  const shortCaption = (text) => {
    const line = String(text || '').split('\n').map((s) => s.trim()).find(Boolean) || '';
    const clean = line.replace(/\s*#\S+/g, '').trim();
    return clean.length > 60 ? clean.slice(0, 57).trimEnd() + '…' : clean;
  };

  // Normalise either source into { image, link, caption, alt, time }.
  const normalise = (raw) => {
    const posts = Array.isArray(raw) ? raw : raw.data || raw.posts || [];
    return posts.map((p) => {
      const isVideo = /video/i.test(p.media_type || p.mediaType || '');
      const image =
        (p.sizes && p.sizes.medium && p.sizes.medium.mediaUrl) ||
        (isVideo ? p.thumbnail_url || p.thumbnailUrl : null) ||
        p.local_image || p.media_url || p.mediaUrl || p.thumbnail_url || p.thumbnailUrl;
      const caption = shortCaption(p.prunedCaption || p.caption);
      const sz = p.sizes || {};
      const srcset = ['small', 'medium', 'large']
        .filter((k) => sz[k] && sz[k].mediaUrl && safeUrl(sz[k].mediaUrl))
        .map((k) => `${safeUrl(sz[k].mediaUrl)} ${sz[k].width}w`).join(', ');
      const kind = isVideo ? 'reel' : /carousel/i.test(p.media_type || p.mediaType || '') ? 'album' : '';
      return {
        srcset,
        kind,
        image: safeUrl(image),
        link: safeUrl(p.permalink) || FALLBACK_LINK,
        caption,
        alt: p.alt_text || p.altText || `Instagram ${isVideo ? 'reel' : 'post'}${caption ? `: ${caption}` : ' from @disapproved.site'}`,
        time: Date.parse(p.timestamp || p.time || '') || 0,
      };
    }).filter((p) => p.image).slice(0, MAX);
  };

  const tile = (post) => {
    const li = document.createElement('li');
    li.className = 'rise';
    const a = document.createElement('a');
    a.href = post.link;
    a.target = '_blank';
    a.rel = 'noopener';
    const img = new Image(700, 700);
    img.src = post.image;
    if (post.srcset) {
      img.srcset = post.srcset;
      img.sizes = SIZES;
    }
    img.alt = post.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    a.append(img);
    if (post.kind) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'kind');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', `#i-${post.kind}`);
      svg.append(use);
      a.append(svg);
    }
    if (post.time && Date.now() - post.time < NEW_DAYS * 864e5) {
      const badge = document.createElement('span');
      badge.className = 'new';
      badge.textContent = 'New';
      a.append(badge);
    }
    if (post.caption) {
      const cap = document.createElement('span');
      cap.className = 'cap';
      cap.textContent = post.caption;
      a.append(cap);
    }
    li.append(a);
    return li;
  };

  const ago = (t) => {
    const days = Math.floor((Date.now() - t) / 864e5);
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (days < 1) return rtf.format(-Math.max(1, Math.round((Date.now() - t) / 36e5)), 'hour');
    if (days < 30) return rtf.format(-days, 'day');
    return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(t);
  };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  // Cache-bust per load so a new post shows up on the next refresh, not after the browser cache expires.
  const src = new URL(list.dataset.feedSrc, location.href);
  if (src.origin === location.origin) src.searchParams.set('t', Date.now());

  fetch(src, { signal: ctrl.signal, cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((raw) => {
      const posts = normalise(raw);
      if (posts.length < 3) return; // too few to fill the grid; keep the static tiles
      list.replaceChildren(...posts.map(tile));
      list.setAttribute('aria-busy', 'false');
      const latest = Math.max(...posts.map((p) => p.time));
      const stamp = document.getElementById('feed-updated');
      if (stamp && latest) {
        stamp.textContent = `Latest post ${ago(latest)}`;
        stamp.hidden = false;
      }
    })
    .catch(() => { /* keep the static tiles */ })
    .finally(() => clearTimeout(timer));
})();
