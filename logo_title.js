!function() {
    "use strict";
    
    // Добавляем компонент в настройки Lampa
    Lampa.SettingsApi.addComponent({
        component: 'logo_nazvanie',
        name: Lampa.Lang.translate('Интерфейс карточек'),
        icon: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><path d="M16,216H92a52,52,0,1,0-52-52C40,200,16,216,16,216Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M112.41,116.16C131.6,90.29,179.46,32,224,32c0,44.54-58.29,92.4-84.16,111.59" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M133,90.64a84.39,84.39,0,0,1,32.41,32.41" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>
        `
    });

    // Настройки отображения логотипов
    Lampa.SettingsApi.addParam({
        component: "logo_nazvanie",
        param: {
            name: "logo_glav",
            type: "select",
            values: { 
                "show_all": "Все логотипы", 
                "ru_only": "Только русские", 
                "hide": "Скрыть логотипы"
            },
            default: "show_all"
        },
        field: {
            name: "Настройки логотипов в карточке",
            description: "Управление отображением логотипов вместо названий"
        }
    });

    // Настройки отображения русских названий
    Lampa.SettingsApi.addParam({
        component: "logo_nazvanie",
        param: {
            name: "russian_titles_settings",
            type: "select",
            values: {
                "show_when_no_ru_logo": "Показывать, если нет русского логотипа",
                "show_never": "Никогда не показывать",
                "show_always": "Показывать всегда (если доступно)"
            },
            default: "show_when_no_ru_logo"
        },
        field: {
            name: "Настройки русских названий",
            description: "Управление отображением русских названий"
        }
    });

    // Проверяем, не был ли уже загружен плагин
    if (!window.logoplugin) {
        window.logoplugin = true;

        const TMDB_API_KEY = "4ef0d7355d9ffb5151e987764708ce96";
        const MAX_CACHE_SIZE = 200;
        const titleCache = new Map();
        const logoCache = new Map();
        let currentRequest = null;

        // Функции для работы с кэшем
        function addToCache(cache, key, value) {
            if (cache.size >= MAX_CACHE_SIZE) {
                const firstKey = cache.keys().next().value;
                cache.delete(firstKey);
            }
            cache.set(key, value);
        }

        function clearCache() {
            if (titleCache.size > MAX_CACHE_SIZE) {
                const keys = Array.from(titleCache.keys()).slice(0, titleCache.size - MAX_CACHE_SIZE);
                keys.forEach(key => titleCache.delete(key));
            }
            if (logoCache.size > MAX_CACHE_SIZE) {
                const keys = Array.from(logoCache.keys()).slice(0, logoCache.size - MAX_CACHE_SIZE);
                keys.forEach(key => logoCache.delete(key));
            }
        }

        // Очищаем кэш каждые 5 минут
        setInterval(clearCache, 300000);

        /**
         * Выбирает лучший логотип в зависимости от настроек
         */
        function getBestLogo(logos, setting) {
            if (!logos?.length) return null;
            
            const filtered = setting === "ru_only" 
                ? logos.filter(l => l.iso_639_1 === 'ru') 
                : [...logos];
                
            if (!filtered.length) return null;
            
            return filtered.reduce((best, current) => {
                const bestPriority = getLangPriority(best);
                const currentPriority = getLangPriority(current);
                
                if (currentPriority > bestPriority) return current;
                if (currentPriority < bestPriority) return best;
                
                return (current.vote_average || 0) > (best.vote_average || 0) ? current : best;
            });
        }

        function getLangPriority(logo) {
            const LANG_PRIORITY = { 'ru': 3, 'en': 2 };
            return LANG_PRIORITY[logo?.iso_639_1] || 0;
        }

        /**
         * Получает русское название для карточки
         */
        async function fetchRussianTitle(card) {
            try {
                const cacheKey = `${card.id}_ru_title`;
                if (titleCache.has(cacheKey)) return titleCache.get(cacheKey);

                const mediaType = card.first_air_date ? 'tv' : 'movie';
                const url = Lampa.TMDB.api(mediaType) + `/${card.id}?language=ru-RU&api_key=${TMDB_API_KEY}`;

                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                const russianTitle = data.title || data.name;

                if (russianTitle) {
                    addToCache(titleCache, cacheKey, russianTitle);
                    return russianTitle;
                }
            } catch (error) {
                console.error("Ошибка при получении русского названия:", error);
            }
            return null;
        }

        /**
         * Получает логотипы для карточки
         */
        async function fetchLogos(movie) {
            const cacheKey = `${movie.id}_${Lampa.Storage.get("logo_glav")}`;
            if (logoCache.has(cacheKey)) return logoCache.get(cacheKey);

            try {
                const tmdbUrl = Lampa.TMDB.api(movie.name ? "tv" : "movie") + 
                               `/${movie.id}/images?api_key=${Lampa.TMDB.key()}`;
                const response = await fetch(tmdbUrl);
                const data = await response.json();
                const logos = data.logos || [];
                addToCache(logoCache, cacheKey, logos);
                return logos;
            } catch (error) {
                console.error("Ошибка загрузки логотипов:", error);
                return [];
            }
        }

        /**
         * Обновляет элемент заголовка
         */
        function updateTitleElement(titleElement, content, isAnime) {
            if (!titleElement || !titleElement.length) return;

            if (typeof content === 'string') {
                titleElement.html(isAnime 
                    ? `<span style="font-family: 'Anime Ace', sans-serif; color: #ff6b6b;">${content}</span>`
                    : content);
            } else {
                titleElement.html(content);
            }
        }

        /**
         * Показывает русское название под заголовком
         */
        async function showRussianTitle(render, movie) {
            try {
                const title = await fetchRussianTitle(movie);
                if (title && render?.find) {
                    const rateLine = render.find(".full-start-new__rate-line").first();
                    if (rateLine?.length) {
                        rateLine.before(`
                            <div class="ru-title-full" style="color: #ffffff; font-weight: 500; text-align: right; margin-bottom: 0.4em; opacity: 0.80; max-width: 15em;text-shadow: 1px 1px 0px #00000059;">
                                RU: ${title}
                            </div>
                        `);
                    }
                }
            } catch (error) {
                console.error("Ошибка при отображении русского названия:", error);
            }
        }

        /**
         * Проверяет, является ли контент аниме
         */
        function checkIsAnime(movie, originalTitle) {
            return movie.genres?.some(g => g.name.toLowerCase().includes("аниме")) || 
                   /аниме|anime/i.test(originalTitle);
        }

        // Обработчик для полной страницы карточки
        Lampa.Listener.follow("full", async function(event) {
            if (event.type !== "complite") return;
            
            try {
                // Отменяем предыдущий запрос, если он еще выполняется
                if (currentRequest) {
                    currentRequest.abort();
                    currentRequest = null;
                }
                
                const movie = event.data?.movie;
                if (!movie) return;
                
                const render = event.object?.activity?.render();
                if (!render?.find) return;
                
                const titleElement = render.find(".full-start-new__title").first();
                if (!titleElement?.length) return;
                
                // Очищаем предыдущий контент
                titleElement.empty();
                render.find('.ru-title-full').remove();
                
                const originalTitle = movie.title || movie.name;
                if (!originalTitle) return;
                
                const isAnime = checkIsAnime(movie, originalTitle);
                const logoSetting = Lampa.Storage.get("logo_glav") || "show_all";
                const russianTitleSetting = Lampa.Storage.get("russian_titles_settings") || "show_when_no_ru_logo";
                
                if (logoSetting === "hide") {
                    updateTitleElement(titleElement, originalTitle, isAnime);
                    if (russianTitleSetting === "show_always") {
                        await showRussianTitle(render, movie);
                    }
                    return;
                }
                
                const controller = new AbortController();
                currentRequest = controller;
                
                const logos = await fetchLogos(movie);
                const logo = getBestLogo(logos, logoSetting);
                
                if (logo?.file_path) {
                    const imageUrl = Lampa.TMDB.image("/t/p/w500" + logo.file_path);
                    updateTitleElement(titleElement, 
                        `<img loading="lazy" style="margin-top: 0.2em; margin-bottom: 0.1em; max-width: 9em; max-height: 4em; filter: drop-shadow(0 0 0.6px rgba(255, 255, 255, 0.4));" src="${imageUrl}" />`, 
                        false);
                    
                    if (russianTitleSetting === "show_always" || 
                        (russianTitleSetting === "show_when_no_ru_logo" && logo.iso_639_1 !== "ru")) {
                        await showRussianTitle(render, movie);
                    }
                } else {
                    updateTitleElement(titleElement, originalTitle, isAnime);
                    if (russianTitleSetting === "show_always") {
                        await showRussianTitle(render, movie);
                    }
                }
                
                currentRequest = null;
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error("Ошибка в обработчике full:", error);
                }
            }
        });

        // Добавляем CSS стили
        const style = document.createElement('style');
        style.textContent = `
            .ru-title-full {
                transition: opacity 0.3s ease;
            }
            .ru-title-full:hover {
                opacity: 1 !important;
            }
            .full-start-new__title img {
                object-fit: contain;
            }
        `;
        document.head.appendChild(style);
    }
}();