const CACHE = 'field-desk-shell-__BUILD_HASH__';
const STAGING = 'field-desk-staging-__BUILD_HASH__';
const PUBLIC_FILES = [
  '/', '/field-positions.css', '/favicon.svg', '/apple-touch-icon.svg', '/social-card.svg',
  '/assets/field-desk-hero.avif', '/assets/field-desk-hero.webp', '/assets/field-desk-hero.jpg',
];
const BUILT_FILES = /* __BUILT_FILES__ */ [];

async function fetchFresh(path) {
  const response = await fetch(new Request(path, { cache: 'reload' }));
  if (!response.ok) throw new Error(`Could not cache ${path}: ${response.status}`);
  return response;
}

async function buildCache() {
  await caches.delete(STAGING);
  const freshStaging = await caches.open(STAGING);
  for (const path of [...PUBLIC_FILES, ...BUILT_FILES]) {
    await freshStaging.put(new Request(path), await fetchFresh(path));
  }
  const complete = await caches.open(CACHE);
  for (const request of await complete.keys()) await complete.delete(request);
  for (const request of await freshStaging.keys()) {
    const response = await freshStaging.match(request);
    if (response) await complete.put(request, response);
  }
  await caches.delete(STAGING);
}

self.addEventListener('install', (event) => {
  event.waitUntil(buildCache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(caches.open(CACHE).then(async (cache) => {
      const shell = await cache.match('/', { ignoreVary: true });
      if (shell) return shell;
      return fetch(event.request);
    }));
    return;
  }
  event.respondWith(caches.open(CACHE).then(async (cache) => {
    // Vite preview and some static hosts add `Vary: Origin` to assets. The
    // install request and a later module request can carry different Origin
    // headers even though they identify the same immutable file.
    const cached = await cache.match(event.request, { ignoreVary: true });
    if (cached) return cached;
    const response = await fetch(event.request);
    if (response.ok) await cache.put(event.request, response.clone());
    return response;
  }));
});
