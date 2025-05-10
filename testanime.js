(function() {
    'use strict';

    const plugin = {
        name: 'tmdb_anime_lists',
        title: 'Аниме коллекции',
        icon: '🎌',
        lists: [
            {id: 'test', name: 'Тестовая коллекция'}
        ]
    };

    // 1. Проверяем готовность Lampa
    function initPlugin() {
        if (!window.Lampa || !Lampa.Storage || !Lampa.Activity) {
            console.error('Lampa API не доступен');
            setTimeout(initPlugin, 100);
            return;
        }

        console.log('Lampa API доступен');

        // 2. Регистрируем тестовый загрузчик
        Lampa.Storage.add('anime_test_loader', {
            load: function() {
                console.log('Загрузчик вызван');
                return Promise.resolve({
                    results: [{
                        id: 1,
                        type: 'tv',
                        name: 'Тестовое аниме',
                        title: 'Тестовое аниме (2023)',
                        original_title: 'Test Anime',
                        poster: 'https://image.tmdb.org/t/p/w300/8fLNbQ6WtDlJ3LcyhpKojIpKz0V.jpg',
                        cover: 'https://image.tmdb.org/t/p/original/9faGSFi5jam6pDWGNd0p8JcJgXQ.jpg',
                        description: 'Это тестовый пример аниме',
                        year: 2023,
                        rating: 8.5,
                        age: '16+',
                        genres: ['аниме', 'приключения'],
                        countries: ['Япония']
                    }],
                    more: false
                });
            }
        });

        // 3. Добавляем пункт меню
        function addMenuButton() {
            const menu = $('.menu .menu__list').first();
            if (!menu.length) {
                setTimeout(addMenuButton, 300);
                return;
            }

            if (!menu.find(`[data-action="${plugin.name}"]`).length) {
                menu.prepend(`
                    <li class="menu__item selector" data-action="${plugin.name}">
                        <div class="menu__ico">${plugin.icon}</div>
                        <div class="menu__text">${plugin.title}</div>
                    </li>
                `).find(`[data-action="${plugin.name}"]`).on('hover:enter', function() {
                    Lampa.Activity.push({
                        component: 'full',
                        url: '',
                        title: plugin.title,
                        source: 'anime_test_loader',
                        method: 'list',
                        card_type: 'default'
                    });
                });
                console.log('Пункт меню добавлен');
            }
        }

        addMenuButton();

        // 4. Дублируем добавление при открытии меню
        Lampa.Listener.follow('app_menu', addMenuButton);
    }

    // Запускаем после небольшой задержки
    setTimeout(initPlugin, 500);
})();