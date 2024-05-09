const CACHE_NAME = 'v1';

const assets = [
  "/",
  "/index.html",
  "/manifest.json",
];

// Get all files within a folder and add them to the assest to cache
async function listFilesRecursively(folder) {
  const files = [];
  const response = await fetch(folder);
  const text = await response.text();
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/g;
  let match;
  while ((match = linkRegex.exec(text)) !== null) {
    const link = match[1];
    const url = folder+link;
    if (url.charAt(url.length - 1) === '/') {
      files.push(...await listFilesRecursively(url));
    } else {
      files.push(url);
    }
  }
  return files;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        const filesToCache = [...assets];
        filesToCache.push(...await listFilesRecursively('/scripts/'));
        filesToCache.push(...await listFilesRecursively('/styles/'));
        cache.addAll(filesToCache)
          .then(() => {
            console.log('Assets cached');
          })
          .catch((err) => {
            console.error('Error adding assets to cache', err);
          });
      })
      .catch((error) => {
        console.error('Error caching files:', error);
      })
  );
});

self.addEventListener('fetch', (fetchEvent) => {
  console.log('Service Worker: Fetching...');
  fetchEvent.respondWith(
    caches.match(fetchEvent.request)
      .then((res) => {
        // Attempt to fetch a fresh copy from the network
        const fetchPromise = fetch(fetchEvent.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response to use it and store it in the cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(fetchEvent.request, responseToCache);
              });

            return response;
          })
          .catch((err) => {
            console.error('Error fetching and caching new assets:', err);
          });

        // Return the cached response or the network response if available
        return res || fetchPromise;
      })
      .catch((err) => {
        console.error('Error fetching assets from cache:', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Force page update when Service Worker is activated
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
