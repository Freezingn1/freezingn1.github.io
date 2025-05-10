(function() {
    'use strict';

    // Конфигурация
    const plugin = {
        name: 'anime_plugin',
        title: 'Аниме коллекции',
        icon: '🎌',
        api_key: 'f83446fde4dacae2924b41ff789d2bb0', // Проверьте ключ
        list_id: 146567 // Проверьте ID списка
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
                    const url = `https://api.themoviedb.org/3/list/${plugin.list_id}?api_key=${plugin.api_key}`;
                    console.log('Запрос к API:', url);

                    fetch(url)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Ошибка HTTP: ' + response.status);
                            }
                            return response.json();
                        })
                        .then(data => {
                            console.log('Полный ответ API через fetch:', data);
                            if (!data || !data.items) {
                                console.error('Ошибка: нет данных в ответе');
                                return resolve({results: [], more: false});
                            }

                            const items = data.items.map(item => {
                                return {
                                    id: item.id,
                                    type: item.media_type === 'movie' ? 'movie' : 'tv',
                                    name: item.name || item.title || 'Без названия',
                                    title: item.name || item.title || 'Без названия',
                                    original_title: item.original_name || item.original_title || '',
                                    poster: item.poster_path 
                                        ? 'https://image.tmdb.org/t/p/w300' + item.poster_path 
                                        : 'https://via.placeholder.com/300x450?text=No+Poster',
                                    cover: item.backdrop_path 
                                        ? 'https://image.tmdb.org/t/p/original' + item.backdrop_path 
                                        : '',
                                    description: item.overview || 'Описание отсутствует',
                                    year: parseInt((item.first_air_date || item.release_date || '0').substring(0, 4), 10) || 0,
                                    rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 0,
                                    age: '16+',
                                    genres: item.genre_ids ? item.genre_ids.map(id => 'аниме') : ['аниме'],
                                    countries: ['JP']
                                };
                            });

                            console.log('Обработанные элементы:', items);
                            resolve({results: items, more: false});
                        })
                        .catch(error => {
                            console.error('Ошибка fetch:', error);
                            resolve({results: [], more: false});
                        });
                });
            }
        });
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
                component: 'category_full',
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

    // Тестовые данные для проверки
    function testPlugin() {
        console.log('--- ТЕСТИРОВАНИЕ ---');
        console.log('Lampa:', !!window.Lampa);
        console.log('Lampa.Storage:', !!Lampa.Storage);
        console.log('Lampa.Activity:', !!Lampa.Activity);
    }

    setTimeout(testPlugin, 3000);
})();