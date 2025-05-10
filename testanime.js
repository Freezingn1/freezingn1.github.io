(function() {
    'use strict';
    
    const plugin = {
        name: 'test_anime_plugin',
        title: 'Тест Аниме',
        icon: '🎌'
    };

    function init() {
        // 1. Проверяем добавление в меню
        const menuItem = $(`
            <li class="menu__item selector" data-action="${plugin.name}">
                <div class="menu__ico">${plugin.icon}</div>
                <div class="menu__text">${plugin.title}</div>
            </li>
        `);
        
        menuItem.on('hover:enter', () => {
            // 2. Проверяем открытие Activity
            Lampa.Activity.push({
                component: 'full',
                title: 'Тестовые данные',
                source: 'test_anime_loader',
                method: 'list',
                back: true
            });
        });
        
        // 3. Пытаемся добавить в меню
        const tryAddToMenu = () => {
            const menu = $('.menu .menu__list:first');
            if (menu.length) {
                menu.prepend(menuItem);
                console.log('Пункт меню добавлен!');
            } else {
                setTimeout(tryAddToMenu, 500);
            }
        };
        
        tryAddToMenu();
        
        // 4. Регистрируем тестовый загрузчик
        Lampa.Storage.add('test_anime_loader', {
            load: () => Promise.resolve({
                results: [{
                    id: 1,
                    type: 'tv',
                    name: 'Тестовое аниме',
                    poster: 'https://image.tmdb.org/t/p/w300/8fLNbQ6WtDlJ3LcyhpKojIpKz0V.jpg',
                    year: 2023,
                    rating: 8.5
                }],
                more: false
            })
        });
    }

    if (window.Lampa) {
        init();
    } else {
        document.addEventListener('lampa_start', init);
    }
})();