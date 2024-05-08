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
        return res || fetch(fetchEvent.request);
      })
      .catch((err) => {
        console.error('Error fetching assets', err);
      })
  );
});
