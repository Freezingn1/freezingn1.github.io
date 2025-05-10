(function() {
    'use strict';

    // Ждем загрузки Lampa
    if (!window.Lampa) {
        console.error('Lampa не найдена');
        return;
    }

    // Конфигурация плагина
    const plugin = {
        name: 'tmdb_anime_lists',
        title: 'TMDB Anime Collections',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M18 9c0-1.1-.9-2-2-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-2c1.1 0 2-.9 2-2v-4zm-2 0v4h-2V9h2zM4 5h10v12H4V5z"/></svg>',
        
        lists: [
            {id: 146567, name: 'Лучшие аниме-сериалы'}
        ]
    };

    // Добавляем пункт в главное меню
    function addToMenu() {
        const menuItem = $(`
            <li class="menu__item selector" data-action="${plugin.name}">
                <div class="menu__ico">${plugin.icon}</div>
                <div class="menu__text">${plugin.title}</div>
            </li>
        `);
        
        menuItem.on('hover:enter', showAnimeLists);
        
        // Пытаемся добавить в меню несколько раз с интервалом
        const tryAdd = () => {
            if ($('.menu .menu__list').length) {
                $('.menu .menu__list').eq(0).prepend(menuItem);
            } else {
                setTimeout(tryAdd, 500);
            }
        };
        
        tryAdd();
    }

    // Показываем список коллекций через стандартный Activity
    function showAnimeLists() {
        const activity = {
            component: 'list',
            url: '',
            title: plugin.title,
            items: plugin.lists.map(list => ({
                title: list.name,
                action: () => loadTmdbList(list.id, list.name)
            }))
        };
        
        Lampa.Activity.push(activity);
    }

    // Загружаем список из TMDB
    function loadTmdbList(listId, listName) {
        const activity = {
            component: 'full',
            url: '',
            title: listName,
            source: 'tmdb_list',
            search: '',
            method: 'list',
            params: {id: listId}
        };
        
        Lampa.Activity.push(activity);
    }

    // Регистрируем метод загрузки данных
    Lampa.Storage.add('tmdb_list', {
        load: function(params) {
            return new Promise((resolve) => {
                const url = `https://api.themoviedb.org/3/list/${params.id}?api_key=f83446fde4dacae2924b41ff789d2bb0`;
                
                Lampa.Api.json(url, (response) => {
                    const items = (response?.items || []).map(item => ({
                        id: item.id,
                        type: item.media_type === 'movie' ? 'movie' : 'tv',
                        name: item.title || item.name,
                        poster: Lampa.Utils.protocol() + 'image.tmdb.org/t/p/w300' + (item.poster_path || ''),
                        description: item.overview || '',
                        year: (item.release_date || item.first_air_date || '').substring(0,4) || 0,
                        rating: item.vote_average ? Math.round(item.vote_average * 10)/10 : 0
                    }));
                    
                    resolve({results: items, more: false});
                });
            });
        }
    });

    // Запускаем после полной загрузки приложения
    if (window.appready) {
        addToMenu();
    } else {
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') addToMenu();
        });
    }

})();