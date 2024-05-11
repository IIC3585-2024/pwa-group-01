importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js")
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js")
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js")

firebase.initializeApp({
  apiKey: "AIzaSyCRfhLBHpwzz0iWZbYHakvesAu7FK3x2_w",
  authDomain: "pwa-grupo1.firebaseapp.com",
  databaseURL: "https://pwa-grupo1-default-rtdb.firebaseio.com",
  projectId: "pwa-grupo1",
  storageBucket: "pwa-grupo1.appspot.com",
  messagingSenderId: "179629559064",
  appId: "1:179629559064:web:63ac484d65bc974737e26d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
      body:  payload.notification.body,
  };

  self.registration.showNotification(notificationTitle,
      notificationOptions);
});

const CACHE_NAME = 'v1';

const assets = [
  "",
  "index.html",
  "manifest.json",
  "scripts/components/addNote.js",
  "scripts/app.js",
  "scripts/db.js",
  "scripts/firebase.js",
  "scripts/view.js",
  "styles/style.css"
];

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request)
    })
  )
})

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


self.addEventListener('message', (event) => {
  // Force page update when Service Worker is activated
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
        client.postMessage({ action: 'assetsCached' });
    });
});
