(function() {
    'use strict';

    // Конфигурация
    const plugin = {
        name: 'anime_plugin',
        title: 'Аниме коллекции',
        icon: '🎌',
        api_key: 'f83446fde4dacae2924b41ff789d2bb0', // Ваш API-ключ
        list_id: 146567 // Ваш ID списка
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
                console.log('Параметры запроса:', params);
                return new Promise((resolve) => {
                    // Используем прокси для обхода CORS
                    const proxyUrl = `https://cors.lampa.app/https://api.themoviedb.org/3/list/${plugin.list_id}?api_key=${plugin.api_key}`;
                    console.log('Запрос к API через прокси:', proxyUrl);

                    // Тест с fetch
                    fetch(proxyUrl)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Ошибка HTTP: ' + response.status);
                            }
                            return response.json();
                        })
                        .then(data => {
                            console.log('Полный ответ API:', data);
                            if (!data || !data.items || data.items.length === 0) {
                                console.error('Ошибка: нет данных в ответе или список пуст');
                                // Если API не работает, используем тестовые данные
                                return resolve(getTestData());
                            }

                            const items = data.items.map(item => ({
                                id: item.id,
                                type: item.media_type === 'movie' ? 'movie' : 'tv',
                                title: item.name || item.title || 'Без названия',
                                name: item.name || item.title || 'Без названия',
                                original_title: item.original_name || item.original_title || '',
                                poster: item.poster_path 
                                    ? `https://cors.lampa.app/https://image.tmdb.org/t/p/w300${item.poster_path}` 
                                    : 'https://via.placeholder.com/300x450?text=No+Poster',
                                cover: item.backdrop_path 
                                    ? `https://cors.lampa.app/https://image.tmdb.org/t/p/original${item.backdrop_path}` 
                                    : '',
                                description: item.overview || 'Описание отсутствует',
                                year: parseInt((item.first_air_date || item.release_date || '0').substring(0, 4), 10) || 0,
                                rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 0,
                                age: '16+',
                                genres: item.genre_ids ? item.genre_ids.map(id => 'аниме') : ['аниме'],
                                countries: ['JP']
                            }));

                            console.log('Обработанные элементы:', items);
                            resolve({results: items, more: false});
                        })
                        .catch(error => {
                            console.error('Ошибка fetch:', error);
                            console.log('Используем тестовые данные из-за ошибки');
                            resolve(getTestData());
                        });
                });
            }
        });

        // Функция с тестовыми данными
        function getTestData() {
            const testData = [
                {
                    id: 232230,
                    type: 'tv',
                    title: 'Lord of the Mysteries',
                    name: 'Lord of the Mysteries',
                    original_title: 'Lord of the Mysteries',
                    poster: 'https://cors.lampa.app/https://image.tmdb.org/t/p/w300/b1MJm65GAwggFTvFOCcITU140Ol.jpg',
                    cover: '',
                    description: 'With the rising tide of steam power and machinery...',
                    year: 2025,
                    rating: 0.0,
                    age: '16+',
                    genres: ['аниме'],
                    countries: ['JP']
                },
                {
                    id: 231003,
                    type: 'tv',
                    title: 'Lazarus',
                    name: 'Lazarus',
                    original_title: 'Lazarus',
                    poster: 'https://cors.lampa.app/https://image.tmdb.org/t/p/w300/j5TVg6cF4jMnB9YbYjQciU14.jpg',
                    cover: '',
                    description: 'In 2052, a Nobel Prize-winning neuroscientist develops a drug...',
                    year: 2025,
                    rating: 9.2,
                    age: '16+',
                    genres: ['аниме'],
                    countries: ['JP']
                }
            ];
            console.log('Тестовые данные:', testData);
            return {results: testData, more: false};
        }
    }

    // 3. Добавляем пункт меню
    function addMenuButton() {
        console.log('Попытка добавить пункт меню...');
        
        const menu = $('.menu .menu__list').first();
        if (!menu.length) {
            console.log('Меню не найдено, повторная попытка...');
            setTimeout(addMenuButton, 500);
            return;
        }

        const oldItem = menu.find(`[data-action="${plugin.name}"]`);
        if (oldItem.length) {
            console.log('Удаляем старый пункт меню');
            oldItem.remove();
        }

        console.log('Создаем новый пункт меню');
        const menuItem = $(`
            <li class="menu__item selector" data-action="${plugin.name}">
                <div class="menu__ico">${plugin.icon}</div>
                <div class="menu__text">${plugin.title}</div>
            </li>
        `);

        menuItem.on('hover:enter', function() {
            console.log('Запуск активности для:', plugin.title);
            Lampa.Activity.push({
                component: 'category_full', // Подходит для списков
                title: plugin.title,
                source: 'anime_source',
                method: 'list',
                params: {},
                onReady: function() {
                    console.log('Активность загружена');
                },
                onError: function(error) {
                    console.error('Ошибка загрузки активности:', error);
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
        
        Lampa.Listener.follow('app_menu', function() {
            console.log('Обновляем меню...');
            addMenuButton();
        });

        Lampa.Listener.follow('component', (e) => {
            console.log('Компонент загружен:', e);
            if (e.component === 'category_full' && e.source === 'anime_source') {
                console.log('Компонент для anime_source активирован');
            }
        });
    });

    // Тестовая проверка
    function testPlugin() {
        console.log('--- ТЕСТИРОВАНИЕ ---');
        console.log('Lampa:', !!window.Lampa);
        console.log('Lampa.Storage:', !!Lampa.Storage);
        console.log('Lampa.Activity:', !!Lampa.Activity);
    }

    setTimeout(testPlugin, 3000);
})();