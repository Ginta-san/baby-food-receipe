const CACHE_NAME = 'baby-food-v4';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/utils/constants.js',
  './js/models/FoodItem.js',
  './js/models/Recipe.js',
  './js/models/Inventory.js',
  './js/services/StorageService.js',
  './js/services/HistoryService.js',
  './js/services/RecipeGenerator.js',
  './js/ui/RecipeView.js',
  './js/ui/InventoryView.js',
  './js/ui/HistoryView.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
