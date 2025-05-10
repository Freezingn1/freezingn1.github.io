(function() {
    'use strict';

    // Конфигурация плагина
    const plugin = {
        name: 'tmdb_anime_lists',
        title: 'Аниме коллекции',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M18 9c0-1.1-.9-2-2-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-2c1.1 0 2-.9 2-2v-4zm-2 0v4h-2V9h2zM4 5h10v12H4V5z"/></svg>',
        api_key: 'f83446fde4dacae2924b41ff789d2bb0',
        lists: [
            {id: 146567, name: 'Топ аниме-сериалы'}
        ]
    };

    // Основной класс плагина
    function AnimePlugin() {
        this.initialized = false;
        this.network = new Lampa.Reguest();
    }

    AnimePlugin.prototype = {
        initialize: function() {
            if (this.initialized) return;
            this.initialized = true;
            
            // Регистрируем источник данных
            Lampa.Storage.add('anime_plugin', {
                load: this.loadList.bind(this)
            });
        },

        loadList: function(params) {
            return new Promise((resolve) => {
                const url = `https://api.themoviedb.org/3/list/${params.id}?api_key=${plugin.api_key}&language=ru`;
                
                this.network.native(url, (json) => {
                    if (!json || !json.items) {
                        console.error('Ошибка загрузки данных:', json);
                        resolve({results: [], more: false});
                        return;
                    }

                    const items = json.items.map(item => ({
                        id: item.id,
                        type: item.media_type === 'movie' ? 'movie' : 'tv',
                        name: item.title || item.name,
                        title: item.title || item.name,
                        original_title: item.original_title || item.original_name,
                        poster: item.poster_path 
                            ? 'https://image.tmdb.org/t/p/w300' + item.poster_path 
                            : '',
                        cover: item.backdrop_path 
                            ? 'https://image.tmdb.org/t/p/original' + item.backdrop_path 
                            : '',
                        description: item.overview || '',
                        year: (item.release_date || item.first_air_date || '').substring(0,4) || 0,
                        rating: item.vote_average ? Math.round(item.vote_average * 10)/10 : 0,
                        age: '16+',
                        genres: ['аниме'],
                        countries: ['Япония']
                    }));

                    resolve({results: items, more: false});
                });
            });
        }
    };

    // Инициализация плагина
    function startPlugin() {
        if (window.anime_plugin_initialized) return;
        window.anime_plugin_initialized = true;

        const animePlugin = new AnimePlugin();
        animePlugin.initialize();

        // Создаем пункт меню
        function createMenuItem() {
            const menuItem = $(`
                <li class="menu__item selector" data-action="${plugin.name}">
                    <div class="menu__ico">${plugin.icon}</div>
                    <div class="menu__text">${plugin.title}</div>
                </li>
            `);

            menuItem.on('hover:enter', function() {
                Lampa.Activity.push({
                    component: 'selector',
                    title: plugin.title,
                    items: plugin.lists.map(list => ({
                        title: list.name,
                        action: () => {
                            Lampa.Activity.push({
                                component: 'full',
                                title: list.name,
                                source: 'anime_plugin',
                                method: 'list',
                                params: {id: list.id}
                            });
                        }
                    }))
                });
            });

            return menuItem;
        }

        // Добавляем пункт в меню
        function addToMenu() {
            const menu = $('.menu .menu__list').first();
            if (!menu.length) {
                setTimeout(addToMenu, 500);
                return;
            }

            // Удаляем старый пункт если есть
            menu.find(`[data-action="${plugin.name}"]`).remove();
            
            // Добавляем новый пункт
            menu.prepend(createMenuItem());
        }

        // Первоначальное добавление
        addToMenu();

        // Обновляем при каждом открытии меню
        Lampa.Listener.follow('app_menu', addToMenu);
    }

    // Запускаем плагин
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();