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
        const TMDB_API_URL = "https://api.themoviedb.org/3";
        const titleCache = new Map();
        const logoCache = new Map();

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

        // Получение логотипов
        async function fetchLogos(card) {
            try {
                if (logoCache.has(card.id)) return logoCache.get(card.id);

                const mediaType = card.first_air_date ? 'tv' : 'movie';
                const url = `${TMDB_API_URL}/${mediaType}/${card.id}/images?api_key=${TMDB_API_KEY}`;

                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                const logos = data.logos || [];

                if (logos.length) {
                    logoCache.set(card.id, logos);
                    return logos;
                }
            } catch (error) {
                console.error("Ошибка при получении логотипов:", error);
            }
            return [];
        }

        // Обработка полной страницы
        Lampa.Listener.follow("full", async function(event) {
            if (event.type !== "complite") return;
            if (!event.object || !event.object.activity || !event.object.activity.render) return;
            
            try {
                const movie = event.data.movie;
                if (!movie) return;
                
                const render = event.object.activity.render();
                if (!render || !render.find) return;
                
                // Ищем заголовок по разным возможным селекторам
                let titleElement = render.find(".full-start__title, .full-start-new__title");
                if (!titleElement || !titleElement.length) {
                    titleElement = render.find(".full__title");
                }
                if (!titleElement || !titleElement.length) return;
                
                const originalTitle = movie.title || movie.name;
                if (!originalTitle) return;
                
                const isAnime = movie.genres?.some(g => g.name.toLowerCase().includes("аниме")) 
                                || /аниме|anime/i.test(originalTitle);
                const logoSetting = Lampa.Storage.get("logo_glav", "interface") || "show_all";
                const russianTitleSetting = Lampa.Storage.get("russian_titles_settings", "interface") || "show_when_no_ru_logo";

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

                // Загружаем логотипы
                const logos = await fetchLogos(movie);
                const logo = getBestLogo(logos, logoSetting);

                if (logo?.file_path) {
                    // Показываем логотип
                    const imageUrl = Lampa.TMDB.image("/t/p/w500" + logo.file_path);
                    const img = new Image();
                    img.src = imageUrl;
                    img.style = "max-height: 4em; max-width: 100%; object-fit: contain; margin: 0.5em 0;";
                    img.onload = function() {
                        titleElement.empty().append(img);
                        
                        // Показываем русское название в зависимости от настроек
                        if (russianTitleSetting === "show_always" || 
                            (russianTitleSetting === "show_when_no_ru_logo" && logo.iso_639_1 !== "ru")) {
                            showRussianTitle();
                        }
                    };
                    img.onerror = function() {
                        console.error("Не удалось загрузить логотип:", imageUrl);
                        showTextTitle();
                        if (russianTitleSetting === "show_always") {
                            showRussianTitle();
                        }
                    };
                } else {
                    // Если логотипов нет вообще
                    showTextTitle();
                    if (russianTitleSetting === "show_always") {
                        showRussianTitle();
                    }
                }

                function showRussianTitle() {
                    fetchRussianTitle(movie).then(title => {
                        if (title && render && render.find) {
                            // Ищем место для вставки русского названия
                            let rateLine = render.find(".full-start__rate-line, .full-start-new__rate-line").first();
                            if (!rateLine || !rateLine.length) {
                                rateLine = render.find(".full__subtitle").first();
                            }
                            if (rateLine && rateLine.length) {
                                rateLine.before(`
                                    <div class="ru-title-full" style="color: #ffffff; font-weight: 500; margin-bottom: 10px; opacity: 0.80; max-width: 100%; text-shadow: 1px 1px 0px #00000059;">
                                        ${title}
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
                // В случае ошибки показываем обычное название
                const titleElement = event.object.activity.render().find(".full-start__title, .full-start-new__title, .full__title");
                if (titleElement && titleElement.length) {
                    const originalTitle = event.data.movie.title || event.data.movie.name;
                    titleElement.text(originalTitle);
                }
            }
        });

        // Добавляем стили
        const style = document.createElement('style');
        style.textContent = `
            .ru-title-full {
                transition: opacity 0.3s ease;
                font-size: 1.1em;
            }
            .ru-title-full:hover {
                opacity: 1 !important;
            }
            .full-start__title img,
            .full-start-new__title img,
            .full__title img {
                max-height: 4em !important;
                max-width: 100% !important;
                object-fit: contain !important;
                margin: 0.5em 0 !important;
            }
        `;
        document.head.appendChild(style);
    }
}();