(function() {
    'use strict';

    // Конфигурация плагина
    const plugin = {
        name: 'anime_collections',
        title: 'Аниме коллекции',
        icon: '🎌',
        api_key: 'f83446fde4dacae2924b41ff789d2bb0', // Замените на реальный ключ
        list_id: 146567 // ID списка TMDB
    };

    // 1. Проверяем готовность Lampa
    function waitForLampa(callback) {
        if (window.Lampa && Lampa.Storage && Lampa.Activity) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 100);
        }
    }

    // 2. Регистрируем источник данных
    function registerSource() {
        Lampa.Storage.add('anime_source', {
            load: function(params) {
                return new Promise((resolve) => {
                    const url = `https://api.themoviedb.org/3/list/${plugin.list_id}?api_key=${plugin.api_key}`;
                    
                    console.log('Fetching:', url); // Логируем URL запроса
                    
                    Lampa.Reguest.json(url, (json) => {
                        console.log('Response:', json); // Логируем ответ
                        
                        if (!json || !json.results) {
                            console.error('Invalid response format');
                            return resolve({results: [], more: false});
                        }

                        const items = json.results.map(item => ({
                            id: item.id,
                            type: item.media_type || 'movie',
                            name: item.title || item.name || 'Без названия',
                            poster: item.poster_path 
                                ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                                : '',
                            description: item.overview || '',
                            year: (item.release_date || item.first_air_date || '').substring(0,4) || '2023',
                            rating: item.vote_average?.toFixed(1) || '0.0'
                        }));

                        resolve({results: items, more: false});
                    });
                });
            }
        });
    }

    // 3. Добавляем пункт в меню
    function addMenuButton() {
        const menu = $('.menu .menu__list').first();
        if (!menu.length) {
            setTimeout(addMenuButton, 500);
            return;
        }

        // Удаляем старый пункт если есть
        menu.find(`[data-action="${plugin.name}"]`).remove();
        
        // Создаем новый пункт
        const menuItem = $(`
            <li class="menu__item selector" data-action="${plugin.name}">
                <div class="menu__ico">${plugin.icon}</div>
                <div class="menu__text">${plugin.title}</div>
            </li>
        `);

        // Обработчик клика
        menuItem.on('hover:enter', function() {
            console.log('Opening anime collection...');
            
            Lampa.Activity.push({
                component: 'full',
                title: plugin.title,
                source: 'anime_source',
                method: 'list',
                params: {},
                card_type: 'default'
            });
        });

        menu.prepend(menuItem);
        console.log('Menu item added successfully');
    }

    // Инициализация плагина
    waitForLampa(() => {
        registerSource();
        addMenuButton();
        
        // Обновляем меню при каждом открытии
        Lampa.Listener.follow('app_menu', addMenuButton);
    });

})();