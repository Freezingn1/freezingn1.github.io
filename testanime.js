(function() {
    'use strict';

    // Инициализация платформы
    Lampa.Platform.tv();
    
    // Конфигурация плагина
    const plugin = {
        // Основные настройки
        name: 'tmdb_anime_lists',
        title: 'TMDB Anime Collections',
        version: '1.0',
        description: 'Аниме-подборки из TMDB списков',
        
        // Списки для отображения (можно добавлять новые)
        lists: [
            {
                id: 146567,
                name: 'Лучшие аниме-сериалы',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M18 9c0-1.1-.9-2-2-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-2c1.1 0 2-.9 2-2v-4zm-2 0v4h-2V9h2zM4 5h10v12H4V5z"/></svg>'
            },
            {
                id: 82486,
                name: 'Популярные аниме-фильмы',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/></svg>'
            }
        ],
        
        // Иконка плагина
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path fill="currentColor" fill-rule="evenodd" d="m368.256 214.573l-102.627 187.35c40.554 71.844 73.647 97.07 138.664 94.503c63.67-2.514 136.974-89.127 95.694-163.243L397.205 150.94c-3.676 12.266-25.16 55.748-28.95 63.634M216.393 440.625C104.077 583.676-57.957 425.793 20.85 302.892c0 0 83.895-147.024 116.521-204.303c25.3-44.418 53.644-72.37 90.497-81.33c44.94-10.926 97.565 12.834 125.62 56.167c19.497 30.113 36.752 57.676 6.343 109.738c-3.613 6.184-136.326 248.402-143.438 257.46m8.014-264.595c-30.696-17.696-30.696-62.177 0-79.873s69.273 4.544 69.273 39.936s-38.578 57.633-69.273 39.937" clip-rule="evenodd"/></svg>'
    };

    // Проверка, что это официальное приложение Lampa
    if(Lampa.Manifest.name !== 'bylampa') {
        Lampa.Noty.show('Ошибка доступа: плагин работает только в официальной версии Lampa');
        return;
    }

    // Основная функция плагина
    function initPlugin() {
        // Создаем пункт меню
        const menuItem = $(`<li class="menu__item selector" data-action="tmdb_anime_lists">
            <div class="menu__ico">${plugin.icon}</div>
            <div class="menu__text">${plugin.title}</div>
        </li>`);
        
        // Обработчик клика по меню
        menuItem.on('hover:enter', function() {
            showAnimeLists();
        });
        
        // Добавляем пункт в меню
        setTimeout(() => {
            $('.menu .menu__list').eq(0).prepend(menuItem);
        }, 1000);
    } // ← Закрывающая скобка для initPlugin()

    // Показываем список доступных коллекций
    function showAnimeLists() {
        const items = plugin.lists.map(list => ({
            title: list.name,
            icon: list.icon,
            action: () => loadTmdbList(list.id, list.name)
        }));
        
        Lampa.Menu.show({
            title: plugin.title,
            items: items
        });
    }

    // Загружаем список из TMDB
    function loadTmdbList(listId, listName) {
        Lampa.Activity.push({
            url: '',
            title: listName,
            component: 'full',
            source: 'tmdb_list_' + listId,
            search: '',
            card_type: 'small',
            page: 1,
            method: 'list',
            params: {
                id: listId
            }
        });
    }

    // Регистрируем кастомный метод для загрузки списков
    Lampa.Storage.add('tmdb_list', {
        load: function(params) {
            return new Promise((resolve, reject) => {
                const listId = params.id;
                const url = `https://api.themoviedb.org/3/list/${listId}?api_key=${Lampa.Storage.get('tmdb_api_key', '')}&language=${Lampa.Storage.lang()}`;
                
                Lampa.Api.json(url, (response) => {
                    if(response && response.items) {
                        const items = response.items.map(item => {
                            return {
                                id: item.id,
                                type: item.media_type === 'movie' ? 'movie' : 'tv',
                                name: item.title || item.name,
                                title: item.title || item.name,
                                original_title: item.original_title || item.original_name,
                                year: parseInt((item.release_date || item.first_air_date || '').substring(0, 4)) || 0,
                                poster: Lampa.Utils.protocol() + 'image.tmdb.org/t/p/w300' + (item.poster_path || ''),
                                cover: Lampa.Utils.protocol() + 'image.tmdb.org/t/p/original' + (item.backdrop_path || ''),
                                description: item.overview || '',
                                rating: Math.round((item.vote_average || 0) * 10) / 10
                            };
                        });
                        
                        resolve({
                            results: items,
                            more: false
                        });
                    }
                    else {
                        reject('Не удалось загрузить список');
                    }
                });
            });
        }
    });

    // Запускаем плагин после загрузки приложения
    if(window.appready) {
        initPlugin();
    } 
    else {
        Lampa.Listener.follow('app', function(e) {
            if(e.type === 'ready') {
                initPlugin();
            }
        });
    }
})();