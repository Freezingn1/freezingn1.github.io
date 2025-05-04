(function() {
    'use strict';

    // Конфигурация плагина
    const config = {
        cardStyle: {
            width: 185,
            height: 278,
            radius: 8,
            titleSize: 14,
            transition: 'all 0.3s ease'
        },
        gridStyle: {
            padding: 20,
            columns: 6,
            gap: 15
        },
        animation: {
            fadeIn: 'fadeIn 0.5s ease forwards',
            slideUp: 'slideUp 0.4s ease forwards'
        }
    };

    // Ждем готовности приложения
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            initAnimePlugin();
            addCustomStyles();
        }
    });

    function initAnimePlugin() {
        if (Lampa.Manifest.origin !== 'bylampa') {
            Lampa.Noty.show('Ошибка доступа');
            return;
        }

        const menuItem = createMenuItem();
        $('.menu .menu__list').eq(0).prepend(menuItem);
    }

    function createMenuItem() {
        const animeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
            <path fill="currentColor" fill-rule="evenodd" d="m368.256 214.573l-102.627 187.35c40.554 71.844 73.647 97.07 138.664 94.503c63.67-2.514 136.974-89.127 95.694-163.243L397.205 150.94c-3.676 12.266-25.16 55.748-28.95 63.634M216.393 440.625C104.077 583.676-57.957 425.793 20.85 302.892c0 0 83.895-147.024 116.521-204.303c25.3-44.418 53.644-72.37 90.497-81.33c44.94-10.926 97.565 12.834 125.62 56.167c19.497 30.113 36.752 57.676 6.343 109.738c-3.613 6.184-136.326 248.402-143.438 257.46m8.014-264.595c-30.696-17.696-30.696-62.177 0-79.873s69.273 4.544 69.273 39.936s-38.578 57.633-69.273 39.937" clip-rule="evenodd"/>
        </svg>`;

        const menuItem = $(`
            <li class="menu__item selector" data-action="anime_tmdb">
                <div class="menu__ico">${animeIcon}</div>
                <div class="menu__text">Аниме</div>
            </li>
        `);

        menuItem.on('hover:enter', function() {
            openAnimeSection();
        });

        return menuItem;
    }

    function openAnimeSection() {
        Lampa.Activity.push({
            url: 'discover/tv?vote_average.gte=6.5&vote_average.lte=9.5&first_air_date.lte=2026-12-31&first_air_date.gte=2020-01-01&with_original_language=ja',
            title: 'Аниме',
            component: 'category_full',
            source: 'tmdb',
            card_type: 'poster',
            page: 1,
            view: 'anime_grid', // Наш кастомный тип отображения
            onReady: function(activity) {
                customizeAnimeView(activity);
            }
        });
    }

    function customizeAnimeView(activity) {
        // Кастомизируем шаблон
        activity.render = function() {
            return `
                <div class="anime-container">
                    <div class="anime-header">
                        <div class="anime-title">Аниме</div>
                        <div class="anime-subtitle">Лучшие японские сериалы</div>
                    </div>
                    <div class="anime-grid"></div>
                </div>
            `;
        };

        // Переопределяем загрузку контента
        activity.load = function() {
            this.loading = true;
            
            Lampa.TMDB.api(this.params.url, (data)=> {
                this.loading = false;
                
                if (data.results && data.results.length) {
                    this.createGrid(data.results);
                }
            });
        };

        // Создаем сетку карточек
        activity.createGrid = function(items) {
            const grid = this.body.find('.anime-grid');
            grid.html('');
            
            items.forEach((item, index)=> {
                const card = this.createCard(item);
                card.css({
                    'opacity': 0,
                    'animation': `${config.animation.fadeIn} ${index*0.1}s`
                });
                grid.append(card);
            });
        };

        // Создаем карточку
        activity.createCard = function(item) {
            return $(`
                <div class="anime-card selector" data-id="${item.id}">
                    <div class="anime-card-poster">
                        <div class="anime-card-image" style="background-image: url(${Lampa.TMDB.image(item.poster_path)})"></div>
                        <div class="anime-card-overlay">
                            <div class="anime-card-title">${item.name}</div>
                            <div class="anime-card-meta">
                                <span>${item.vote_average}</span>
                                <span>${item.first_air_date.substring(0,4)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        };

        // Обновляем активность
        activity.update();
    }

    function addCustomStyles() {
        const styles = `
            <style>
                /* Анимации */
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                /* Контейнер */
                .anime-container {
                    padding: 20px;
                    animation: ${config.animation.slideUp};
                }
                
                /* Шапка */
                .anime-header {
                    margin-bottom: 30px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                
                .anime-title {
                    font-size: 32px;
                    font-weight: 700;
                    margin-bottom: 5px;
                }
                
                .anime-subtitle {
                    font-size: 16px;
                    opacity: 0.7;
                }
                
                /* Сетка */
                .anime-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(${config.cardStyle.width}px, 1fr));
                    gap: ${config.gridStyle.gap}px;
                    padding: ${config.gridStyle.padding}px;
                }
                
                /* Карточка */
                .anime-card {
                    width: 100%;
                    height: ${config.cardStyle.height}px;
                    border-radius: ${config.cardStyle.radius}px;
                    overflow: hidden;
                    position: relative;
                    transition: ${config.cardStyle.transition};
                }
                
                .anime-card:hover {
                    transform: translateY(-5px) scale(1.03);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
                }
                
                .anime-card-poster {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }
                
                .anime-card-image {
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                }
                
                .anime-card-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 15px;
                    background: linear-gradient(transparent, rgba(0,0,0,0.8));
                }
                
                .anime-card-title {
                    font-size: ${config.cardStyle.titleSize}px;
                    font-weight: 500;
                    margin-bottom: 5px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .anime-card-meta {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    opacity: 0.8;
                }
            </style>
        `;
        
        $('head').append(styles);
    }

    Lampa.Platform.tv();
})();