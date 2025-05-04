(function() {
    'use strict';

    // Конфигурация
    const CONFIG = {
        menuItemAfter: '[data-action="tv"]',
        pluginName: 'strict_anime_only',
        defaultEnabled: true,
        menuIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#ff7eb3"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.5 14.67C9.5 15.96 8.46 17 7.17 17C5.88 17 4.83 15.96 4.83 14.67C4.83 13.38 5.88 12.33 7.17 12.33C8.46 12.33 9.5 13.38 9.5 14.67ZM12 17.5C10.33 17.5 8.86 16.64 8.04 15.33C7.22 14.02 7.22 12.48 8.04 11.17C8.86 9.86 10.33 9 12 9C13.67 9 15.14 9.86 15.96 11.17C16.78 12.48 16.78 14.02 15.96 15.33C15.14 16.64 13.67 17.5 12 17.5ZM16.83 17C15.54 17 14.5 15.96 14.5 14.67C14.5 13.38 15.54 12.33 16.83 12.33C18.12 12.33 19.17 13.38 19.17 14.67C19.17 15.96 18.12 17 16.83 17Z"/></svg>`,
        settingsAdded: false,
        // Используем конкретные списки TMDB с аниме
        sources: {
            series: {
                title: 'custom_anime_series',
                url: 'list/146567-anime-series', // https://www.themoviedb.org/list/146567-anime-series
                source: 'tmdb',
                type: 'list'
            },
            movies: {
                title: 'custom_anime_movies',
                url: 'list/146566-anime-movies', // https://www.themoviedb.org/list/146566-anime-movies
                source: 'tmdb',
                type: 'list'
            },
            top: {
                title: 'custom_anime_top',
                url: 'list/146568-top-anime', // https://www.themoviedb.org/list/146568-top-anime
                source: 'tmdb',
                type: 'list'
            },
            popular: {
                title: 'custom_anime_popular',
                url: 'list/146569-popular-anime', // https://www.themoviedb.org/list/146569-popular-anime
                source: 'tmdb',
                type: 'list'
            }
        }
    };

    // Добавляем переводы
    function addTranslations() {
        Lampa.Lang.add({
            custom_anime_title: {
                ru: "Аниме",
                en: "Anime",
                uk: "Аніме",
                zh: "动漫"
            },
            custom_anime_series: {
                ru: "Аниме сериалы",
                en: "Anime Series",
                uk: "Аніме серіали",
                zh: "动漫剧集"
            },
            custom_anime_movies: {
                ru: "Аниме фильмы",
                en: "Anime Movies",
                uk: "Аніме фільми",
                zh: "动漫电影"
            },
            custom_anime_popular: {
                ru: "Популярное аниме",
                en: "Popular Anime",
                uk: "Популярне аніме",
                zh: "热门动漫"
            },
            custom_anime_top: {
                ru: "Топ аниме",
                en: "Top Anime",
                uk: "Топ аніме",
                zh: "动漫排行榜"
            }
        });
    }

    // Добавляем стили
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

    // Создаем пункт меню
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
                url: CONFIG.sources.series.url,
                title: Lampa.Lang.translate('custom_anime_series'),
                source: CONFIG.sources.series.source,
                type: CONFIG.sources.series.type
            });
        });

        return menuItem;
    }

    // Загрузка контента из списков TMDB
    function loadContent(params) {
        const baseParams = {
            component: 'category',
            page: 1,
            card_type: true,
            plugin: CONFIG.pluginName
        };

        console.log('Loading anime from TMDB list:', params.url);
        Lampa.Activity.push(Object.assign(baseParams, params));
    }

    // Создаем подменю
    function createSubmenu() {
        let submenu = $(`.${CONFIG.pluginName}-submenu`)[0];
        if (submenu) return submenu;

        submenu = document.createElement('div');
        submenu.className = `${CONFIG.pluginName}-submenu`;
        submenu.style.display = 'none';
        document.body.appendChild(submenu);

        // Создаем пункты подменю для каждого списка
        Object.values(CONFIG.sources).forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = `selector focusable ${CONFIG.pluginName}-submenu-item`;
            menuItem.innerHTML = `
                <div style="width:24px;height:24px;margin-right:10px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff7eb3">
                        <path d="${item === CONFIG.sources.series ? 'M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"' : 
                              item === CONFIG.sources.movies ? 'M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"' :
                              item === CONFIG.sources.top ? 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"' :
                              'M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z'}"/>
                    </svg>
                </div>
                <div>${Lampa.Lang.translate(item.title)}</div>
            `;

            menuItem.addEventListener('hover:enter', () => {
                loadContent({
                    url: item.url,
                    title: Lampa.Lang.translate(item.title),
                    source: item.source,
                    type: item.type
                });
                submenu.style.display = 'none';
            });

            submenu.appendChild(menuItem);
        });

        // Управление подменю
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

    // Настройки плагина
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

    // Обновляем видимость меню
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

    // Инициализация плагина
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
    if (window.Lampa && !window.__strict_anime_plugin_loaded) {
        window.__strict_anime_plugin_loaded = true;
        
        // Добавляем небольшую задержку для гарантированной инициализации Lampa
        setTimeout(initPlugin, 1000);
    } else if (!window.__strict_anime_plugin_loaded) {
        window.addEventListener('lampa_loaded', () => {
            window.__strict_anime_plugin_loaded = true;
            setTimeout(initPlugin, 1000);
        });
    }
})();