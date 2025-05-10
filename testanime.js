(function() {
    'use strict';

    const plugin = {
        name: 'tmdb_anime_lists',
        title: 'Аниме коллекции',
        icon: '🎌',
        api_key: 'f83446fde4dacae2924b41ff789d2bb0',
        lists: [
            {id: 146567, name: 'Топ аниме-сериалы'}
        ]
    };

    function AnimePlugin() {
        this.initialized = false;
        this.network = new Lampa.Reguest();
    }

    AnimePlugin.prototype = {
        initialize: function() {
            if (this.initialized) return;
            this.initialized = true;
            
            Lampa.Storage.add('anime_plugin', {
                load: this.loadList.bind(this)
            });
        },

        loadList: function(params) {
            return new Promise((resolve) => {
                const url = `https://api.themoviedb.org/3/list/${params.id}?api_key=${plugin.api_key}`;
                
                console.log('[DEBUG] Запрос к TMDB:', url);
                
                this.network.silent(url, (json) => {
                    console.log('[DEBUG] Ответ TMDB:', json);
                    
                    // Проверка структуры ответа
                    if (!json || !json.results) {
                        console.error('Некорректный формат ответа');
                        return resolve({results: [], more: false});
                    }

                    // Преобразование данных
                    const items = json.results.map(item => {
                        const baseImgUrl = 'https://image.tmdb.org/t/p/';
                        
                        return {
                            id: item.id,
                            type: item.media_type || 'movie',
                            name: item.title || item.name || 'Без названия',
                            title: item.title || item.name || 'Без названия',
                            poster: item.poster_path 
                                ? baseImgUrl + 'w300' + item.poster_path 
                                : 'https://dummyimage.com/300x450/000/fff&text=No+image',
                            cover: item.backdrop_path 
                                ? baseImgUrl + 'original' + item.backdrop_path 
                                : 'https://dummyimage.com/1920x1080/000/fff&text=No+image',
                            description: item.overview || 'Описание отсутствует',
                            year: new Date(item.release_date || item.first_air_date || '').getFullYear() || 2023,
                            rating: item.vote_average?.toFixed(1) || '0.0',
                            age: '16+',
                            genres: item.genre_ids?.map(id => Lampa.TMDB.genres(id)) || ['Аниме'],
                            countries: item.origin_country || ['JP']
                        };
                    });

                    console.log('[DEBUG] Преобразовано элементов:', items.length);
                    resolve({results: items, more: false});
                }, (error) => {
                    console.error('[ERROR] Ошибка запроса:', error);
                    resolve({results: [], more: false});
                });
            });
        }
    };

    function startPlugin() {
        if (window.anime_plugin_initialized) return;
        window.anime_plugin_initialized = true;

        const animePlugin = new AnimePlugin();
        animePlugin.initialize();

        // Добавление пункта меню
        function updateMenu() {
            const menu = $('.menu .menu__list').first();
            if (!menu.length) return setTimeout(updateMenu, 500);

            menu.find(`[data-action="${plugin.name}"]`).remove();
            
            menu.prepend(`
                <li class="menu__item selector" data-action="${plugin.name}">
                    <div class="menu__ico">${plugin.icon}</div>
                    <div class="menu__text">${plugin.title}</div>
                </li>
            `).on('hover:enter', () => {
                Lampa.Activity.push({
                    component: 'full',
                    title: plugin.title,
                    source: 'anime_plugin',
                    method: 'list',
                    params: {id: plugin.lists[0].id},
                    card_type: 'vertical'
                });
            });
        }

        Lampa.Listener.follow('app_menu', updateMenu);
        updateMenu();
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', e => e.type === 'ready' && startPlugin());
})();