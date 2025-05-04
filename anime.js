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
            <li class="menu__item selector" data-action="anime_tmdb">
                <div class="menu__ico">${animeIcon}</div>
                <div class="menu__text">Аниме</div>
            </li>
        `);

        // Обработчик клика с обработкой ошибок
        menuItem.on('hover:enter', function() {
            try {
                openAnimeSection();
            } catch (e) {
                console.error('Error opening anime section:', e);
                Lampa.Noty.show('Ошибка при открытии раздела Аниме');
            }
        });

        return menuItem;
    }

    function openAnimeSection() {
        // ЗДЕСЬ УКАЖИТЕ ID ВАШЕГО СПИСКА АНИМЕ ИЗ TMDB
        const tmdbListId = '146567'; // Замените на реальный ID
        
        // Параметры для запроса с обработкой ошибок
        const params = {
            url: `list/${tmdbListId}`,
            title: 'Аниме',
            component: 'category_full',
            source: 'tmdb',
            card_type: 'true',
            page: 1,
            error: function() {
                Lampa.Noty.show('Не удалось загрузить список аниме');
            },
            success: function(data) {
                if (!data || !data.results || data.results.length === 0) {
                    Lampa.Noty.show('Список аниме пуст');
                    return false; // Прерываем обработку
                }
                return true; // Продолжаем стандартную обработку
            }
        };

        // Альтернативный вариант с discover API
        // const params = {
        //     url: 'discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc',
        //     title: 'Аниме',
        //     component: 'category_full',
        //     source: 'tmdb',
        //     card_type: 'true',
        //     page: 1,
        //     error: function() {
        //         Lampa.Noty.show('Не удалось загрузить аниме');
        //     }
        // };

        // Открываем раздел с обработкой ошибок
        try {
            Lampa.Activity.push(params);
        } catch (e) {
            console.error('Activity push error:', e);
            Lampa.Noty.show('Ошибка при открытии раздела');
        }
    }

    // Устанавливаем платформу как TV
    Lampa.Platform.tv();
})();