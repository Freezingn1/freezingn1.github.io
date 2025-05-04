(function() {
    'use strict';

    // Конфигурация плагина
    const config = {
        name: 'Аниме',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>`,
        apiUrl: 'discover/tv?with_genres=16&sort_by=popularity.desc',
        filters: {
            years: '2020-2024',
            rating: '7+',
            sort: 'popular'
        },
        cardStyle: {
            type: 'poster',
            ratio: 0.7,
            title: true,
            rating: true
        }
    };

    // Инициализация после загрузки приложения
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') initPlugin();
    });

    function initPlugin() {
        if (!Lampa.Manifest.origin) return;
        
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
            Lampa.Activity.push({
                url: config.apiUrl,
                title: config.name,
                component: 'anime_collection',
                source: 'tmdb',
                card_type: 'poster_card',
                params: {
                    view: 'poster',
                    sort: 'popularity.desc',
                    filters: JSON.stringify(config.filters)
                }
            });
        });

        $('.menu .menu__list').prepend(menuItem);
    }

    function addCustomStyles() {
        const css = `
            .anime-collection {
                background: rgba(20, 20, 30, 0.95);
            }
            .anime-card {
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                transition: transform 0.2s;
            }
            .anime-card:hover {
                transform: scale(1.05);
            }
            .anime-card .card__title {
                font-size: 14px;
                color: #fff;
                text-shadow: 1px 1px 2px #000;
            }
            .anime-card .card__rating {
                background: rgba(255, 71, 87, 0.9);
            }
        `;
        
        $('<style>').html(css).appendTo('head');
    }

    // Регистрируем кастомный компонент для аниме
    Lampa.Template.add('anime_collection', `
        <div class="selector__layer">
            <div class="selector__header">
                <div class="selector__title">{{title}}</div>
                <div class="selector__filters">
                    <div class="selector__filter selector" data-action="filter" data-type="sort">Сортировка: {{params.sort}}</div>
                    <div class="selector__filter selector" data-action="filter" data-type="years">Годы: {{params.filters.years}}</div>
                    <div class="selector__filter selector" data-action="filter" data-type="rating">Рейтинг: {{params.filters.rating}}</div>
                </div>
            </div>
            <div class="selector__items anime-collection" data-type="items"></div>
        </div>
    `);

    // Устанавливаем обработчик для аниме-раздела
    Lampa.Activity.add('anime_collection', {
        init: function(data) {
            this.data = data;
            this.render();
            this.loadData();
        },
        render: function() {
            this.html = Lampa.Template.render('anime_collection', this.data);
            this.activity.append(this.html);
        },
        loadData: function() {
            Lampa.API.load(this.data.url, (response) => {
                this.renderItems(response.results);
            });
        },
        renderItems: function(items) {
            const html = items.map(item => `
                <div class="selector__item anime-card" data-id="${item.id}">
                    <div class="card ${this.data.card_type}" data-action="open" data-type="anime" data-id="${item.id}">
                        <div class="card__poster">
                            <img src="${Lampa.Utils.imageUrl(item.poster_path, 'poster')}" alt="${item.name}">
                            <div class="card__title">${item.name}</div>
                            ${item.vote_average ? `<div class="card__rating">${item.vote_average.toFixed(1)}</div>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
            
            this.html.find('[data-type="items"]').html(html);
        }
    });

    Lampa.Platform.tv();
})();