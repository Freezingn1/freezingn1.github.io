(function() {
    'use strict';

    // Конфигурация плагина
    const plugin = {
        name: 'tmdb_anime_lists',
        title: 'TMDB Anime Collections',
        icon: '⭐',
        api_key: 'f83446fde4dacae2924b41ff789d2bb0', // Вставьте сюда ваш ключ TMDB
        
        lists: [
            {id: 146567, name: 'Лучшие аниме-сериалы'},
            {id: 82486, name: 'Популярные аниме-фильмы'}
        ]
    };

    // Проверяем доступность Lampa
    function checkLampa() {
        if (!window.Lampa) {
            console.error('Lampa не найдена!');
            return false;
        }
        if (!Lampa.Activity || !Lampa.Storage || !Lampa.Api) {
            console.error('Не хватает необходимых компонентов Lampa');
            return false;
        }
        return true;
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
    function showAnimeLists() {
        console.log('Показываем список коллекций');
        
        Lampa.Activity.push({
            component: 'list',
            url: '',
            title: plugin.title,
            items: plugin.lists.map(list => ({
                title: list.name,
                icon: list.icon,
                action: () => loadTmdbList(list.id, list.name)
            })),
            onReady: function() {
                console.log('Список коллекций загружен');
            }
        });
    }

    // Загружаем список из TMDB
    function loadTmdbList(listId, listName) {
        console.log(`Загрузка списка ${listId}...`);
        
        Lampa.Activity.push({
            component: 'full',
            url: '',
            title: listName,
            source: 'tmdb_list',
            search: '',
            method: 'list',
            params: {id: listId},
            onReady: function() {
                console.log('Список аниме загружен');
            }
        });
    }

    // Регистрируем метод загрузки данных
    Lampa.Storage.add('tmdb_list', {
        load: function(params) {
            return new Promise((resolve, reject) => {
                console.log(`Запрашиваем данные списка ${params.id}...`);
                
                const url = `https://api.themoviedb.org/3/list/${params.id}?api_key=${plugin.api_key}`;
                
                console.log('URL запроса:', url);
                
                Lampa.Api.json(url, (response) => {
                    console.log('Ответ от TMDB:', response);
                    
                    if (!response || !response.items) {
                        console.error('Некорректный ответ от TMDB');
                        reject('Ошибка загрузки данных');
                        return;
                    }
                    
                    const items = response.items.map(item => {
                        const poster = item.poster_path 
                            ? Lampa.Utils.protocol() + 'image.tmdb.org/t/p/w300' + item.poster_path 
                            : '';
                        
                        return {
                            id: item.id,
                            type: item.media_type === 'movie' ? 'movie' : 'tv',
                            name: item.title || item.name,
                            poster: poster,
                            description: item.overview || '',
                            year: (item.release_date || item.first_air_date || '').substring(0,4) || 0,
                            rating: item.vote_average || 0
                        };
                    });
                    
                    console.log(`Загружено ${items.length} элементов`);
                    resolve({results: items, more: false});
                }, (error) => {
                    console.error('Ошибка запроса:', error);
                    reject('Ошибка сети');
                });
            });
        }
    });

    // Инициализация плагина
    function init() {
        if (!checkLampa()) return;
        
        console.log('Инициализация плагина...');
        
        if (window.appready) {
            addToMenu();
        } else {
            Lampa.Listener.follow('app', (e) => {
                if (e.type === 'ready') addToMenu();
            });
        }
    }

    // Запускаем плагин
    init();

})();