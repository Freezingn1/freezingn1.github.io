(function() {
    'use strict';

    // Конфигурация плагина
    const config = {
        name: 'Аниме',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path fill="currentColor" fill-rule="evenodd" d="m368.256 214.573l-102.627 187.35c40.554 71.844 73.647 97.07 138.664 94.503c63.67-2.514 136.974-89.127 95.694-163.243L397.205 150.94c-3.676 12.266-25.16 55.748-28.95 63.634M216.393 440.625C104.077 583.676-57.957 425.793 20.85 302.892c0 0 83.895-147.024 116.521-204.303c25.3-44.418 53.644-72.37 90.497-81.33c44.94-10.926 97.565 12.834 125.62 56.167c19.497 30.113 36.752 57.676 6.343 109.738c-3.613 6.184-136.326 248.402-143.438 257.46m8.014-264.595c-30.696-17.696-30.696-62.177 0-79.873s69.273 4.544 69.273 39.936s-38.578 57.633-69.273 39.937" clip-rule="evenodd"/></svg>`,
        tmdbParams: {
            url: 'discover/tv?sort_by=popularity.desc&vote_count.gte=100&with_original_language=ja&first_air_date.gte=2010-01-01',
            sections: [
                {
                    title: 'Популярное аниме',
                    url: 'discover/tv?sort_by=popularity.desc&with_original_language=ja'
                },
                {
                    title: 'Топ по рейтингу',
                    url: 'discover/tv?sort_by=vote_average.desc&vote_count.gte=100&with_original_language=ja'
                },
                {
                    title: 'Новинки',
                    url: 'discover/tv?sort_by=first_air_date.desc&with_original_language=ja'
                },
                {
                    title: 'Классика',
                    url: 'discover/tv?sort_by=vote_average.desc&first_air_date.lte=2000-12-31&with_original_language=ja'
                }
            ]
        }
    };

    // Инициализация плагина
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            // Устанавливаем TV режим для корректного отображения
            Lampa.Platform.tv();
            
            // Добавляем пункт меню
            addMenuEntry();
        }
    });

    function addMenuEntry() {
        // Создаем элемент меню
        const menuItem = $(`
            <li class="menu__item selector" data-action="anime_section">
                <div class="menu__ico">${config.icon}</div>
                <div class="menu__text">${config.name}</div>
            </li>
        `);

        // Обработчик клика
        menuItem.on('hover:enter', function() {
            openAnimeHome();
        });

        // Добавляем в меню (после "Главной")
        $('.menu .menu__list > li:first-child').after(menuItem);
    }

    function openAnimeHome() {
        // Создаем структуру главной страницы аниме
        Lampa.Activity.push({
            component: 'main',
            url: '',
            title: config.name,
            source: 'tmdb',
            page: 1,
            anim: true,
            // Кастомный рендер для имитации главной страницы
            render: function(data) {
                this.create = function() {
                    // Основной контейнер
                    this.html = $(`<div class="home home--anime"><div class="home__content"></div></div>`);
                    
                    // Добавляем секции
                    config.tmdbParams.sections.forEach((section, index) => {
                        const sectionHtml = $(`
                            <div class="home__section">
                                <div class="home__section-header selector">
                                    <h2 class="home__section-title">${section.title}</h2>
                                    <div class="home__section-more">Смотреть все</div>
                                </div>
                                <div class="home__section-content" data-load="${section.url}"></div>
                            </div>
                        `);
                        
                        // Обработчик клика на "Смотреть все"
                        sectionHtml.find('.home__section-header').on('hover:enter', () => {
                            Lampa.Activity.push({
                                url: section.url,
                                title: section.title,
                                component: 'category_full',
                                source: 'tmdb',
                                card_type: 'true'
                            });
                        });
                        
                        this.html.find('.home__content').append(sectionHtml);
                    });
                    
                    // Загружаем данные для каждой секции
                    setTimeout(() => {
                        this.html.find('[data-load]').each(function() {
                            const url = $(this).data('load');
                            loadSectionData(url, $(this));
                        });
                    }, 100);
                    
                    return this.html;
                };
                
                // Функция загрузки данных секции
                const loadSectionData = (url, container) => {
                    Lampa.TMDB.api(url).then(response => {
                        const items = response.results.slice(0, 15); // Берем первые 15 элементов
                        
                        // Создаем горизонтальный скролл карточек
                        const scroll = $('<div class="home__section-scroll"></div>');
                        
                        items.forEach(item => {
                            const card = createCard(item);
                            scroll.append(card);
                        });
                        
                        container.html(scroll);
                    });
                };
                
                // Создание карточки в стиле Lampa
                const createCard = (item) => {
                    return $(`
                        <div class="home__item selector" data-id="${item.id}">
                            <div class="home__item-cover">
                                <div class="home__item-img" style="background-image: url(${Lampa.TMDB.image(item.poster_path, 'w300')})">
                                    <div class="home__item-shadow"></div>
                                    <div class="home__item-grade">${item.vote_average.toFixed(1)}</div>
                                </div>
                            </div>
                            <div class="home__item-title">${item.name}</div>
                        </div>
                    `).on('hover:enter', function() {
                        Lampa.Activity.push({
                            url: 'tv/' + item.id,
                            title: item.name,
                            component: 'full',
                            source: 'tmdb'
                        });
                    });
                };
                
                return this;
            }
        });
    }
})();