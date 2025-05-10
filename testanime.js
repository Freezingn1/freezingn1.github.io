(function() {
    'use strict';

    const plugin = {
        name: 'tmdb_anime_lists',
        title: 'Аниме коллекции',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M18 9c0-1.1-.9-2-2-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-2c1.1 0 2-.9 2-2v-4zm-2 0v4h-2V9h2zM4 5h10v12H4V5z"/></svg>',
        lists: [
            {id: 'test_list', name: 'Тестовая коллекция'}
        ]
    };

    function waitForLampa(callback) {
        if (window.Lampa && Lampa.Storage && Lampa.Activity) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 100);
        }
    }

    function addMenuButton() {
        const menuContainer = $('.menu .menu__list:first');
        if (!menuContainer.length) {
            setTimeout(addMenuButton, 500);
            return;
        }

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

    function showMainMenu() {
        Lampa.Activity.push({
            component: 'selector',
            title: plugin.title,
            items: plugin.lists.map(list => ({
                title: list.name,
                action: () => loadAnimeList(list.id, list.name)
            })),
            back: true
        });
    }

    function loadAnimeList(listId, listName) {
        Lampa.Activity.push({
            component: 'full',
            title: listName,
            source: 'anime_test_loader',
            method: 'list',
            params: {id: listId},
            back: true
        });
    }

    function registerLoader() {
        Lampa.Storage.add('anime_test_loader', {
            load: function(params) {
                return new Promise((resolve) => {
                    // Полноценный тестовый объект со всеми обязательными полями
                    const testItem = {
                        id: 123,
                        type: 'tv',
                        name: 'Тестовое аниме',
                        title: 'Тестовое аниме',
                        original_title: 'Test Anime',
                        year: 2023,
                        poster: 'https://image.tmdb.org/t/p/w300/8fLNbQ6WtDlJ3LcyhpKojIpKz0V.jpg',
                        cover: 'https://image.tmdb.org/t/p/original/9faGSFi5jam6pDWGNd0p8JcJgXQ.jpg',
                        description: 'Это тестовое аниме для проверки плагина',
                        rating: 8.5,
                        age: '16+',
                        genres: ['аниме', 'тест'],
                        countries: ['Япония']
                    };

                    resolve({
                        results: [testItem],
                        more: false
                    });
                });
            }
        });
    }

    waitForLampa(() => {
        registerLoader();
        addMenuButton();
        
        Lampa.Listener.follow('app_menu', () => {
            setTimeout(addMenuButton, 300);
        });
        
        console.log('Плагин аниме инициализирован');
    });

})();