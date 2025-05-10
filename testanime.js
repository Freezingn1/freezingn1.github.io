(function() {
    'use strict';

    // Конфигурация плагина
    const plugin = {
        name: 'tmdb_anime_lists',
        title: 'Аниме коллекции',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M18 9c0-1.1-.9-2-2-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-2c1.1 0 2-.9 2-2v-4zm-2 0v4h-2V9h2zM4 5h10v12H4V5z"/></svg>',
        api_key: 'f83446fde4dacae2924b41ff789d2bb0', // Замените на свой ключ TMDB
        lists: [
            {id: 146567, name: 'Топ аниме-сериалы'}
        ]
    };

    // Ждем готовности Lampa
    function waitForLampa(callback) {
        if (window.Lampa && Lampa.Storage && Lampa.Activity) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 100);
        }
    }

    // Добавляем пункт в меню
    function addMenuButton() {
        const menuContainer = $('.menu .menu__list:first');
        if (!menuContainer.length) {
            setTimeout(addMenuButton, 500);
            return;
        }

        // Проверяем, не добавлен ли уже пункт
        if ($(`[data-action="${plugin.name}"]`).length) return;

        const menuItem = $(`
            <li class="menu__item selector" data-action="${plugin.name}">
                <div class="menu__ico">${plugin.icon}</div>
                <div class="menu__text">${plugin.title}</div>
            </li>
        `);

        menuItem.on('hover:enter', showMainMenu);
        menuContainer.prepend(menuItem);
    }

    // Показываем главное меню плагина
    function showMainMenu() {
        Lampa.Activity.push({
            component: 'selector',
            title: plugin.title,
            items: plugin.lists.map(list => ({
                title: list.name,
                icon: list.icon || plugin.icon,
                action: () => loadAnimeList(list.id, list.name)
            })),
            back: true
        });
    }

    // Загружаем список аниме
    function loadAnimeList(listId, listName) {
        Lampa.Activity.push({
            component: 'full',
            title: listName,
            source: 'tmdb_anime_loader',
            method: 'list',
            params: {id: listId},
            back: true
        });
    }

    // Регистрируем загрузчик данных
    function registerLoader() {
        Lampa.Storage.add('tmdb_anime_loader', {
            load: function(params) {
    return Promise.resolve({
        results: [{
            id: 123,
            type: 'tv',
            name: 'Тестовое аниме',
            poster: 'https://image.tmdb.org/t/p/w300/8fLNbQ6WtDlJ3LcyhpKojIpKz0V.jpg',
            rating: 8.5,
            year: 2023
        }],
        more: false
    });
}
        });
    }

    // Инициализация плагина
    waitForLampa(() => {
        registerLoader();
        addMenuButton();
        
        // Обновляем меню при каждом его открытии
        Lampa.Listener.follow('app_menu', () => {
            setTimeout(addMenuButton, 300);
        });
    });

})();