(function() {
    "use strict";

    const TMDB_API_KEY = "4ef0d7355d9ffb5151e987764708ce96";
    const TMDB_API_URL = "https://api.themoviedb.org/3";
    const titleCache = new Map();
    const logoCheckCache = new Map();

    // Улучшенная проверка русского логотипа
    function hasRussianLogo(card) {
        const cacheKey = card.id || JSON.stringify(card);
        if (logoCheckCache.has(cacheKey)) {
            return logoCheckCache.get(cacheKey);
        }

        try {
            // Проверяем все возможные места, где могут быть логотипы
            const logos = card.images?.logos || 
                        card.data?.images?.logos || 
                        card.movie?.images?.logos ||
                        (card.id && Lampa.TMDB.cache(card.id)?.logos) || 
                        [];

            const hasLogo = logos.some(logo => logo.iso_639_1 === 'ru');
            logoCheckCache.set(cacheKey, hasLogo);
            return hasLogo;
        } catch (e) {
            console.error("Logo check error:", e);
            return false;
        }
    }

    async function fetchRussianTitle(card) {
        try {
            if (titleCache.has(card.id)) {
                return titleCache.get(card.id);
            }

            const mediaType = card.first_air_date ? 'tv' : 'movie';
            const url = `${TMDB_API_URL}/${mediaType}/${card.id}?language=ru-RU&api_key=${TMDB_API_KEY}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            const russianTitle = data.title || data.name;

            if (russianTitle) {
                titleCache.set(card.id, russianTitle);
                return russianTitle;
            }
        } catch (error) {
            console.error("Ошибка при получении русского названия:", error);
        }
        return null;
    }

    function displayRussianTitle(element, title) {
        if (!title || element.querySelector('.ru-title')) return;

        const titleElement = document.createElement('div');
        titleElement.className = 'ru-title';
        titleElement.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 8px;
            background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
            color: white;
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            z-index: 10;
        `;
        titleElement.textContent = `RU: ${title}`;
        element.style.position = 'relative';
        element.appendChild(titleElement);
    }

    function handleCatalogCards() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList?.contains('card')) {
                        const cardData = Lampa.Template.get('card', node);
                        if (cardData?.data) {
                            // Даем время для загрузки логотипов
                            setTimeout(() => {
                                if (!hasRussianLogo(cardData)) {
                                    fetchRussianTitle(cardData.data).then(title => {
                                        if (title) displayRussianTitle(node, title);
                                    });
                                } else {
                                    // Удаляем русское название, если есть логотип
                                    const existingTitle = node.querySelector('.ru-title');
                                    if (existingTitle) existingTitle.remove();
                                }
                            }, 300);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Обработка уже существующих карточек
        document.querySelectorAll('.card').forEach(card => {
            const cardData = Lampa.Template.get('card', card);
            if (cardData?.data) {
                setTimeout(() => {
                    if (!hasRussianLogo(cardData)) {
                        fetchRussianTitle(cardData.data).then(title => {
                            if (title) displayRussianTitle(card, title);
                        });
                    } else {
                        const existingTitle = card.querySelector('.ru-title');
                        if (existingTitle) existingTitle.remove();
                    }
                }, 300);
            }
        });
    }

    function handleFullPage() {
        Lampa.Listener.follow("full", (e) => {
            if (e.type === "complite") {
                const render = e.object.activity?.render();
                if (!render) return;

                $('.ru-title-full', render).remove();

                setTimeout(() => {
                    if (!hasRussianLogo(e.data)) {
                        fetchRussianTitle(e.data.movie).then(title => {
                            if (!title) return;

                            const titleElement = $(".full-start-new__rate-line", render).first();
                            if (titleElement.length) {
                                titleElement.before(`
                                    <div class="ru-title-full" style="
                                        color: #ffffff;
                                        font-weight: 500;
                                        text-align: right;
                                        margin-bottom: 10px;
                                        opacity: 0.80;
                                        max-width: 500px;
                                    ">
                                        RU: ${title}
                                    </div>
                                `);
                            }
                        });
                    }
                }, 500);
            }
        });
    }

    if (!window.tmdbRussianTitlesPlugin) {
        window.tmdbRussianTitlesPlugin = true;
        handleCatalogCards();
        handleFullPage();
        
        const style = document.createElement('style');
        style.textContent = `
            .ru-title {
                transition: all 0.3s ease;
            }
            .ru-title:hover {
                white-space: normal;
                background: rgba(0,0,0,0.9) !important;
            }
        `;
        document.head.appendChild(style);
    }
})();