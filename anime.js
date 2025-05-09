(function () {
    'use strict';

    // Создаем элемент меню
    var menuItem = $('<li data-action="anime2" class="menu__item selector">' +
        '<div class="menu__ico">' +
        '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">' +
        '<g><g><path fill="currentColor" d="M482.909,67.2H29.091C13.05,67.2,0,80.25,0,96.291v319.418C0,431.75,13.05,444.8,29.091,444.8h453.818c16.041,0,29.091-13.05,29.091-29.091V96.291C512,80.25,498.95,67.2,482.909,67.2z M477.091,409.891H34.909V102.109h442.182V409.891z"/></g></g>' +
        '<g><g><rect fill="currentColor" x="126.836" y="84.655" width="34.909" height="342.109"/></g></g>' +
        '<g><g><rect fill="currentColor" x="350.255" y="84.655" width="34.909" height="342.109"/></g></g>' +
        '<g><g><rect fill="currentColor" x="367.709" y="184.145" width="126.836" height="34.909"/></g></g>' +
        '<g><g><rect fill="currentColor" x="17.455" y="184.145" width="126.836" height="34.909"/></g></g>' +
        '<g><g><rect fill="currentColor" x="367.709" y="292.364" width="126.836" height="34.909"/></g></g>' +
        '<g><g><rect fill="currentColor" x="17.455" y="292.364" width="126.836" height="34.909"/></g></g>' +
        '</svg></div>' +
        '<div class="menu__text">Anime2</div></li>');

    // Функция для добавления пункта меню
    function addMenuItem() {
        console.log('[Anime2 Plugin] Attempting to add menu item...');
        // Находим меню
        var menu = $('.menu .menu__list');
        if (menu.length) {
            console.log('[Anime2 Plugin] Menu found, adding item...');
            // Добавляем пункт меню
            menu.append(menuItem);
            
            // Добавляем обработчик клика
            menuItem.on('click', function() {
                console.log('[Anime2 Plugin] Anime2 menu item clicked');
                // Проверяем, доступен ли TMDB
                if (Lampa.TMDB && Lampa.TMDB.api_key) {
                    console.log('[Anime2 Plugin] TMDB is configured');
                    Lampa.Activity.push({
                        url: 'discover/tv', // Используем endpoint для сериалов
                        title: 'Anime2',
                        component: 'category_full', // Для отображения карточек
                        source: 'tmdb',
                        page: 1,
                        filters: {
                            with_genres: '16', // Жанр "Анимация"
                            with_original_language: 'ja', // Только японский язык для аниме
                            sort_by: 'popularity.desc' // Сортировка по популярности
                        }
                    });
                } else {
                    console.error('[Anime2 Plugin] TMDB API key is not configured!');
                    Lampa.Noty.show('Ошибка: TMDB API ключ не настроен. Проверьте настройки Lampa.');
                }
            });
            console.log('[Anime2 Plugin] Menu item added successfully');
        } else {
            console.error('[Anime2 Plugin] Menu not found!');
        }
    }

    // Инициализация плагина
    function init() {
        console.log('[Anime2 Plugin] Initializing plugin...');
        if (window.Lampa) {
            console.log('[Anime2 Plugin] Lampa is loaded');
            addMenuItem();
        } else {
            console.log('[Anime2 Plugin] Lampa not loaded, waiting for lampa:loaded event');
            window.addEventListener('lampa:loaded', function() {
                console.log('[Anime2 Plugin] Lampa:loaded event triggered');
                addMenuItem();
            });
        }
    }

    // Запускаем инициализацию
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('[Anime2 Plugin] Document ready, initializing...');
        init();
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[Anime2 Plugin] DOMContentLoaded, initializing...');
            init();
        });
    }

})();