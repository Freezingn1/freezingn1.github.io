// Имя кэша
const CACHE_NAME = 'image-cache-v1';

// Функция для кэширования всех изображений на странице
async function cacheAllImages() {
  try {
    // Открываем или создаем кэш
    const cache = await caches.open(CACHE_NAME);
    
    // Получаем все элементы img на странице
    const images = document.querySelectorAll('img');
    
    // Для каждого изображения
    for (const img of images) {
      // Получаем URL изображения
      const imgUrl = img.src;
      
      // Проверяем, есть ли уже изображение в кэше
      const cachedResponse = await cache.match(imgUrl);
      
      if (!cachedResponse) {
        try {
          // Загружаем изображение с сервера
          const response = await fetch(imgUrl);
          
          // Если ответ успешный, добавляем в кэш
          if (response.ok) {
            await cache.put(imgUrl, response.clone());
            console.log('Cached image:', imgUrl);
          }
        } catch (err) {
          console.error('Failed to cache image:', imgUrl, err);
        }
      } else {
        console.log('Image already in cache:', imgUrl);
      }
    }
    
    console.log('All images processed');
  } catch (err) {
    console.error('Cache operation failed:', err);
  }
}

// Функция для перехвата запросов изображений и возврата из кэша
async function interceptImageRequests() {
  // Добавляем обработчик fetch событий
  self.addEventListener('fetch', (event) => {
    // Проверяем, является ли запрос запросом изображения
    if (event.request.destination === 'image') {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          // Возвращаем изображение из кэша, если оно там есть
          if (cachedResponse) {
            console.log('Serving from cache:', event.request.url);
            return cachedResponse;
          }
          // Иначе загружаем с сервера
          return fetch(event.request).then((response) => {
            // Клонируем ответ, так как он может быть использован только один раз
            const responseToCache = response.clone();
            
            // Добавляем изображение в кэш для будущих запросов
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
              console.log('Caching new image:', event.request.url);
            });
            
            return response;
          });
        })
      );
    }
  });
}

// Инициализация кэширования
async function initImageCache() {
  // Проверяем поддержку Cache API
  if ('caches' in window && 'serviceWorker' in navigator) {
    try {
      // Регистрируем Service Worker для перехвата запросов
      const registration = await navigator.serviceWorker.register('sw.js');
      console.log('ServiceWorker registered');
      
      // Запускаем кэширование изображений
      await cacheAllImages();
      
      // Запускаем перехват запросов
      await interceptImageRequests();
    } catch (err) {
      console.error('ServiceWorker registration failed:', err);
    }
  } else {
    console.warn('Cache API or Service Workers not supported in this browser');
  }
}

// Запускаем кэширование при загрузке страницы
window.addEventListener('load', initImageCache);