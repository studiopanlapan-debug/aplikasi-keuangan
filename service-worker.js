// Versi cache dinaikkan untuk memastikan pembaruan.
const STATIC_CACHE_NAME = 'personal-finance-static-v6';
const DYNAMIC_CACHE_NAME = 'personal-finance-dynamic-v6';

// Aset inti aplikasi (app shell) yang akan disimpan saat instalasi.
// Ini hanya mencakup file lokal untuk memastikan instalasi yang cepat dan andal.
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-48x48.png',
  '/icons/icon-96x96.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Event: Install
// Menyimpan app shell ke dalam cache statis.
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching App Shell:', STATIC_ASSETS);
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('[Service Worker] Failed to cache app shell:', error);
      })
  );
});

// Event: Activate
// Membersihkan semua cache lama agar hanya versi terbaru yang aktif.
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
          console.log('[Service Worker] Removing old cache:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// Event: Fetch
// Menerapkan strategi caching yang cerdas.
self.addEventListener('fetch', (event) => {
  // Abaikan request selain GET.
  if (event.request.method !== 'GET') {
    return;
  }

  // Abaikan request dari ekstensi browser untuk mencegah error.
  if (!event.request.url.startsWith('http')) {
      return;
  }

  // Strategi untuk aset eksternal (CDN): cache-first, lalu network, dan simpan.
  // Ini akan menyimpan library secara dinamis saat pertama kali diakses.
  const isCdnUrl = event.request.url.includes('aistudiocdn.com') 
                || event.request.url.includes('cdn.tailwindcss.com')
                || event.request.url.includes('unpkg.com'); // Add Babel CDN
  
  if (isCdnUrl) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          // Jika ada di cache, langsung gunakan.
          if (response) {
            return response;
          }
          // Jika tidak, ambil dari network, lalu simpan ke cache untuk nanti.
          return fetch(event.request).then((networkResponse) => {
            cache.put(event.request.url, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } else {
    // Strategi untuk aset lokal: cache-first.
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Kembalikan dari cache jika ada, atau ambil dari network jika tidak.
          return response || fetch(event.request);
        })
    );
  }
});