class ShikimoriAnime {
    constructor(lampa) {
        this.name = "Shikimori Anime";
        this.lampa = lampa;
        this.api_url = "https://shikimori.one/api";
        this.per_page = 20;

        // Активируем TV-режим
        this.setTVMode();
    }

    setTVMode() {
        if (window.Lampa && Lampa.Platform) {
            Lampa.Platform.tv();
            console.log("TV-режим активирован");
        }
    }

    init() {
        this.injectStyles();
        console.log("Shikimori Anime plugin loaded!");

        // Создаем и добавляем пункт меню
        this.createAnimeMenuItem();
    }

    // Создаем кастомный пункт меню "Аниме"
    createAnimeMenuItem() {
        const menuItem = this.createMenuItem();
        
        // Добавляем пункт в начало меню
        const $menuList = $('.menu .menu__list').eq(0);
        if ($menuList.length) {
            $menuList.prepend(menuItem);
        } else {
            console.error("Меню не найдено!");
        }
    }

    createMenuItem() {
        // SVG иконка аниме (упрощенная версия)
        const animeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ff5722">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/>
        </svg>`;

        // Создаем элемент меню
        const menuItem = $(`
            <li class="menu__item selector" data-action="shikimori_anime">
                <div class="menu__ico">${animeIcon}</div>
                <div class="menu__text">Аниме</div>
            </li>
        `);

        // Обработчик выбора (адаптированный для TV)
        menuItem.on('hover:enter', () => {
            this.openAnimeSection();
        });

        return menuItem;
    }

    openAnimeSection() {
        this.lampa.app.tab("main"); // Переключаемся на главную вкладку
        this.page(); // Открываем нашу страницу
    }

    // Остальные методы (injectStyles, page, loadAnime и т.д.) 
    // из предыдущего примера остаются без изменений
    page() {
        let html = `
            <div class="shikimori-anime">
                <div class="shikimori-header">
                    <h1>Аниме с Shikimori</h1>
                    <input type="text" class="shikimori-search" placeholder="Поиск аниме..." />
                </div>
                <div class="shikimori-list"></div>
            </div>
        `;

        this.lampa.app.render(html);
        this.loadAnime();

        // TV-оптимизированный поиск (с задержкой 500 мс)
        let searchTimer;
        document.querySelector(".shikimori-search").addEventListener("input", (e) => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                this.searchAnime(e.target.value);
            }, 500);
        });
    }

    // ... (остальные методы loadAnime, renderAnimeList и т.д.)
}

// Инициализация
if (window.lampa) {
    lampa.plugins.shikimori = new ShikimoriAnime(lampa);
    lampa.plugins.shikimori.init();
} else {
    console.error("Lampa не найдена!");
}