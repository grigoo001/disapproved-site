// Fetches the latest @disapproved.site posts from the Instagram API and saves them for the site:
//   data/instagram.json  – post list read by feed.js on every page load
//   data/ig/<id>.jpg     – local copies of the images (Instagram's own image URLs expire)
// Needs IG_ACCESS_TOKEN (a long-lived Instagram API token). Without it, this exits quietly.
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';

const token = process.env.IG_ACCESS_TOKEN;
if (!token) {
  console.log('IG_ACCESS_TOKEN is not set; skipping Instagram update.');
  process.exit(0);
}

const API = 'https://graph.instagram.com';
const LIMIT = 12;

const res = await fetch(`${API}/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${LIMIT}&access_token=${token}`);
if (!res.ok) {
  console.error(`Instagram API error ${res.status}: ${await res.text()}`);
  process.exit(1);
}
const { data = [] } = await res.json();

await mkdir('data/ig', { recursive: true });
const posts = [];
for (const p of data) {
  const src = p.media_type === 'VIDEO' ? p.thumbnail_url : p.media_url;
  if (!src) continue;
  const img = await fetch(src);
  if (!img.ok) continue;
  const file = `data/ig/${p.id}.jpg`;
  await writeFile(file, Buffer.from(await img.arrayBuffer()));
  posts.push({ id: p.id, caption: p.caption || '', media_type: p.media_type, permalink: p.permalink, timestamp: p.timestamp, local_image: file });
}

// Drop images of posts that are no longer in the latest 12.
const keep = new Set(posts.map((p) => `${p.id}.jpg`));
for (const f of await readdir('data/ig')) if (!keep.has(f)) await rm(`data/ig/${f}`);

await writeFile('data/instagram.json', JSON.stringify({ data: posts }, null, 2) + '\n');
console.log(`Saved ${posts.length} posts.`);

// Extend the long-lived token (valid 60 days; refreshing keeps it alive while this runs regularly).
await fetch(`${API}/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`).catch(() => {});
