(function() {
    'use strict';

    // Конфигурация плагина
    const plugin = {
        name: 'tmdb_anime_lists',
        title: 'TMDB Anime Collections',
        icon: '⭐',
        api_key: 'f83446fde4dacae2924b41ff789d2bb0', // Обязательно замените на свой ключ TMDB
        
        lists: [
            {id: 146567, name: 'Лучшие аниме-сериалы'},
            {id: 82486, name: 'Популярные аниме-фильмы'}
        ]
    };

    // Основная функция инициализации
    function initPlugin() {
        if (!window.Lampa || !Lampa.Activity || !Lampa.Storage) {
            console.error('Lampa API не доступен');
            return;
        }

        // Добавляем пункт в меню
        function addToMenu() {
        if (!$('.menu .menu__list').length) {
            console.log('Меню не найдено, пробуем снова...');
            setTimeout(addToMenu, 1000);
            return;
        }

        const menuItem = $(`
            <li class="menu__item selector" data-action="${plugin.name}">
                <div class="menu__ico">${plugin.icon}</div>
                <div class="menu__text">${plugin.title}</div>
            </li>
        `);
        
        menuItem.on('hover:enter', showAnimeLists);
        $('.menu .menu__list').eq(0).prepend(menuItem);
        console.log('Пункт меню добавлен');
    }

        // Показываем список коллекций
        const showAnimeLists = () => {
            Lampa.Activity.push({
                component: 'selector',
                title: plugin.title,
                items: plugin.lists.map(list => ({
                    title: list.name,
                    action: () => loadTmdbList(list.id, list.name)
                }))
            });
        };

        // Загружаем список из TMDB
        const loadTmdbList = (listId, listName) => {
            Lampa.Activity.push({
                component: 'full',
                title: listName,
                source: 'tmdb_list',
                method: 'list',
                params: {id: listId}
            });
        };

        // Регистрируем метод загрузки данных
        Lampa.Storage.add('tmdb_list', {
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

        // Запускаем добавление в меню
        addMenuButton();
    }

    // Запускаем плагин после загрузки Lampa
    if (window.appready) {
        initPlugin();
    } else {
        document.addEventListener('lampa_start', initPlugin);
    }

})();