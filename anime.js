(function() {
    'use strict';

    const CONFIG = {
        menuItemAfter: '[data-action="tv"]',
        pluginName: 'simple_anime_plugin',
        defaultEnabled: true,
        menuIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#ff7eb3"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.5 14.67C9.5 15.96 8.46 17 7.17 17C5.88 17 4.83 15.96 4.83 14.67C4.83 13.38 5.88 12.33 7.17 12.33C8.46 12.33 9.5 13.38 9.5 14.67ZM12 17.5C10.33 17.5 8.86 16.64 8.04 15.33C7.22 14.02 7.22 12.48 8.04 11.17C8.86 9.86 10.33 9 12 9C13.67 9 15.14 9.86 15.96 11.17C16.78 12.48 16.78 14.02 15.96 15.33C15.14 16.64 13.67 17.5 12 17.5ZM16.83 17C15.54 17 14.5 15.96 14.5 14.67C14.5 13.38 15.54 12.33 16.83 12.33C18.12 12.33 19.17 13.38 19.17 14.67C19.17 15.96 18.12 17 16.83 17Z"/></svg>`
    };

    // Простейший перевод
    Lampa.Lang.add({ anime_title: { ru: "Аниме", en: "Anime" } });

    // Стили для меню
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
    `;
    document.head.appendChild(style);

    // Функция загрузки аниме
    function loadAnime() {
        Lampa.Activity.push({
            component: 'category',
            url: 'discover/tv',
            title: 'Аниме',
            source: 'tmdb',
            genre: '16', // Жанр аниме
            sort_by: 'popularity.desc',
            page: 1,
            card_type: true,
            plugin: CONFIG.pluginName
        });
    }

    // Создаем пункт меню
    function createMenuItem() {
        const menuItem = $(`
            <li class="menu__item selector" data-action="${CONFIG.pluginName}">
                <div class="menu__ico">${CONFIG.menuIcon}</div>
                <div class="menu__text">${Lampa.Lang.translate('anime_title')}</div>
            </li>
        `);

        menuItem.on('hover:enter', loadAnime);
        $(CONFIG.menuItemAfter).after(menuItem);
    }

    // Инициализация
    function init() {
        if (!window.Lampa || window.__simple_anime_loaded) return;
        window.__simple_anime_loaded = true;
        
        // Ждем загрузки меню
        const checkMenu = setInterval(() => {
            if ($(CONFIG.menuItemAfter).length) {
                clearInterval(checkMenu);
                createMenuItem();
            }
        }, 300);
    }

    // Запуск
    if (window.Lampa) {
        setTimeout(init, 1500);
    } else {
        window.addEventListener('lampa_loaded', init);
    }
})();