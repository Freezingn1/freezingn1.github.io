!function() {
    "use strict";

    // Конфигурация
    const CONFIG = {
        debug: true, // Включить вывод отладочной информации
        tmdbApiKey: "4ef0d7355d9ffb5151e987764708ce96",
        logoSize: "w500",
        maxLogoHeight: "4em",
        cacheTTL: 3600000 // 1 час в мс
    };

    // Инициализация плагина
    if (!window.logoPluginInitialized) {
        window.logoPluginInitialized = true;
        
        // Добавляем настройки
        Lampa.SettingsApi.addParam({
            component: "interface",
            param: {
                name: "logo_display_mode",
                type: "select",
                values: {
                    "all": "Все логотипы",
                    "ru_only": "Только русские",
                    "none": "Скрыть логотипы"
                },
                default: "all"
            },
            field: {
                name: "Отображение логотипов",
                description: "Управление показом логотипов в карточках"
            }
        });

        // Кэш
        const cache = {
            titles: new Map(),
            logos: new Map(),
            
            get: function(key, type) {
                const entry = this[type].get(key);
                if (entry && Date.now() - entry.timestamp < CONFIG.cacheTTL) {
                    return entry.data;
                }
                return null;
            },
            
            set: function(key, data, type) {
                this[type].set(key, {
                    data: data,
                    timestamp: Date.now()
                });
            }
        };

        // Логирование
        function log(message, data) {
            if (CONFIG.debug) {
                console.log(`[LogoPlugin] ${message}`, data || '');
            }
        }

        // Получение данных с TMDB
        async function fetchTMDBData(url) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                return await response.json();
            } catch (error) {
                log("Ошибка запроса к TMDB", { url, error });
                return null;
            }
        }

        // Получение русского названия
        async function getRussianTitle(card) {
            const cached = cache.get(card.id, 'titles');
            if (cached) return cached;

            const mediaType = card.first_air_date ? 'tv' : 'movie';
            const url = `https://api.themoviedb.org/3/${mediaType}/${card.id}?language=ru-RU&api_key=${CONFIG.tmdbApiKey}`;
            
            const data = await fetchTMDBData(url);
            if (!data) return null;

            const title = data.title || data.name;
            if (title) cache.set(card.id, title, 'titles');
            
            return title;
        }

        // Получение логотипов
        async function getLogos(card) {
            const cached = cache.get(card.id, 'logos');
            if (cached) return cached;

            const mediaType = card.first_air_date ? 'tv' : 'movie';
            const url = `https://api.themoviedb.org/3/${mediaType}/${card.id}/images?api_key=${CONFIG.tmdbApiKey}`;
            
            const data = await fetchTMDBData(url);
            if (!data) return [];

            const logos = data.logos || [];
            if (logos.length) cache.set(card.id, logos, 'logos');
            
            return logos;
        }

        // Выбор оптимального логотипа
        function selectLogo(logos, mode) {
            if (!logos.length) return null;
            
            let filtered = [...logos];
            if (mode === "ru_only") filtered = filtered.filter(l => l.iso_639_1 === 'ru');
            if (mode === "none" || !filtered.length) return null;

            return filtered.sort((a, b) => {
                // Приоритет: русские > английские > другие
                const langScore = {
                    'ru': 2,
                    'en': 1,
                    'null': 0,
                    'undefined': 0
                };
                
                const aScore = langScore[a.iso_639_1] || 0;
                const bScore = langScore[b.iso_639_1] || 0;
                
                return bScore - aScore || (b.vote_average || 0) - (a.vote_average || 0);
            })[0];
        }

        // Вставка логотипа
        function insertLogo(element, logoPath) {
            const img = new Image();
            img.src = Lampa.TMDB.image(`/t/p/${CONFIG.logoSize}${logoPath}`);
            img.style = `max-height: ${CONFIG.maxLogoHeight}; max-width: 100%; object-fit: contain;`;
            img.onerror = () => {
                log("Не удалось загрузить логотип", { src: img.src });
                element.text(element.data('original-text') || '');
            };
            
            element.empty().append(img);
        }

        // Вставка русского названия
        function insertRussianTitle(container, title) {
            container.find('.ru-title').remove();
            
            const titleElement = $(`
                <div class="ru-title" style="
                    color: rgba(255,255,255,0.8);
                    font-size: 1.1em;
                    margin: 5px 0;
                    text-shadow: 1px 1px 2px #000;
                ">
                    ${title}
                </div>
            `);
            
            // Пробуем разные места для вставки
            const insertPoints = [
                container.find('.full-start-new__rate-line'),
                container.find('.full-start__rate-line'),
                container.find('.full-start-new__subtitle'),
                container.find('.full-start__subtitle')
            ].filter(el => el.length);
            
            if (insertPoints.length) {
                insertPoints[0].before(titleElement);
            } else {
                container.find('[class*="__title"]').after(titleElement);
            }
        }

        // Обработчик страницы
        Lampa.Listener.follow("full", async (event) => {
            if (event.type !== "complite") return;
            
            try {
                const movie = event.data.movie;
                if (!movie) return;
                
                const render = event.object.activity.render();
                if (!render || !render.find) return;
                
                // Поиск элемента заголовка
                const titleElement = render.find('.full-start-new__title, .full-start__title, .full__title').first();
                if (!titleElement.length) {
                    log("Не найден элемент заголовка");
                    return;
                }
                
                const originalTitle = movie.title || movie.name;
                titleElement.data('original-text', originalTitle);
                
                const displayMode = Lampa.Storage.get("logo_display_mode", "interface") || "all";
                log("Обработка карточки", { id: movie.id, mode: displayMode });
                
                // Если логотипы отключены
                if (displayMode === "none") {
                    titleElement.text(originalTitle);
                    return;
                }
                
                // Получаем логотипы
                const logos = await getLogos(movie);
                log("Получены логотипы", { count: logos.length });
                
                const selectedLogo = selectLogo(logos, displayMode);
                log("Выбран логотип", selectedLogo);
                
                if (selectedLogo?.file_path) {
                    insertLogo(titleElement, selectedLogo.file_path);
                    
                    // Дополнительно показываем русское название для не русских логотипов
                    if (selectedLogo.iso_639_1 !== 'ru') {
                        const ruTitle = await getRussianTitle(movie);
                        if (ruTitle) insertRussianTitle(render, ruTitle);
                    }
                } else {
                    titleElement.text(originalTitle);
                }
            } catch (error) {
                log("Критическая ошибка", error);
            }
        });

        // Стили
        const style = document.createElement('style');
        style.textContent = `
            .ru-title {
                transition: opacity 0.2s ease;
            }
            .ru-title:hover {
                opacity: 1 !important;
            }
        `;
        document.head.appendChild(style);
    }
}();