// Bump the shell revision so clients that cached the pre-repair editor receive
// the strict-CSP-compatible bundle on their next service-worker update.
const CACHE = 'field-desk-shell-v4';
const SHELL = [
  '/', '/demo', '/privacy', '/terms', '/favicon.svg', '/apple-touch-icon.svg', '/social-card.svg',
  '/assets/field-desk-hero.avif', '/assets/field-desk-hero.webp', '/assets/field-desk-hero.jpg',
];

async function cacheModuleTree(cache, url, seen = new Set()) {
  const absolute = new URL(url, self.location.origin).href;
  if (seen.has(absolute)) return;
  seen.add(absolute);
  const response = await fetch(absolute);
  if (!response.ok) return;
  await cache.put(absolute, response.clone());
  const type = response.headers.get('content-type') || '';
  if (!type.includes('javascript') && !absolute.endsWith('.js') && !absolute.endsWith('.mjs')) return;
  const source = await response.text();
  const imports = [...source.matchAll(/["']((?:\.\/|\/assets\/)[a-zA-Z0-9_.-]+\.(?:js|mjs))["']/g)].map((match) => new URL(match[1], absolute).href);
  await Promise.all(imports.map((entry) => cacheModuleTree(cache, entry, seen)));
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(async (cache) => {
    await cache.addAll(SHELL);
    const html = await (await fetch('/')).text();
    const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map((match) => match[1]);
    await Promise.all(assets.map((asset) => cacheModuleTree(cache, asset)));
  }));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => caches.match('/'))));
});
