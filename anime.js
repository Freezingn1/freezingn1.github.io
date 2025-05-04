(function() {
    'use strict';

    // Конфигурация плагина
    const config = {
        name: 'Аниме',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>`,
        collections: [
            {
                title: 'Популярное аниме',
                url: 'discover/tv?with_genres=16&sort_by=popularity.desc',
                component: 'full'
            },
            {
                title: 'Топ по рейтингу',
                url: 'discover/tv?with_genres=16&sort_by=vote_average.desc&vote_count.gte=100',
                component: 'full'
            },
            {
                title: 'Новинки',
                url: 'discover/tv?with_genres=16&sort_by=first_air_date.desc',
                component: 'full'
            }
        ]
    };

    // Инициализация плагина
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') initPlugin();
    });

    function initPlugin() {
        if (!Lampa.Storage.get('lampa_origin')) {
            Lampa.Noty.show('Доступ запрещен', 3000);
            return;
        }
        
        addMenuItem();
        addCustomStyles();
    }

    function addMenuItem() {
        const menuItem = $(`
            <li class="menu__item selector" data-action="anime">
                <div class="menu__ico">${config.icon}</div>
                <div class="menu__text">${config.name}</div>
            </li>
        `);

        menuItem.on('hover:enter', function() {
            openAnimePage();
        });

        $('.menu .menu__list').prepend(menuItem);
    }

    function openAnimePage() {
        // Создаем структуру страницы
        const page = $(`
            <div class="selector">
                <div class="selector__body">
                    <div class="selector__header">
                        <div class="selector__title">${config.name}</div>
                    </div>
                    <div class="selector__items"></div>
                </div>
            </div>
        `);
        
        // Добавляем подборки
        config.collections.forEach(collection => {
            page.find('.selector__items').append(`
                <div class="selector__group">
                    <div class="selector__group-head">
                        <div class="selector__group-title">${collection.title}</div>
                        <div class="selector__group-more selector" data-action="more" data-url="${collection.url}">Ещё</div>
                    </div>
                    <div class="selector__group-content" data-url="${collection.url}"></div>
                </div>
            `);
        });
        
        // Открываем страницу
        Lampa.Activity.push({
            component: 'simple',
            template: page,
            title: config.name,
            back: true,
            onRender: function() {
                // Загружаем данные для каждой подборки
                page.find('[data-url]').each(function() {
                    const element = $(this);
                    const url = element.data('url');
                    
                    Lampa.API.tv(url, function(response) {
                        renderCollection(element, response.results.slice(0, 8));
                    });
                });
                
                // Обработка кнопки "Ещё"
                page.find('[data-action="more"]').on('hover:enter', function() {
                    const url = $(this).data('url');
                    const title = $(this).closest('.selector__group').find('.selector__group-title').text();
                    
                    Lampa.Activity.push({
                        url: url,
                        title: title,
                        component: 'full',
                        source: 'tmdb',
                        card_type: 'poster_card'
                    });
                });
            }
        });
    }

    function renderCollection(element, items) {
        const html = items.map(item => `
            <div class="selector__item">
                <div class="card poster_card" data-action="open" data-id="${item.id}" data-type="tv">
                    <div class="card__poster">
                        <img src="${Lampa.Utils.imageUrl(item.poster_path, 'poster')}" alt="${item.name}">
                        <div class="card__title">${item.name}</div>
                        ${item.vote_average ? `<div class="card__rating">${item.vote_average.toFixed(1)}</div>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        element.html(html);
    }

    function addCustomStyles() {
        const css = `
            .selector__group {
                margin-bottom: 30px;
            }
            .selector__group-head {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding: 0 15px;
            }
            .selector__group-title {
                font-size: 18px;
                font-weight: bold;
                color: #fff;
            }
            .selector__group-more {
                color: rgba(255,255,255,0.7);
                font-size: 14px;
                padding: 5px 10px;
            }
            .selector__group-content {
                display: flex;
                overflow-x: auto;
                padding: 0 15px;
                gap: 15px;
            }
            .selector__group-content::-webkit-scrollbar {
                display: none;
            }
            .card__rating {
                background: #ff4757;
            }
        `;
        
        $('<style>').html(css).appendTo('head');
    }

    Lampa.Platform.tv();
})();