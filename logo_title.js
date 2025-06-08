!function() {
    "use strict";

    function initPlugin() {
        // Проверяем, что Lampa и её API загружены
        if (!window.Lampa || !Lampa.SettingsApi || !Lampa.Storage || !Lampa.TMDB) {
            console.error("Lampa API не доступен. Плагин не будет инициализирован.");
            return;
        }

        // Проверяем, не был ли уже загружен плагин
        if (window.logoplugin) {
            console.log("Плагин логотипов уже инициализирован.");
            return;
        }
        window.logoplugin = true;

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

        const TMDB_API_KEY = "4ef0d7355d9ffb5151e987764708ce96";
        const titleCache = new Map();

        /**
         * Выбирает лучший логотип в зависимости от настроек
         */
        function getBestLogo(logos, setting) {
            if (!logos || !logos.length) return null;

            let filteredLogos = [...logos];
            
            if (setting === "ru_only") {
                filteredLogos = filteredLogos.filter(l => l.iso_639_1 === 'ru');
            }

            if (!filteredLogos.length) return null;

            return filteredLogos.sort((a, b) => {
                const langPriority = {
                    'ru': 3,
                    'en': 2,
                    'null': 1,
                    'undefined': 0
                };
                
                const aPriority = langPriority[a.iso_639_1] || 0;
                const bPriority = langPriority[b.iso_639_1] || 0;
                
                if (aPriority !== bPriority) return bPriority - aPriority;
                return (b.vote_average || 0) - (a.vote_average || 0);
            })[0];
        }

        /**
         * Получает русское название для карточки
         */
        async function fetchRussianTitle(card) {
            try {
                if (titleCache.has(card.id)) return titleCache.get(card.id);

                const mediaType = card.first_air_date ? 'tv' : 'movie';
                const url = Lampa.TMDB.api(mediaType) + `/${card.id}?language=ru-RU&api_key=${TMDB_API_KEY}`;

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

        // Обработчик для полной страницы карточки
        Lampa.Listener.follow("full", function(event) {
            if (event.type !== "complite") return;
            if (!event.object || !event.object.activity || !event.object.activity.render) return;
            
            try {
                const movie = event.data.movie;
                if (!movie) return;
                
                const render = event.object.activity.render();
                if (!render || !render.find) return;
                
                const titleElement = render.find(".full-start-new__title");
                if (!titleElement || !titleElement.length) return;
                
                const originalTitle = movie.title || movie.name;
                if (!originalTitle) return;
                
                const isAnime = movie.genres?.some(g => g.name.toLowerCase().includes("аниме")) 
                                || /аниме|anime/i.test(originalTitle);
                const logoSetting = Lampa.Storage.get("logo_glav") || "show_all";
                const russianTitleSetting = Lampa.Storage.get("russian_titles_settings") || "show_when_no_ru_logo";

                render.find('.ru-title-full').remove();

                if (logoSetting === "hide") {
                    showTextTitle();
                    if (russianTitleSetting === "show_always") {
                        showRussianTitle();
                    }
                    return;
                }

                titleElement.empty();

                const tmdbUrl = Lampa.TMDB.api(movie.name ? "tv" : "movie") + `/${movie.id}/images?api_key=${Lampa.TMDB.key()}`;

                $.get(tmdbUrl, function(data) {
                    const logos = data.logos || [];
                    const logo = getBestLogo(logos, logoSetting);

                    if (logo?.file_path) {
                        const imageUrl = Lampa.TMDB.image("/t/p/w500" + logo.file_path);
                        titleElement.html(`<img style="margin-top: 0.2em; margin-bottom: 0.1em; max-width: 9em; max-height: 4em; filter: drop-shadow(0 0 0.6px rgba(255, 255, 255, 0.4));" src="${imageUrl}" />`);
                        
                        if (russianTitleSetting === "show_always" || 
                            (russianTitleSetting === "show_when_no_ru_logo" && logo.iso_639_1 !== "ru")) {
                            showRussianTitle();
                        }
                    } else {
                        showTextTitle();
                        if (russianTitleSetting === "show_always") {
                            showRussianTitle();
                        }
                    }
                }).fail(() => {
                    console.error("Ошибка загрузки логотипов из TMDB");
                    showTextTitle();
                });

                function showRussianTitle() {
                    fetchRussianTitle(movie).then(title => {
                        if (title && render && render.find) {
                            const rateLine = render.find(".full-start-new__rate-line").first();
                            if (rateLine && rateLine.length) {
                                rateLine.before(`
                                    <div class="ru-title-full" style="color: #ffffff; font-weight: 500; text-align: right; margin-bottom: 0.4em; opacity: 0.80; max-width: 15em;text-shadow: 1px 1px 0px #00000059;">
                                        RU: ${title}
                                    </div>
                                `);
                            }
                        }
                    });
                }

                function showTextTitle() {
                    if (isAnime) {
                        titleElement.html(`<span style="font-family: 'Anime Ace', sans-serif; color: #ff6b6b;">${originalTitle}</span>`);
                    } else {
                        titleElement.text(originalTitle);
                    }
                }
            } catch (error) {
                console.error("Ошибка в обработчике full:", error);
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
        `;
        document.head.appendChild(style);
    }

    // Ждем полной загрузки страницы и готовности Lampa
    function checkLampaLoaded() {
        if (window.Lampa && Lampa.SettingsApi) {
            initPlugin();
        } else {
            setTimeout(checkLampaLoaded, 100);
        }
    }

    if (document.readyState === "complete") {
        checkLampaLoaded();
    } else {
        document.addEventListener("DOMContentLoaded", checkLampaLoaded);
        window.addEventListener("load", checkLampaLoaded);
    }
}();