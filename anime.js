(function() {
    'use strict';

    // Ждем готовности приложения
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            initAnimePlugin();
        }
    });

    function initAnimePlugin() {
        // Проверяем, что это официальное приложение Lampa
        if (Lampa.Manifest.origin !== 'bylampa') {
            Lampa.Noty.show('Ошибка доступа');
            return;
        }

        // Создаем пункт меню для Аниме
        const menuItem = createMenuItem();
        
        // Добавляем пункт в начало меню
        $('.menu .menu__list').eq(0).prepend(menuItem);
    }

    function createMenuItem() {
        // SVG иконка для аниме
        const animeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
            <path fill="currentColor" fill-rule="evenodd" d="m368.256 214.573l-102.627 187.35c40.554 71.844 73.647 97.07 138.664 94.503c63.67-2.514 136.974-89.127 95.694-163.243L397.205 150.94c-3.676 12.266-25.16 55.748-28.95 63.634M216.393 440.625C104.077 583.676-57.957 425.793 20.85 302.892c0 0 83.895-147.024 116.521-204.303c25.3-44.418 53.644-72.37 90.497-81.33c44.94-10.926 97.565 12.834 125.62 56.167c19.497 30.113 36.752 57.676 6.343 109.738c-3.613 6.184-136.326 248.402-143.438 257.46m8.014-264.595c-30.696-17.696-30.696-62.177 0-79.873s69.273 4.544 69.273 39.936s-38.578 57.633-69.273 39.937" clip-rule="evenodd"/>
        </svg>`;

        // Создаем элемент меню
        const menuItem = $(`
            <li class="menu__item selector" data-action="anime_section">
                <div class="menu__ico">${animeIcon}</div>
                <div class="menu__text">Аниме</div>
            </li>
        `);

        // Обработчик клика
        menuItem.on('hover:enter', function() {
            openAnimeHomePage();
        });

        return menuItem;
    }

    function openAnimeHomePage() {
        // Создаем страницу в стиле главной
        Lampa.Activity.push({
            component: 'main',
            url: '',
            title: 'Аниме',
            content: createAnimeContent(),
            back: true
        });
    }

    function createAnimeContent() {
        // Создаем контент в стиле главной страницы
        return `
            <div class="home">
                <!-- Популярное аниме -->
                <div class="home__category">
                    <div class="home__category-head">
                        <div class="home__category-title">Популярное аниме</div>
                    </div>
                    <div class="home__category-content" data-component="full" data-source="tmdb" data-type="anime_popular" data-url="discover/tv?with_original_language=ja&sort_by=popularity.desc"></div>
                </div>
                
                <!-- Топ аниме по рейтингу -->
                <div class="home__category">
                    <div class="home__category-head">
                        <div class="home__category-title">Топ аниме</div>
                    </div>
                    <div class="home__category-content" data-component="full" data-source="tmdb" data-type="anime_top" data-url="discover/tv?with_original_language=ja&sort_by=vote_average.desc&vote_count.gte=100"></div>
                </div>
                
                <!-- Новинки аниме -->
                <div class="home__category">
                    <div class="home__category-head">
                        <div class="home__category-title">Новинки аниме</div>
                    </div>
                    <div class="home__category-content" data-component="full" data-source="tmdb" data-type="anime_new" data-url="discover/tv?with_original_language=ja&sort_by=first_air_date.desc"></div>
                </div>
                
                <!-- Скоро выйдет -->
                <div class="home__category">
                    <div class="home__category-head">
                        <div class="home__category-title">Скоро выйдет</div>
                    </div>
                    <div class="home__category-content" data-component="full" data-source="tmdb" data-type="anime_upcoming" data-url="discover/tv?with_original_language=ja&sort_by=first_air_date.desc&first_air_date.gte=${new Date().toISOString().split('T')[0]}"></div>
                </div>
            </div>
        `;
    }

    // Устанавливаем платформу как TV (для корректного отображения)
    Lampa.Platform.tv();
})();