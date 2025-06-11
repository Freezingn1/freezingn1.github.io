(function () {
    'use strict';

    // Конфигурация
    const config = {
        maxRetries: 3,          // Максимальное количество попыток
        retryDelay: 1000,       // Задержка между попытками (мс)
        requestTimeout: 5000,   // Таймаут запроса (мс)
        maxConcurrentRequests: 5, // Максимальное количество одновременных запросов
        fallbackToDirect: true  // Переключиться на прямое подключение при неудаче
    };

    // Очередь и счетчик запросов
    let activeRequests = 0;
    const requestQueue = [];

    // Прокси и базовые URL
    const proxyUrls = {
        image: 'http://lampa.byskaz.ru/tmdb/img/',
        api: 'http://lampa.byskaz.ru/tmdb/api/3/'
    };

    const directUrls = {
        image: () => Lampa.Utils.protocol() + 'image.tmdb.org/',
        api: () => Lampa.Utils.protocol() + 'api.themoviedb.org/3/'
    };

    // Функция для выполнения запроса с учетом ограничений
    async function executeRequest(url) {
        if (activeRequests >= config.maxConcurrentRequests) {
            await new Promise(resolve => requestQueue.push(resolve));
        }

        activeRequests++;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.requestTimeout);

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            return response;
        } finally {
            activeRequests--;
            if (requestQueue.length > 0) requestQueue.shift()();
        }
    }

    // Функция с повторными попытками
    async function fetchWithRetry(url, isProxy) {
        let lastError;
        
        for (let i = 0; i < config.maxRetries; i++) {
            try {
                return await executeRequest(url);
            } catch (error) {
                lastError = error;
                console.warn(`Attempt ${i + 1} failed for ${url}:`, error.message);
                
                // Если это не последняя попытка - ждем перед повторным запросом
                if (i < config.maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, config.retryDelay));
                }
            }
        }

        // Если включено резервное прямое подключение и использовался прокси
        if (config.fallbackToDirect && isProxy) {
            console.log('Falling back to direct connection');
            const directUrl = url.replace(proxyUrls.api, directUrls.api()).replace(proxyUrls.image, directUrls.image());
            return executeRequest(directUrl);
        }

        throw lastError || new Error('Unknown error');
    }

    // Модифицированные функции TMDB
    Lampa.TMDB.image = function (url) {
        const useProxy = Lampa.Storage.field('proxy_tmdb');
        const fullUrl = useProxy ? proxyUrls.image + url : directUrls.image() + url;
        return fetchWithRetry(fullUrl, useProxy).then(response => response.url);
    };

    Lampa.TMDB.api = function (url) {
        const useProxy = Lampa.Storage.field('proxy_tmdb');
        const fullUrl = useProxy ? proxyUrls.api + url : directUrls.api() + url;
        return fetchWithRetry(fullUrl, useProxy).then(response => response.json());
    };

    // Удаление настроек прокси из интерфейса
    Lampa.Settings.listener.follow('open', function (e) {
        if (e.name == 'tmdb') {
            e.body.find('[data-parent="proxy"]').remove();
        }
    });

    // Логирование для отладки
    console.log('TMDB Proxy initialized with configuration:', config);
})();