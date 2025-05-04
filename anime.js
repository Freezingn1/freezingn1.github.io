(function() {
    'use strict';

    // Конфигурация
    const CONFIG = {
        menuItemAfter: '[data-action="tv"]',
        pluginName: 'custom_anime_alt',
        defaultEnabled: true,
        menuIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#ff7eb3"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.5 14.67C9.5 15.96 8.46 17 7.17 17C5.88 17 4.83 15.96 4.83 14.67C4.83 13.38 5.88 12.33 7.17 12.33C8.46 12.33 9.5 13.38 9.5 14.67ZM12 17.5C10.33 17.5 8.86 16.64 8.04 15.33C7.22 14.02 7.22 12.48 8.04 11.17C8.86 9.86 10.33 9 12 9C13.67 9 15.14 9.86 15.96 11.17C16.78 12.48 16.78 14.02 15.96 15.33C15.14 16.64 13.67 17.5 12 17.5ZM16.83 17C15.54 17 14.5 15.96 14.5 14.67C14.5 13.38 15.54 12.33 16.83 12.33C18.12 12.33 19.17 13.38 19.17 14.67C19.17 15.96 18.12 17 16.83 17Z"/></svg>`,
        settingsAdded: false,
        // Используем TMDB с конкретными параметрами для аниме
        sources: {
            movies: {
                url: 'movie',
                source: 'tmdb',
                type: 'movie',
                genre: '16', // ID жанра аниме в TMDB
                sort_by: 'popularity.desc',
                with_genres: '16,10751', // Аниме + анимация
                with_original_language: 'ja' // Японские
            },
            tv: {
                url: 'tv',
                source: 'tmdb',
                type: 'tv',
                genre: '16',
                sort_by: 'popularity.desc',
                with_genres: '16,10751',
                with_original_language: 'ja'
            },
            popular: {
                url: 'discover/movie',
                source: 'tmdb',
                sort_by: 'popularity.desc',
                with_genres: '16,10751',
                with_original_language: 'ja',
                'vote_count.gte': '50' // Минимальное количество голосов
            },
            top: {
                url: 'discover/movie',
                source: 'tmdb',
                sort_by: 'vote_average.desc',
                with_genres: '16,10751',
                with_original_language: 'ja',
                'vote_count.gte': '100' // Только с достаточным количеством оценок
            },
            new: {
                url: 'discover/movie',
                source: 'tmdb',
                sort_by: 'primary_release_date.desc',
                with_genres: '16,10751',
                with_original_language: 'ja',
                'primary_release_date.gte': `${new Date().getFullYear()-1}-01-01`,
                'primary_release_date.lte': `${new Date().getFullYear()+1}-12-31`
            }
        }
    };

    // Добавляем переводы (остается без изменений)
    function addTranslations() {
        Lampa.Lang.add({
            custom_anime_title: {
                ru: "Аниме",
                en: "Anime",
                uk: "Аніме",
                zh: "动漫"
            },
            custom_anime_movies: {
                ru: "Аниме фильмы",
                en: "Anime Movies",
                uk: "Аніме фільми",
                zh: "动漫电影"
            },
            custom_anime_tv: {
                ru: "Аниме сериалы",
                en: "Anime TV",
                uk: "Аніме серіали",
                zh: "动漫剧集"
            },
            custom_anime_popular: {
                ru: "Популярное",
                en: "Popular",
                uk: "Популярне",
                zh: "热门"
            },
            custom_anime_top: {
                ru: "Топ рейтинга",
                en: "Top Rated",
                uk: "Топ рейтингу",
                zh: "评分最高"
            },
            custom_anime_new: {
                ru: "Новинки",
                en: "New Releases",
                uk: "Новинки",
                zh: "新发布"
            }
        });
    }

    // Добавляем стили (остается без изменений)
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            [data-action="${CONFIG.pluginName}"] .menu__ico {
                background: linear-gradient(135deg, #ff7eb3, #ff758c);
                border-radius: 50%;
                padding: 3px;
            }
            [data-action="${CONFIG.pluginName}"] .menu__text {
                color: #ff7eb3;
                font-weight: 500;
            }
            .${CONFIG.pluginName}-submenu {
                background: rgba(30, 30, 40, 0.95) !important;
                border: 1px solid #ff7eb3;
                border-radius: 6px;
                padding: 10px;
            }
            .${CONFIG.pluginName}-submenu-item {
                background: rgba(255, 126, 179, 0.1);
                border-left: 3px solid #ff7eb3;
                padding: 10px;
                margin-bottom: 5px;
                border-radius: 4px;
            }
            .${CONFIG.pluginName}-submenu-item:hover {
                background: rgba(255, 126, 179, 0.2) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Создаем пункт меню (остается без изменений)
    function createMenuItem() {
        const existingItem = $(`[data-action="${CONFIG.pluginName}"]`);
        if (existingItem.length) return existingItem;

        const menuItem = $(`
            <li class="menu__item selector" data-action="${CONFIG.pluginName}">
                <div class="menu__ico">${CONFIG.menuIcon}</div>
                <div class="menu__text">${Lampa.Lang.translate('custom_anime_title')}</div>
            </li>
        `);

        menuItem.on('hover:enter', () => {
            loadContent({
                url: CONFIG.sources.movies.url,
                title: Lampa.Lang.translate('custom_anime_title'),
                source: CONFIG.sources.movies.source,
                with_genres: CONFIG.sources.movies.with_genres
            });
        });

        return menuItem;
    }

    // Загрузка контента с улучшенными параметрами
    function loadContent(params) {
        const baseParams = {
            component: 'category',
            page: 1,
            card_type: true,
            plugin: CONFIG.pluginName
        };

        // Добавляем дополнительные параметры для TMDB
        if (params.source === 'tmdb') {
            params = {
                ...params,
                with_original_language: 'ja',
                with_genres: params.with_genres || '16,10751',
                'vote_count.gte': params['vote_count.gte'] || '20'
            };
        }

        // Проверяем параметры перед загрузкой
        console.log('Loading anime content with params:', params);
        Lampa.Activity.push(Object.assign(baseParams, params));
    }

    // Создаем подменю (остается без изменений)
    function createSubmenu() {
        let submenu = $(`.${CONFIG.pluginName}-submenu`)[0];
        if (submenu) return submenu;

        submenu = document.createElement('div');
        submenu.className = `${CONFIG.pluginName}-submenu`;
        submenu.style.display = 'none';
        document.body.appendChild(submenu);

        const menuItems = [
            {
                title: 'custom_anime_movies',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#ff7eb3"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>',
                params: CONFIG.sources.movies
            },
            {
                title: 'custom_anime_tv',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#ff7eb3"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/></svg>',
                params: CONFIG.sources.tv
            },
            {
                title: 'custom_anime_popular',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#ff7eb3"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>',
                params: CONFIG.sources.popular
            },
            {
                title: 'custom_anime_top',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#ff7eb3"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>',
                params: CONFIG.sources.top
            },
            {
                title: 'custom_anime_new',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#ff7eb3"><path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-10 5h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
                params: CONFIG.sources.new
            }
        ];

        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = `selector focusable ${CONFIG.pluginName}-submenu-item`;
            menuItem.innerHTML = `
                <div style="width:24px;height:24px;margin-right:10px;">${item.icon}</div>
                <div>${Lampa.Lang.translate(item.title)}</div>
            `;

            menuItem.addEventListener('hover:enter', () => {
                loadContent({
                    ...item.params,
                    title: Lampa.Lang.translate(item.title)
                });
                submenu.style.display = 'none';
            });

            submenu.appendChild(menuItem);
        });

        // Управление подменю (остается без изменений)
        $('body').on('hover:enter', `[data-action="${CONFIG.pluginName}"]`, () => {
            const rect = $(`[data-action="${CONFIG.pluginName}"]`)[0].getBoundingClientRect();
            submenu.style.display = 'block';
            submenu.style.position = 'absolute';
            submenu.style.left = `${rect.left}px`;
            submenu.style.top = `${rect.bottom}px`;
            submenu.style.zIndex = '1000';
        });

        document.addEventListener('click', (e) => {
            if (!submenu.contains(e.target)) {
                submenu.style.display = 'none';
            }
        });

        return submenu;
    }

    // Настройки плагина (остается без изменений)
    function setupSettings() {
        if (CONFIG.settingsAdded) return;
        CONFIG.settingsAdded = true;

        try {
            Lampa.SettingsApi.addComponent({
                component: CONFIG.pluginName,
                name: Lampa.Lang.translate('custom_anime_title'),
                icon: CONFIG.menuIcon
            });

            Lampa.SettingsApi.addParam({
                component: CONFIG.pluginName,
                param: {
                    name: "enabled",
                    type: "trigger",
                    default: CONFIG.defaultEnabled
                },
                field: {
                    name: Lampa.Lang.translate('custom_anime_title'),
                    description: "Включить раздел Аниме"
                },
                onChange: (value) => {
                    Lampa.Storage.set(`${CONFIG.pluginName}_enabled`, value);
                    updateMenuVisibility(value === 'true');
                }
            });
        } catch (e) {
            console.error('Anime plugin settings error:', e);
        }
    }

    // Обновляем видимость меню (остается без изменений)
    function updateMenuVisibility(visible) {
        if (visible) {
            const menuItem = createMenuItem();
            const $target = $(CONFIG.menuItemAfter);
            
            if ($target.length && !$target.next(`[data-action="${CONFIG.pluginName}"]`).length) {
                $target.after(menuItem);
            }
            
            createSubmenu();
        } else {
            $(`[data-action="${CONFIG.pluginName}"]`).remove();
            $(`.${CONFIG.pluginName}-submenu`).remove();
        }
    }

    // Инициализация плагина (остается без изменений)
    function initPlugin() {
        addTranslations();
        addStyles();
        setupSettings();

        // Проверяем статус из настроек
        const isEnabled = Lampa.Storage.get(`${CONFIG.pluginName}_enabled`, CONFIG.defaultEnabled.toString()) === 'true';
        
        if (isEnabled) {
            // Ждем готовности меню
            const waitForMenu = setInterval(() => {
                if ($(CONFIG.menuItemAfter).length) {
                    clearInterval(waitForMenu);
                    updateMenuVisibility(true);
                }
            }, 100);
        }
    }

    // Запуск с защитой от повторной инициализации
    if (window.Lampa && !window.__anime_alt_plugin_loaded) {
        window.__anime_alt_plugin_loaded = true;
        
        // Добавляем небольшую задержку для гарантированной инициализации Lampa
        setTimeout(initPlugin, 1000);
    } else if (!window.__anime_alt_plugin_loaded) {
        window.addEventListener('lampa_loaded', () => {
            window.__anime_alt_plugin_loaded = true;
            setTimeout(initPlugin, 1000);
        });
    }
})();