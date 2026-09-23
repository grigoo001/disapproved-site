// Live Instagram feed, powered by Behold (behold.so).
// The grid in <ul class="feed" data-feed-src="https://feeds.behold.so/<feed id>"> starts as loading
// placeholders. On every page load this fetches the Behold JSON feed and renders the latest posts.
// If Behold can't be reached, the placeholders are replaced by a link to the Instagram profile.
(() => {
  const list = document.querySelector('.feed[data-feed-src]');
  if (!list) return;

  const MAX = 12;
  const NEW_DAYS = 7;
  const PROFILE = 'https://www.instagram.com/disapproved.site/';
  const SIZES = '(min-width: 1800px) 8vw, (min-width: 961px) 16vw, 33vw';
  const SVG = 'http://www.w3.org/2000/svg';

  const httpsUrl = (u) => {
    try { const url = new URL(u); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
  };

  // Behold's prunedCaption drops trailing hashtags; keep the first line, tile-sized.
  const shortCaption = (text) => {
    const line = String(text || '').split('\n').map((s) => s.trim()).find(Boolean) || '';
    const clean = line.replace(/\s*#\S+/g, '').trim();
    return clean.length > 60 ? clean.slice(0, 57).trimEnd() + '…' : clean;
  };

  const normalise = (feed) => {
    const posts = Array.isArray(feed) ? feed : feed.posts || [];
    return posts.map((p) => {
      const type = p.mediaType || '';
      const kind = /video/i.test(type) ? 'reel' : /carousel/i.test(type) ? 'album' : '';
      const sizes = p.sizes || {};
      const pick = (k) => sizes[k] && httpsUrl(sizes[k].mediaUrl);
      const caption = shortCaption(p.prunedCaption || p.caption);
      return {
        image: pick('medium') || pick('small') || httpsUrl(kind === 'reel' ? p.thumbnailUrl : p.mediaUrl),
        srcset: ['small', 'medium', 'large'].filter(pick).map((k) => `${pick(k)} ${sizes[k].width}w`).join(', '),
        kind,
        link: httpsUrl(p.permalink) || PROFILE,
        caption,
        alt: p.altText || `Instagram ${kind === 'reel' ? 'reel' : 'post'}${caption ? `: ${caption}` : ' from @disapproved.site'}`,
        time: Date.parse(p.timestamp || '') || 0,
      };
    }).filter((p) => p.image).slice(0, MAX);
  };

  const icon = (kind) => {
    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('class', 'kind');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(SVG, 'use');
    use.setAttribute('href', `#i-${kind}`);
    svg.append(use);
    return svg;
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
    if (post.srcset) { img.srcset = post.srcset; img.sizes = SIZES; }
    img.alt = post.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    a.append(img);
    if (post.kind) a.append(icon(post.kind));
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
    const hours = (Date.now() - t) / 36e5;
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (hours < 24) return rtf.format(-Math.max(1, Math.round(hours)), 'hour');
    if (hours < 24 * 30) return rtf.format(-Math.floor(hours / 24), 'day');
    return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(t);
  };

  const done = () => list.setAttribute('aria-busy', 'false');

  const fail = () => {
    const li = document.createElement('li');
    li.className = 'feed-error';
    const p = document.createElement('p');
    p.textContent = 'The latest posts didn’t load. ';
    const a = document.createElement('a');
    a.href = PROFILE;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'See them on Instagram ↗';
    p.append(a);
    li.append(p);
    list.replaceChildren(li);
    done();
  };

  if (!('fetch' in window)) return fail();

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  fetch(list.dataset.feedSrc, { signal: ctrl.signal })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then((feed) => {
      const posts = normalise(feed);
      if (!posts.length) return fail();
      list.replaceChildren(...posts.map(tile));
      done();
      const latest = Math.max(...posts.map((p) => p.time));
      const stamp = document.getElementById('feed-updated');
      if (stamp && latest) {
        stamp.textContent = `Latest post ${ago(latest)}`;
        stamp.hidden = false;
      }
    })
    .catch(fail)
    .finally(() => clearTimeout(timer));
})();
