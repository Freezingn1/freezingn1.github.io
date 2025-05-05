// Ждем готовности приложения
Lampa.Listener.follow('app', function(e) {
    if (e.type === 'ready') {
        initAnimePlugin();
    }
});

function initAnimePlugin() {
    // Проверяем, что это официальное приложение Lampa
    if (Lampa.Manifest.origin !== 'bylampa') {
        Lampa.Noty.show('Плагин работает только в официальном приложении Lampa');
        return;
    }

    class ShikimoriAnime {
        constructor(lampa) {
            this.name = "Shikimori Anime";
            this.lampa = lampa;
            this.api_url = "https://shikimori.one/api";
            this.per_page = 20;
            this.searchDelay = 500; // Задержка поиска для TV

            this.setTVMode();
        }

        setTVMode() {
            if (window.Lampa && Lampa.Platform) {
                Lampa.Platform.tv();
                console.log("[Shikimori] TV-режим активирован");
            }
        }

        init() {
            this.injectStyles();
            console.log("[Shikimori] Плагин инициализирован");

            this.createAnimeMenuItem();
        }

        createAnimeMenuItem() {
            const menuItem = this.createMenuItem();
            
            // Добавляем пункт в начало меню с проверкой
            Lampa.Listener.follow('full', (e) => {
                if (e.type === 'menu') {
                    const $menuList = $('.menu .menu__list').eq(0);
                    if ($menuList.length && !$menuList.find('[data-action="shikimori_anime"]').length) {
                        $menuList.prepend(menuItem);
                    }
                }
            });
        }

        createMenuItem() {
            const animeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ff5722">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/>
            </svg>`;

            const menuItem = $(`
                <li class="menu__item selector" data-action="shikimori_anime">
                    <div class="menu__ico">${animeIcon}</div>
                    <div class="menu__text">Аниме</div>
                </li>
            `);

            menuItem.on('hover:enter', () => {
                this.openAnimeSection();
            });

            return menuItem;
        }

        openAnimeSection() {
            this.lampa.app.tab("main");
            this.page();
        }

        injectStyles() {
            const style = document.createElement("style");
            style.textContent = `
                .shikimori-anime {
                    padding: 20px;
                }
                .shikimori-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }
                .shikimori-card {
                    background: #2a2a2a;
                    border-radius: 12px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .shikimori-card:focus {
                    transform: scale(1.05);
                    box-shadow: 0 0 0 3px #ff5722;
                    outline: none;
                }
                .shikimori-card img {
                    width: 100%;
                    height: 400px;
                    object-fit: cover;
                }
                .shikimori-info {
                    padding: 15px;
                }
                .shikimori-info h3 {
                    margin: 0 0 8px 0;
                    font-size: 20px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .shikimori-search {
                    width: 100%;
                    padding: 15px;
                    margin-bottom: 30px;
                    border: none;
                    border-radius: 8px;
                    background: #333;
                    color: #fff;
                    font-size: 18px;
                }
            `;
            document.head.appendChild(style);
        }

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

            let searchTimer;
            document.querySelector(".shikimori-search").addEventListener("input", (e) => {
                clearTimeout(searchTimer);
                searchTimer = setTimeout(() => {
                    this.searchAnime(e.target.value);
                }, this.searchDelay);
            });
        }

        async loadAnime(page = 1, search = "") {
            let url = `${this.api_url}/animes?limit=${this.per_page}&page=${page}&order=popularity`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                this.renderAnimeList(data);
            } catch (error) {
                console.error("[Shikimori] Ошибка загрузки:", error);
                Lampa.Noty.show("Ошибка загрузки данных");
            }
        }

        renderAnimeList(animes) {
            const listContainer = document.querySelector(".shikimori-list");
            listContainer.innerHTML = animes.length === 0 
                ? `<p style="text-align:center; color:#aaa">Ничего не найдено</p>`
                : "";

            animes.forEach(anime => {
                const animeCard = document.createElement("div");
                animeCard.className = "shikimori-card";
                animeCard.tabIndex = 0;
                animeCard.innerHTML = `
                    <img src="https://shikimori.one${anime.image.original}" alt="${anime.name}" />
                    <div class="shikimori-info">
                        <h3>${anime.russian || anime.name}</h3>
                        <p>⭐ ${anime.score || "N/A"} | ${this.formatKind(anime.kind)}</p>
                    </div>
                `;
                animeCard.addEventListener("click", () => this.openAnime(anime.id));
                listContainer.appendChild(animeCard);
            });
        }

        formatKind(kind) {
            const types = {
                "tv": "TV Сериал",
                "movie": "Фильм",
                "ova": "OVA",
                "ona": "ONA",
                "special": "Спешл"
            };
            return types[kind] || kind;
        }

        openAnime(id) {
            Lampa.Noty.show(`Открываем аниме ID: ${id}`);
            // Реализация открытия карточки
            // this.lampa.app.tab("card", {id: `shikimori_${id}`});
        }
    }

    // Инициализация плагина
    if (window.Lampa) {
        new ShikimoriAnime(Lampa).init();
    }
}