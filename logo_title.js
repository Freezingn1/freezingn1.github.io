!function() {
    "use strict";
    
    Lampa.SettingsApi.addComponent({
        component: 'logo_nazvanie',
        name: Lampa.Lang.translate('Интерфейс карточек'),
        icon: `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
        `
        });

    // Настройки логотипов
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

    // Настройки русских названий
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

    if (!window.logoplugin) {
        window.logoplugin = true;

        const TMDB_API_KEY = "4ef0d7355d9ffb5151e987764708ce96";
        const TMDB_API_URL = "https://api.themoviedb.org/3"; // Исправлено: реальный URL API
        const titleCache = new Map();

        // Функция для выбора лучшего логотипа
        function getBestLogo(logos, setting) {
            if (!logos || !logos.length) return null;

            let filteredLogos = [...logos];
            
            if (setting === "ru_only") {
                filteredLogos = filteredLogos.filter(l => l.iso_639_1 === 'ru');
            }

            if (!filteredLogos.length) return null;

            // Сортируем: русские -> английские -> другие, затем по рейтингу
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

        // Получение русского названия
        async function fetchRussianTitle(card) {
            try {
                if (titleCache.has(card.id)) return titleCache.get(card.id);

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

        // Обработка полной страницы
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

                // Удаляем предыдущие русские названия
                render.find('.ru-title-full').remove();

                // Режим "Скрыть логотипы" - показываем только оригинальное название
                if (logoSetting === "hide") {
                    showTextTitle();
                    if (russianTitleSetting === "show_always") {
                        showRussianTitle();
                    }
                    return;
                }

                // Очищаем заголовок перед загрузкой
                titleElement.empty();

                // Загружаем все логотипы
                const tmdbUrl = Lampa.TMDB.api(movie.name ? "tv" : "movie") + `/${movie.id}/images?api_key=${Lampa.TMDB.key()}`;

                $.get(tmdbUrl, function(data) {
                    const logos = data.logos || [];
                    const logo = getBestLogo(logos, logoSetting);

                    if (logo?.file_path) {
                        // Показываем логотип
                        const imageUrl = Lampa.TMDB.image("/t/p/w500" + logo.file_path);
                        titleElement.html(`<img style="margin-top: 0.2em; margin-bottom: 0.1em; max-width: 9em; max-height: 4em;" src="${imageUrl}" />`);
                        
                        // Показываем русское название в зависимости от настроек
                        if (russianTitleSetting === "show_always" || 
                            (russianTitleSetting === "show_when_no_ru_logo" && logo.iso_639_1 !== "ru")) {
                            showRussianTitle();
                        }
                    } else {
                        // Если логотипов нет вообще
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

        // Добавляем стили
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
}();