(function() {
    'use strict';

    // Конфигурация плагина
    const config = {
        tmdbListId: '146567', // Замените на реальный ID списка
        fallbackUrl: 'discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc',
        maxRetries: 2,
        retryDelay: 1000
    };

    // Основная функция инициализации
    function initPlugin() {
        if (!window.Lampa || !Lampa.Listener) {
            console.error('Lampa API not available');
            return setTimeout(initPlugin, 1000);
        }

        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                try {
                    if (Lampa.Manifest.origin !== 'bylampa') {
                        Lampa.Noty.show('Ошибка доступа', 3000);
                        return;
                    }

                    addAnimeMenuItem();
                } catch (e) {
                    console.error('Init error:', e);
                }
            }
        });
    }

    // Добавление пункта меню
    function addAnimeMenuItem() {
        const menuItem = $(`
            <li class="menu__item selector" data-action="anime_tmdb">
                <div class="menu__ico">
                    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                        <path fill="currentColor" fill-rule="evenodd" d="m368.256 214.573l-102.627 187.35c40.554 71.844 73.647 97.07 138.664 94.503c63.67-2.514 136.974-89.127 95.694-163.243L397.205 150.94c-3.676 12.266-25.16 55.748-28.95 63.634M216.393 440.625C104.077 583.676-57.957 425.793 20.85 302.892c0 0 83.895-147.024 116.521-204.303c25.3-44.418 53.644-72.37 90.497-81.33c44.94-10.926 97.565 12.834 125.62 56.167c19.497 30.113 36.752 57.676 6.343 109.738c-3.613 6.184-136.326 248.402-143.438 257.46m8.014-264.595c-30.696-17.696-30.696-62.177 0-79.873s69.273 4.544 69.273 39.936s-38.578 57.633-69.273 39.937" clip-rule="evenodd"/>
                    </svg>
                </div>
                <div class="menu__text">Аниме</div>
            </li>
        `);

        menuItem.on('hover:enter', function() {
            safeOpenAnimeSection();
        });

        const $menu = $('.menu .menu__list').first();
        if ($menu.length) {
            $menu.prepend(menuItem);
        } else {
            console.error('Menu container not found');
        }
    }

    // Безопасное открытие раздела
    function safeOpenAnimeSection() {
        try {
            const params = buildRequestParams();
            params.success = handleDataResponse;
            params.error = handleRequestError;
            
            Lampa.Activity.push(params);
        } catch (e) {
            console.error('Section open error:', e);
            Lampa.Noty.show('Ошибка открытия раздела', 3000);
        }
    }

    // Построение параметров запроса
    function buildRequestParams() {
        return {
            url: config.tmdbListId ? `list/${config.tmdbListId}` : config.fallbackUrl,
            title: 'Аниме',
            component: 'category_full',
            source: 'tmdb',
            card_type: 'true',
            page: 1
        };
    }

    // Обработка ответа от API
    function handleDataResponse(data, status, xhr) {
        if (!data || typeof data !== 'object') {
            console.error('Invalid response data:', data);
            throw new Error('Invalid API response');
        }

        if (!data.results || !Array.isArray(data.results)) {
            console.error('Results not found or not array:', data);
            throw new Error('Invalid results format');
        }

        if (data.results.length === 0) {
            console.warn('Empty results array');
            Lampa.Noty.show('Список аниме пуст', 2000);
        }

        return true;
    }

    // Обработка ошибок запроса
    function handleRequestError(xhr, status, error) {
        console.error('API request failed:', status, error);
        
        if (xhr.status === 404 && config.tmdbListId) {
            console.log('Trying fallback API method');
            Lampa.Activity.push({
                url: config.fallbackUrl,
                title: 'Аниме',
                component: 'category_full',
                source: 'tmdb',
                card_type: 'true',
                page: 1,
                success: handleDataResponse,
                error: function() {
                    Lampa.Noty.show('Ошибка загрузки данных', 3000);
                }
            });
        } else {
            Lampa.Noty.show('Ошибка соединения', 3000);
        }
    }

    // Инициализация платформы
    if (window.Lampa && Lampa.Platform) {
        Lampa.Platform.tv();
    } else {
        console.warn('Lampa.Platform not available');
    }

    // Запуск плагина
    initPlugin();
})();