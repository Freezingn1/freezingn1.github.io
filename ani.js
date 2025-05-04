class ShikimoriAnime {
    constructor(lampa) {
        this.name = "Shikimori Anime";
        this.lampa = lampa;
        this.api_url = "https://shikimori.one/api";
        this.per_page = 20;

        // Принудительно устанавливаем TV-режим
        this.setTVMode();
    }

    // Активируем TV-режим для навигации с пульта
    setTVMode() {
        if (window.Lampa && Lampa.Platform) {
            Lampa.Platform.tv(); // Явно включаем TV-режим
            console.log("TV-режим активирован");
        } else {
            console.warn("Lampa.Platform не найден, TV-режим не включён");
        }
    }

    init() {
        this.injectStyles();
        console.log("Shikimori Anime plugin loaded!");

        this.lampa.menu.main.add({
            title: "Shikimori Anime",
            icon: "shikimori_icon",
            page: this.page.bind(this)
        });
    }

    // Стили с оптимизацией под TV (крупные карточки, фокус-эффекты)
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
            @media (max-width: 768px) {
                .shikimori-list {
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Остальные методы (page, loadAnime, searchAnime, renderAnimeList...) остаются без изменений
    // из предыдущего примера, но с учётом TV-оптимизации:
    async loadAnime(page = 1, search = "") {
        let url = `${this.api_url}/animes?limit=${this.per_page}&page=${page}&order=popularity`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            this.renderAnimeList(data);
        } catch (error) {
            console.error("Ошибка загрузки аниме:", error);
            document.querySelector(".shikimori-list").innerHTML = 
                `<p style="color: #ff5722; text-align: center; padding: 40px;">Ошибка загрузки данных. Проверьте интернет-соединение.</p>`;
        }
    }

    renderAnimeList(animes) {
        const listContainer = document.querySelector(".shikimori-list");
        listContainer.innerHTML = animes.length === 0 
            ? `<p style="text-align: center; color: #aaa;">Ничего не найдено</p>`
            : "";

        animes.forEach(anime => {
            const animeCard = document.createElement("div");
            animeCard.className = "shikimori-card";
            animeCard.tabIndex = 0; // Для фокуса на TV
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

    // Открытие аниме (пример для TV)
    openAnime(id) {
        this.lampa.app.tab("card", {
            id: `shikimori_${id}`,
            source: "shikimori",
            title: "Аниме",
            data: { id: id }
        });
    }
}

// Инициализация
if (window.lampa) {
    lampa.plugins.shikimori = new ShikimoriAnime(lampa);
    lampa.plugins.shikimori.init();
} else {
    console.error("Lampa не найдена!");
}