(function() {
    'use strict';

    // Конфигурация плагина
    const plugin = {
        name: 'tmdb_anime_lists',
        title: 'Аниме коллекции',
        icon: '🎌',
        api_key: 'f83446fde4dacae2924b41ff789d2bb0', // Замените на свой ключ
        lists: [
            {id: 146567, name: 'Топ аниме-сериалы'} // Тестовый список
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
                
                console.log('Запрашиваем URL:', url); // Логируем URL
                
                this.network.silent(url, (json) => {
                    console.log('Ответ от TMDB:', json); // Логируем ответ
                    
                    if (!json || !json.results) { // Исправлено на results вместо items
                        console.error('Ошибка структуры ответа');
                        return resolve({results: [], more: false});
                    }

                    const items = json.results.map(item => {
                        // Генерируем абсолютные URL для изображений
                        const poster = item.poster_path 
                            ? Lampa.Utils.protocol() + 'image.tmdb.org/t/p/w300' + item.poster_path 
                            : '';
                        
                        const cover = item.backdrop_path 
                            ? Lampa.Utils.protocol() + 'image.tmdb.org/t/p/original' + item.backdrop_path 
                            : '';

                        // Основные обязательные поля
                        return {
                            id: item.id,
                            type: item.media_type === 'movie' ? 'movie' : 'tv',
                            name: item.title || item.name,
                            title: item.title || item.name,
                            original_title: item.original_title || item.original_name || '',
                            poster: poster,
                            cover: cover,
                            description: item.overview || '',
                            year: (item.release_date || item.first_air_date || '').substring(0,4) || 0,
                            rating: item.vote_average ? Math.round(item.vote_average * 10)/10 : 0,
                            age: '16+',
                            genres: ['аниме'],
                            countries: ['JP']
                        };
                    });

                    console.log('Преобразовано элементов:', items.length);
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

        // Создаем и добавляем пункт меню
        function createAndAddMenu() {
            const menu = $('.menu .menu__list').first();
            if (!menu.length) {
                setTimeout(createAndAddMenu, 500);
                return;
            }

            // Удаляем старый пункт если есть
            menu.find(`[data-action="${plugin.name}"]`).remove();
            
            // Создаем новый пункт меню
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
                                params: {id: list.id},
                                card_type: 'default' // Важный параметр
                            });
                        }
                    }))
                });
            });

            menu.prepend(menuItem);
            console.log('Пункт меню добавлен');
        }

        // Первоначальное добавление
        createAndAddMenu();

        // Обновляем при каждом открытии меню
        Lampa.Listener.follow('app_menu', createAndAddMenu);
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