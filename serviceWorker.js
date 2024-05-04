import { assets, cacheName } from './swImports.json';

self.addEventListener('install', (installEvent) => {
  console.log('Service Worker: Installing...');
  installEvent.waitUntil(
    caches.open(cacheName)
      .then((cache) => {
        console.log('Caching assets...');
        cache.addAll(assets)
          .then(() => {
            console.log('Assets cached');
          })
          .catch((err) => {
            console.error('Error adding assets to cache', err);
          });
      })
      .catch((err) => {
        console.error('Error opening cache', err);
      })
  );
});

self.addEventListener('fetch', (fetchEvent) => {
  console.log('Service Worker: Fetching...');
  fetchEvent.respondWith(
    caches.match(fetchEvent.request)
      .then((res) => {
        return res || fetch(fetchEvent.request);
      })
      .catch((err) => {
        console.error('Error fetching assets', err);
      })
  );
});
