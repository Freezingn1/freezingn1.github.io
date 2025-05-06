(function() {
    "use strict";

    // Конфигурация TMDB API
    const TMDB_API_KEY = "4ef0d7355d9ffb5151e987764708ce96";
    const TMDB_API_URL = "https://api.themoviedb.org/3";
    const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/";

    // Кэш для хранения названий
    const titleCache = new Map();

    // Получаем русское название через TMDB API
    async function fetchRussianTitle(card) {
        try {
            // Проверяем кэш
            if (titleCache.has(card.id)) {
                return titleCache.get(card.id);
            }

            // Определяем тип контента (фильм или сериал)
            const mediaType = card.first_air_date ? 'tv' : 'movie';
            const url = `${TMDB_API_URL}/${mediaType}/${card.id}?language=ru-RU&api_key=${TMDB_API_KEY}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "accept": "application/json",
                    "Authorization": `Bearer ${TMDB_API_KEY}`
                }
            });

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

    // Отображаем русское название на карточке
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

    // Обработчик для карточек в списках
    function handleCatalogCards() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList?.contains('card')) {
                        const cardData = Lampa.Template.get('card', node);
                        if (cardData?.data) {
                            fetchRussianTitle(cardData.data).then(title => {
                                if (title) displayRussianTitle(node, title);
                            });
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Обрабатываем уже существующие карточки
        document.querySelectorAll('.card').forEach(card => {
            const cardData = Lampa.Template.get('card', card);
            if (cardData?.data) {
                fetchRussianTitle(cardData.data).then(title => {
                    if (title) displayRussianTitle(card, title);
                });
            }
        });
    }

    // Обработчик для полной страницы
    function handleFullPage() {
        Lampa.Listener.follow("full", (e) => {
            if (e.type === "complite") {
                const render = e.object.activity?.render();
                if (!render) return;

                // Удаляем старые заголовки
                $('.ru-title-full', render).remove();

                fetchRussianTitle(e.data.movie).then(title => {
                    if (!title) return;

                    // Размещаем над основным заголовком
                    const titleElement = $(".cardify__right", render).first();
                    if (titleElement.length) {
                        titleElement.before(`
                            <div class="ru-title-full" style="
                                color: #ffffff;
								font-weight: 500;
								text-align: right;
								position: relative;
								transform: translateY(-80px);
								right: -394px;
								max-width: 300;
								opacity: 0.80;
								top: -28px;
                            ">
                                RU: ${title}
                            </div>
                        `);
                    }
                });
            }
        });
    }

    // Запуск плагина
    if (!window.tmdbRussianTitlesPlugin) {
        window.tmdbRussianTitlesPlugin = true;
        handleCatalogCards();
        handleFullPage();
        
        // Добавляем стили для лучшего отображения
        const style = document.createElement('style');
        style.textContent = `
            .ru-title:hover {
                white-space: normal;
                background: rgba(0,0,0,0.9) !important;
            }
        `;
        document.head.appendChild(style);
    }
})();