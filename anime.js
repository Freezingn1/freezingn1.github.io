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
                type: 'poster'
            },
            {
                title: 'Топ по рейтингу',
                url: 'discover/tv?with_genres=16&sort_by=vote_average.desc&vote_count.gte=100',
                type: 'poster'
            },
            {
                title: 'Новинки',
                url: 'discover/tv?with_genres=16&sort_by=first_air_date.desc&first_air_date.lte=' + new Date().toISOString().split('T')[0],
                type: 'poster'
            },
            {
                title: 'Скоро выйдет',
                url: 'discover/tv?with_genres=16&sort_by=first_air_date.asc&first_air_date.gte=' + new Date().toISOString().split('T')[0],
                type: 'poster'
            },
            {
                title: 'Классика аниме',
                url: 'discover/tv?with_genres=16&sort_by=vote_average.desc&first_air_date.lte=2000-12-31',
                type: 'poster'
            },
            {
                title: 'Сёнен',
                url: 'discover/tv?with_genres=16&with_keywords=210024|210027&sort_by=popularity.desc',
                type: 'poster'
            },
            {
                title: 'Сёдзе',
                url: 'discover/tv?with_genres=16&with_keywords=210023|210026&sort_by=popularity.desc',
                type: 'poster'
            }
        ]
    };

    // Инициализация плагина
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') initPlugin();
    });

    function initPlugin() {
        if (!Lampa.Manifest.origin) return;
        
        addMenuItem();
        registerAnimeComponent();
        addCustomStyles();
    }

    function addMenuItem() {
        const menuItem = $(`
            <li class="menu__item selector" data-action="anime_home">
                <div class="menu__ico">${config.icon}</div>
                <div class="menu__text">${config.name}</div>
            </li>
        `);

        menuItem.on('hover:enter', function() {
            openAnimeHome();
        });

        $('.menu .menu__list').prepend(menuItem);
    }

    function openAnimeHome() {
        Lampa.Activity.push({
            component: 'anime_home',
            url: '',
            title: config.name,
            back: true
        });
    }

    function registerAnimeComponent() {
        Lampa.Template.add('anime_home', `
            <div class="home">
                ${config.collections.map(collection => `
                    <div class="home__category">
                        <div class="home__category-head">
                            <div class="home__category-title">${collection.title}</div>
                            <div class="home__category-more selector" data-action="more" data-url="${collection.url}" data-title="${collection.title}">Ещё</div>
                        </div>
                        <div class="home__category-content" data-type="${collection.type}" data-url="${collection.url}"></div>
                    </div>
                `).join('')}
            </div>
        `);

        Lampa.Activity.add('anime_home', {
            init: function(data) {
                this.data = data;
                this.render();
                this.loadCollections();
            },
            render: function() {
                this.html = Lampa.Template.render('anime_home', this.data);
                this.activity.append(this.html);
                
                // Обработчик кнопки "Ещё"
                this.html.find('[data-action="more"]').on('hover:enter', function() {
                    const url = $(this).data('url');
                    const title = $(this).data('title');
                    
                    Lampa.Activity.push({
                        url: url,
                        title: title,
                        component: 'full',
                        source: 'tmdb',
                        card_type: 'poster_card'
                    });
                });
            },
            loadCollections: function() {
                this.html.find('[data-url]').each((i, el) => {
                    const element = $(el);
                    const url = element.data('url');
                    
                    Lampa.API.load(url, (response) => {
                        this.renderCollection(element, response.results.slice(0, 10));
                    });
                });
            },
            renderCollection: function(element, items) {
                const type = element.data('type');
                const html = items.map(item => `
                    <div class="selector__item">
                        <div class="card ${type}_card" data-action="open" data-id="${item.id}" data-type="tv">
                            <div class="card__poster">
                                <img src="${Lampa.Utils.imageUrl(item.poster_path, 'poster')}" alt="${item.name || item.title}">
                                <div class="card__title">${item.name || item.title}</div>
                                ${item.vote_average ? `<div class="card__rating">${item.vote_average.toFixed(1)}</div>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('');
                
                element.html(html);
            }
        });
    }

    function addCustomStyles() {
        const css = `
            .home__category[data-type="anime"] .card {
                border-radius: 6px;
                overflow: hidden;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            .home__category[data-type="anime"] .card:hover {
                transform: scale(1.03);
            }
            .home__category[data-type="anime"] .card__title {
                font-size: 13px;
                padding: 8px;
                background: linear-gradient(transparent, rgba(0,0,0,0.8));
            }
            .home__category[data-type="anime"] .card__rating {
                background: #ff4757;
            }
        `;
        
        $('<style>').html(css).appendTo('head');
    }

    Lampa.Platform.tv();
})();