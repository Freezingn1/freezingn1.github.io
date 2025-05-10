(function() {
    'use strict';

    // Конфигурация
    const plugin = {
        name: 'anime_plugin',
        title: 'Аниме коллекции',
        icon: '🎌',
        api_key: 'f83446fde4dacae2924b41ff789d2bb0', // Замените на реальный ключ
        list_id: 146567 // ID списка TMDB
    };

    // 1. Ждем готовности Lampa
    function waitForLampa(callback) {
        if (window.Lampa && Lampa.Storage && Lampa.Activity) {
            console.log('Lampa API готов');
            callback();
        } else {
            console.log('Ожидаем Lampa API...');
            setTimeout(() => waitForLampa(callback), 300);
        }
    }

    // 2. Регистрируем источник данных
    function registerSource() {
        console.log('Регистрируем источник данных...');
        
        Lampa.Storage.add('anime_source', {
            load: function(params) {
                console.log('Загрузка данных...');
                
                return new Promise((resolve) => {
                    const url = `https://api.themoviedb.org/3/list/${plugin.list_id}?api_key=${plugin.api_key}`;
                    console.log('Отправляем запрос:', url);

                    Lampa.Reguest.json(url, (response) => {
                        console.log('Получен ответ:', response);
                        
                        if (!response || !response.results) {
                            console.error('Некорректный формат ответа');
                            return resolve({results: [], more: false});
                        }

                        const items = response.results.map(item => {
                            // Обязательные поля для Lampa
                            return {
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
                                rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 0,
                                age: '16+',
                                genres: ['аниме'],
                                countries: ['JP']
                            };
                        });

                        console.log('Сформировано элементов:', items.length);
                        resolve({results: items, more: false});
                    }, (error) => {
                        console.error('Ошибка запроса:', error);
                        resolve({results: [], more: false});
                    });
                });
            }
        });
    }

    // 3. Добавляем пункт меню с полной отладкой
    function addMenuButton() {
        console.log('Попытка добавить пункт меню...');
        
        const menu = $('.menu .menu__list').first();
        if (!menu.length) {
            console.log('Меню не найдено, повторная попытка...');
            setTimeout(addMenuButton, 500);
            return;
        }

        // Удаляем старый пункт если есть
        const oldItem = menu.find(`[data-action="${plugin.name}"]`);
        if (oldItem.length) {
            console.log('Удаляем старый пункт меню');
            oldItem.remove();
        }

        // Создаем новый пункт
        console.log('Создаем новый пункт меню');
        const menuItem = $(`
            <li class="menu__item selector" data-action="${plugin.name}">
                <div class="menu__ico">${plugin.icon}</div>
                <div class="menu__text">${plugin.title}</div>
            </li>
        `);

        // Обработчик клика с полной отладкой
        menuItem.on('hover:enter', function() {
            console.log('Клик по пункту меню обнаружен');
            
            Lampa.Activity.push({
                component: 'full',
                title: plugin.title,
                source: 'anime_source',
                method: 'list',
                params: {},
                card_type: 'default',
                onReady: function() {
                    console.log('Активность успешно создана');
                },
                onError: function(error) {
                    console.error('Ошибка активности:', error);
                }
            });
        });

        menu.prepend(menuItem);
        console.log('Пункт меню успешно добавлен');
    }

    // Инициализация
    waitForLampa(() => {
        console.log('--- ИНИЦИАЛИЗАЦИЯ ПЛАГИНА ---');
        registerSource();
        addMenuButton();
        
        // Обновляем при каждом открытии меню
        Lampa.Listener.follow('app_menu', function() {
            console.log('Обновляем меню...');
            addMenuButton();
        });
    });

    // Тестовые данные для проверки
    function testPlugin() {
        console.log('--- ТЕСТИРОВАНИЕ ---');
        console.log('Lampa:', !!window.Lampa);
        console.log('Lampa.Storage:', !!Lampa.Storage);
        console.log('Lampa.Activity:', !!Lampa.Activity);
        console.log('Lampa.Reguest:', !!Lampa.Reguest);
    }

    setTimeout(testPlugin, 3000);
})();