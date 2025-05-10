(function() {
    'use strict';

    // Ждем загрузки Lampa
    if(!window.Lampa) {
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

    // Основная функция инициализации
    function initPlugin() {
        // Добавляем пункт в меню
        const menuItem = $(`<li class="menu__item selector" data-action="${plugin.name}">
            <div class="menu__ico">${plugin.icon}</div>
            <div class="menu__text">${plugin.title}</div>
        </li>`);
        
        menuItem.on('hover:enter', showAnimeLists);
        
        setTimeout(() => {
            if($('.menu .menu__list').length) {
                $('.menu .menu__list').eq(0).prepend(menuItem);
            }
        }, 1500);
    }

    // Показываем список коллекций
    function showAnimeLists() {
        const menu = new Lampa.RegActivity('menu_list');
        
        menu.create = function() {
            this.html.html(`
                <div class="selector__body">
                    <div class="menu__head">
                        <div class="menu__title">${plugin.title}</div>
                    </div>
                    <div class="menu__body"></div>
                </div>
            `);
            
            plugin.lists.forEach(list => {
                $('.menu__body', this.html).append(`
                    <div class="selector menu__item" data-id="${list.id}">
                        <div class="menu__text">${list.name}</div>
                    </div>
                `);
            });
            
            $('.menu__item', this.html).on('hover:enter', (e) => {
                const listId = $(e.currentTarget).data('id');
                loadTmdbList(listId);
            });
        };
        
        Lampa.Activity.push(menu);
    }

    // Загружаем список из TMDB
    function loadTmdbList(listId) {
        const listName = plugin.lists.find(l => l.id == listId)?.name || 'Аниме';
        
        Lampa.Activity.push({
            component: 'full',
            url: '',
            title: listName,
            source: 'tmdb_list',
            search: '',
            method: 'list',
            params: {id: listId}
        });
    }

    // Регистрируем метод загрузки
    Lampa.Storage.add('tmdb_list', {
        load: function(params) {
            return new Promise((resolve) => {
                const url = `https://api.themoviedb.org/3/list/${params.id}?api_key=${Lampa.Storage.get('tmdb_api_key','')}`;
                
                Lampa.Api.json(url, (response) => {
                    const items = (response?.items || []).map(item => ({
                        id: item.id,
                        type: item.media_type === 'movie' ? 'movie' : 'tv',
                        name: item.title || item.name,
                        poster: Lampa.Utils.protocol() + 'image.tmdb.org/t/p/w300' + (item.poster_path || ''),
                        description: item.overview || '',
                        year: (item.release_date || item.first_air_date || '').substring(0,4) || 0
                    }));
                    
                    resolve({results: items, more: false});
                });
            });
        }
    });

    // Запускаем после загрузки приложения
    if(window.appready) initPlugin();
    else Lampa.Listener.follow('app', (e) => e.type === 'ready' && initPlugin());

})();