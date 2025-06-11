(function() {
    'use strict';

    // Настройки
    const MAX_RETRIES = 3;      // Макс. попытки
    const RETRY_DELAY = 1000;   // Задержка между попытками (мс)
    const USE_PROXY = Lampa.Storage.field('proxy_tmdb'); // Берём значение из настроек

    // Базовые URL
    const PROXY_API_URL = 'https://lampa.byskaz.ru/tmdb/api/3/';
    const PROXY_IMG_URL = 'https://lampa.byskaz.ru/tmdb/img/';
    const DIRECT_API_URL = 'https://api.themoviedb.org/3/';
    const DIRECT_IMG_URL = 'https://image.tmdb.org/';

    // Универсальный запрос с повторами
    async function fetchWithRetry(url) {
        let lastError;
        
        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                const response = await fetch(url);
                if (response.ok) return response;
                throw new Error(`HTTP ${response.status}`);
            } catch (error) {
                lastError = error;
                console.warn(`Попытка ${i + 1} не удалась (${url})`, error.message);
                if (i < MAX_RETRIES - 1) await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
        }
        
        throw lastError;
    }

    // Переопределяем методы TMDB
    Lampa.TMDB.api = async function(url) {
        const targetUrl = USE_PROXY ? PROXY_API_URL + url : DIRECT_API_URL + url;
        try {
            const response = await fetchWithRetry(targetUrl);
            return response.json();
        } catch (error) {
            console.error('Ошибка API запроса:', error);
            throw error;
        }
    };

    Lampa.TMDB.image = function(url) {
        return USE_PROXY ? PROXY_IMG_URL + url : DIRECT_IMG_URL + url;
    };

    // Убираем настройки прокси из интерфейса
    Lampa.Settings.listener.follow('open', function(e) {
        if (e.name === 'tmdb') {
            e.body.find('[data-parent="proxy"]').remove();
        }
    });

    console.log('TMDB Proxy: инициализирован (используется ' + (USE_PROXY ? 'ПРОКСИ' : 'ПРЯМОЕ подключение') + ')');
})();