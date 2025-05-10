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
        const addMenuButton = () => {
            if ($('.menu .menu__list').length) {
                const menuItem = $(`
                    <li class="menu__item selector" data-action="${plugin.name}">
                        <div class="menu__ico">${plugin.icon}</div>
                        <div class="menu__text">${plugin.title}</div>
                    </li>
                `);
                
                menuItem.on('hover:enter', showAnimeLists);
                $('.menu .menu__list').eq(0).prepend(menuItem);
            } else {
                setTimeout(addMenuButton, 500);
            }
        };

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
                return new Promise((resolve) => {
                    const url = `https://api.themoviedb.org/3/list/${params.id}?api_key=${plugin.api_key}&language=ru-RU`;
                    
                    Lampa.Api.json(url, (response) => {
                        if (!response || !response.items) {
                            console.error('Некорректный ответ от TMDB', response);
                            return resolve({results: [], more: false});
                        }

                        const items = response.items.map(item => ({
                            id: item.id,
                            type: item.media_type === 'movie' ? 'movie' : 'tv',
                            name: item.title || item.name,
                            title: item.title || item.name,
                            poster: item.poster_path 
                                ? Lampa.Utils.protocol() + 'image.tmdb.org/t/p/w300' + item.poster_path 
                                : '',
                            cover: item.backdrop_path 
                                ? Lampa.Utils.protocol() + 'image.tmdb.org/t/p/original' + item.backdrop_path 
                                : '',
                            description: item.overview || '',
                            year: parseInt((item.release_date || item.first_air_date || '').substring(0, 4)) || 0,
                            rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 0
                        }));

                        resolve({results: items, more: false});
                    });
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