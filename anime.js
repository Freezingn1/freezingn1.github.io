(function() {
    'use strict';

    const CONFIG = {
        menuItemAfter: '[data-action="tv"]',
        pluginName: 'anime_tmdb_direct',
        defaultEnabled: true,
        menuIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#ff7eb3"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.5 14.67C9.5 15.96 8.46 17 7.17 17C5.88 17 4.83 15.96 4.83 14.67C4.83 13.38 5.88 12.33 7.17 12.33C8.46 12.33 9.5 13.38 9.5 14.67ZM12 17.5C10.33 17.5 8.86 16.64 8.04 15.33C7.22 14.02 7.22 12.48 8.04 11.17C8.86 9.86 10.33 9 12 9C13.67 9 15.14 9.86 15.96 11.17C16.78 12.48 16.78 14.02 15.96 15.33C15.14 16.64 13.67 17.5 12 17.5ZM16.83 17C15.54 17 14.5 15.96 14.5 14.67C14.5 13.38 15.54 12.33 16.83 12.33C18.12 12.33 19.17 13.38 19.17 14.67C19.17 15.96 18.12 17 16.83 17Z"/></svg>`,
        apiKey: 'b0dd442bf37e49eecbb517b186e6f5ee', // Публичный ключ TMDB
        lists: {
            series: {
                id: 146567,
                title: 'anime_series'
            },
            movies: {
                id: 146566, 
                title: 'anime_movies'
            },
            top: {
                id: 146568,
                title: 'anime_top'
            }
        }
    };

    // Добавляем переводы
    function addTranslations() {
        Lampa.Lang.add({
            anime_title: {
                ru: "Аниме",
                en: "Anime",
                uk: "Аніме"
            },
            anime_series: {
                ru: "Аниме сериалы",
                en: "Anime Series",
                uk: "Аніме серіали"
            },
            anime_movies: {
                ru: "Аниме фильмы", 
                en: "Anime Movies",
                uk: "Аніме фільми"
            },
            anime_top: {
                ru: "Топ аниме",
                en: "Top Anime",
                uk: "Топ аніме"
            }
        });
    }

    // Стили
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
            .anime-submenu {
                background: rgba(30,30,40,0.95)!important;
                border: 1px solid #ff7eb3;
                border-radius: 6px;
                padding: 10px;
            }
            .anime-submenu-item {
                background: rgba(255,126,179,0.1);
                border-left: 3px solid #ff7eb3;
                padding: 10px;
                margin-bottom: 5px;
                border-radius: 4px;
            }
        `;
        document.head.appendChild(style);
    }

    // Загрузка списка через TMDB API
    async function loadAnimeList(list) {
        try {
            const url = `https://api.themoviedb.org/4/list/${list.id}?api_key=${CONFIG.apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if(data.results && data.results.length > 0) {
                const items = data.results.map(item => ({
                    id: item.id,
                    title: item.title || item.name,
                    poster: item.poster_path,
                    type: item.media_type === 'tv' ? 'tv' : 'movie'
                }));
                
                Lampa.Activity.push({
                    component: 'anime_screen',
                    url: `anime_${list.id}`,
                    title: Lampa.Lang.translate(list.title),
                    items: items,
                    plugin: CONFIG.pluginName
                });
            } else {
                Lampa.Noty.show(Lampa.Lang.translate('no_anime_found'));
            }
        } catch (e) {
            console.error('Anime list load error:', e);
            Lampa.Noty.show(Lampa.Lang.translate('load_error'));
        }
    }

    // Создаем меню
    function createMenu() {
        const existing = $(`[data-action="${CONFIG.pluginName}"]`);
        if (existing.length) return existing;

        const menuItem = $(`
            <li class="menu__item selector" data-action="${CONFIG.pluginName}">
                <div class="menu__ico">${CONFIG.menuIcon}</div>
                <div class="menu__text">${Lampa.Lang.translate('anime_title')}</div>
            </li>
        `);

        menuItem.on('hover:enter', () => {
            showSubmenu();
        });

        $(CONFIG.menuItemAfter).after(menuItem);
        return menuItem;
    }

    // Подменю
    function showSubmenu() {
        let submenu = $('.anime-submenu')[0];
        if (!submenu) {
            submenu = document.createElement('div');
            submenu.className = 'anime-submenu';
            document.body.appendChild(submenu);

            Object.values(CONFIG.lists).forEach(list => {
                const item = document.createElement('div');
                item.className = 'selector focusable anime-submenu-item';
                item.innerHTML = `
                    <div>${Lampa.Lang.translate(list.title)}</div>
                `;
                item.addEventListener('hover:enter', () => {
                    loadAnimeList(list);
                    submenu.style.display = 'none';
                });
                submenu.appendChild(item);
            });
        }

        const rect = $(`[data-action="${CONFIG.pluginName}"]`)[0].getBoundingClientRect();
        submenu.style.display = 'block';
        submenu.style.position = 'absolute';
        submenu.style.left = `${rect.left}px`;
        submenu.style.top = `${rect.bottom}px`;
        submenu.style.zIndex = '1000';

        document.addEventListener('click', function closeSubmenu(e) {
            if (!submenu.contains(e.target)) {
                submenu.style.display = 'none';
                document.removeEventListener('click', closeSubmenu);
            }
        });
    }

    // Инициализация
    function init() {
        if (!window.Lampa || window.__anime_plugin_loaded) return;
        window.__anime_plugin_loaded = true;

        addTranslations();
        addStyles();
        
        Lampa.Storage.set(`${CONFIG.pluginName}_enabled`, 'true');
        createMenu();
    }

    // Запуск
    if (window.Lampa) {
        setTimeout(init, 1000);
    } else {
        window.addEventListener('lampa_loaded', init);
    }
})();