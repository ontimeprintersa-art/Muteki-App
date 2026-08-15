const CACHE_NAME = 'muteki-cache-v1'
const toCache = [ '/', '/index.html', '/src/main.jsx' ]

self.addEventListener('install', (ev) => {
  self.skipWaiting()
  ev.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(toCache)))
})

self.addEventListener('activate', (ev) => { ev.waitUntil(clients.claim()) })

self.addEventListener('fetch', (ev) => {
  const url = new URL(ev.request.url)
  if (url.pathname.startsWith('/api/')) {
    ev.respondWith(fetch(ev.request).catch(() => caches.match(ev.request)))
    return
  }
  ev.respondWith(caches.match(ev.request).then(m => m || fetch(ev.request).then(res => {
    if (ev.request.method === 'GET') {
      const copy = res.clone(); caches.open(CACHE_NAME).then(cache => cache.put(ev.request, copy))
    }
    return res
  }).catch(() => caches.match('/index.html'))))
})
