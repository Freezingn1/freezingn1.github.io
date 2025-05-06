!function() {
    "use strict";

    // Настройки логотипов
    Lampa.SettingsApi.addParam({
        component: "interface",
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
        component: "interface",
        param: {
            name: "russian_titles",
            type: "switch",
            default: true
        },
        field: {
            name: "Показывать русские названия",
            description: "Отображать русские названия когда нет русского логотипа"
        }
    });

    if (!window.logoplugin) {
        window.logoplugin = true;

        const TMDB_API_KEY = "4ef0d7355d9ffb5151e987764708ce96";
        const TMDB_API_URL = "https://api.themoviedb.org/3";
        const titleCache = new Map();

        // Функция для выбора лучшего логотипа по рейтингу с приоритетом русского языка
        function getBestLogo(logos) {
            if (!logos || !logos.length) return null;

            // Сначала фильтруем по настройкам
            const logoSetting = Lampa.Storage.get("logo_glav") || "show_all";
            let filteredLogos = [...logos];
            
            if (logoSetting === "ru_only") {
                filteredLogos = filteredLogos.filter(l => l.iso_639_1 === 'ru');
            }

            if (!filteredLogos.length) return null;

            // Сортируем по приоритету: русские -> английские -> другие, затем по рейтингу
            return filteredLogos.sort((a, b) => {
                // Приоритет языка
                const langPriority = {
                    'ru': 3,
                    'en': 2,
                    'null': 1,
                    'undefined': 0
                };
                
                const aPriority = langPriority[a.iso_639_1] || 0;
                const bPriority = langPriority[b.iso_639_1] || 0;
                
                if (aPriority !== bPriority) {
                    return bPriority - aPriority;
                }
                
                // Если приоритет языка одинаковый, сортируем по рейтингу
                return (b.vote_average || 0) - (a.vote_average || 0);
            })[0];
        }

        // Получение русского названия
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

        // Обработка полной страницы
        Lampa.Listener.follow("full", function(event) {
            if (event.type !== "complite") return;

            const movie = event.data.movie;
            const render = event.object.activity.render();
            const titleElement = render.find(".full-start-new__title");
            const originalTitle = movie.title || movie.name;
            const isAnime = movie.genres?.some(g => g.name.toLowerCase().includes("аниме")) 
                            || /аниме|anime/i.test(originalTitle);
            const showRussianTitles = Lampa.Storage.get("russian_titles") !== false;

            // Удаляем предыдущие русские названия
            render.find('.ru-title-full').remove();

            // Если выбрано "Скрыть логотипы" - сразу показываем текст
            if (Lampa.Storage.get("logo_glav") === "hide") {
                showTextTitle();
                if (showRussianTitles) {
                    fetchRussianTitle(movie).then(title => {
                        if (title) {
                            render.find(".full-start-new__rate-line").first().before(`
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
                return;
            }

            // Очищаем заголовок перед загрузкой
            titleElement.empty();

            // Загружаем все логотипы
            const tmdbUrl = Lampa.TMDB.api(movie.name ? "tv" : "movie") + `/${movie.id}/images?api_key=${Lampa.TMDB.key()}`;

            $.get(tmdbUrl, function(data) {
                const logos = data.logos || [];
                const logo = getBestLogo(logos);

                if (logo?.file_path) {
                    // Показываем логотип
                    const imageUrl = Lampa.TMDB.image("/t/p/w500" + logo.file_path);
                    titleElement.html(`<img style="margin-top: 0.2em; margin-bottom: 0.1em; max-width: 9em; max-height: 4em;" src="${imageUrl}" />`);
                    
                    // Не показываем русское название если есть русский логотип
                    if (logo.iso_639_1 === "ru") {
                        return;
                    }
                } else {
                    showTextTitle();
                }

                // Показываем русское название если включено в настройках
                if (showRussianTitles && !logos.some(l => l.iso_639_1 === 'ru')) {
                    fetchRussianTitle(movie).then(title => {
                        if (title) {
                            render.find(".full-start-new__rate-line").first().before(`
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
            }).fail(() => {
                console.error("Ошибка загрузки логотипов из TMDB");
                showTextTitle();
            });

            function showTextTitle() {
                if (isAnime) {
                    titleElement.html(`<span style="font-family: 'Anime Ace', sans-serif; color: #ff6b6b;">${originalTitle}</span>`);
                } else {
                    titleElement.text(originalTitle);
                }
            }
        });

        // Добавляем стили
        const style = document.createElement('style');
        style.textContent = `
            .ru-title {
                transition: all 0.3s ease;
            }
            .ru-title:hover {
                white-space: normal;
                background: rgba(0,0,0,0.9) !important;
            }
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