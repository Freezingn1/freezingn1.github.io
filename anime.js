(function() {
    'use strict';

    // Конфигурация плагина
    const config = {
        tmdbListId: '146567', // Замените на реальный ID списка
        fallbackUrl: 'discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc',
        maxRetries: 3
    };

    // Ждем готовности приложения
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            initAnimePlugin();
        }
    });

    function initAnimePlugin() {
        try {
            if (typeof Lampa === 'undefined' || !Lampa.Manifest) {
                console.error('Lampa API not available');
                return;
            }

            if (Lampa.Manifest.origin !== 'bylampa') {
                Lampa.Noty.show('Ошибка доступа', 3000);
                return;
            }

            const menuItem = createMenuItem();
            const $menuList = $('.menu .menu__list').first();
            
            if ($menuList.length) {
                $menuList.prepend(menuItem);
            } else {
                console.error('Menu element not found');
            }
        } catch (e) {
            console.error('Plugin initialization error:', e);
        }
    }

    function createMenuItem() {
        const animeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
            <path fill="currentColor" fill-rule="evenodd" d="m368.256 214.573l-102.627 187.35c40.554 71.844 73.647 97.07 138.664 94.503c63.67-2.514 136.974-89.127 95.694-163.243L397.205 150.94c-3.676 12.266-25.16 55.748-28.95 63.634M216.393 440.625C104.077 583.676-57.957 425.793 20.85 302.892c0 0 83.895-147.024 116.521-204.303c25.3-44.418 53.644-72.37 90.497-81.33c44.94-10.926 97.565 12.834 125.62 56.167c19.497 30.113 36.752 57.676 6.343 109.738c-3.613 6.184-136.326 248.402-143.438 257.46m8.014-264.595c-30.696-17.696-30.696-62.177 0-79.873s69.273 4.544 69.273 39.936s-38.578 57.633-69.273 39.937" clip-rule="evenodd"/>
        </svg>`;

        const menuItem = $(`
            <li class="menu__item selector" data-action="anime_tmdb">
                <div class="menu__ico">${animeIcon}</div>
                <div class="menu__text">Аниме</div>
            </li>
        `);

        menuItem.on('hover:enter', function() {
            openAnimeSectionWithRetry();
        });

        return menuItem;
    }

    function openAnimeSectionWithRetry(retryCount = 0) {
        try {
            const params = {
                url: config.tmdbListId ? `list/${config.tmdbListId}` : config.fallbackUrl,
                title: 'Аниме',
                component: 'category_full',
                source: 'tmdb',
                card_type: 'true',
                page: 1,
                error: function(xhr, status, error) {
                    console.error('TMDB API error:', status, error);
                    
                    if (retryCount < config.maxRetries) {
                        console.log(`Retrying... (${retryCount + 1}/${config.maxRetries})`);
                        setTimeout(() => openAnimeSectionWithRetry(retryCount + 1), 2000);
                    } else {
                        Lampa.Noty.show('Ошибка загрузки данных', 3000);
                        openFallbackSection();
                    }
                },
                success: function(data) {
                    if (!data || !data.results || !Array.isArray(data.results)) {
                        console.error('Invalid data format:', data);
                        if (retryCount < config.maxRetries) {
                            setTimeout(() => openAnimeSectionWithRetry(retryCount + 1), 2000);
                        } else {
                            openFallbackSection();
                        }
                        return false;
                    }
                    
                    if (data.results.length === 0) {
                        console.warn('Empty results array');
                        openFallbackSection();
                        return false;
                    }
                    
                    return true;
                }
            };

            Lampa.Activity.push(params);
        } catch (e) {
            console.error('Error in openAnimeSection:', e);
            if (retryCount < config.maxRetries) {
                setTimeout(() => openAnimeSectionWithRetry(retryCount + 1), 2000);
            } else {
                openFallbackSection();
            }
        }
    }

    function openFallbackSection() {
        try {
            console.log('Using fallback anime section');
            Lampa.Activity.push({
                url: config.fallbackUrl,
                title: 'Аниме (Общая подборка)',
                component: 'category_full',
                source: 'tmdb',
                card_type: 'true',
                page: 1
            });
        } catch (e) {
            console.error('Error opening fallback section:', e);
            Lampa.Noty.show('Не удалось загрузить аниме', 3000);
        }
    }

    // Инициализация платформы
    if (typeof Lampa.Platform !== 'undefined') {
        Lampa.Platform.tv();
    }
})();