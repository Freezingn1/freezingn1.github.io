!function() {
    "use strict";

    // Настройки плагина
    Lampa.SettingsApi.addParam({
        component: "interface",
        param: {
            name: "logo_priority",
            type: "select",
            values: { 
                "all": "Все логотипы (русские в приоритете)", 
                "ru_only": "Только русские логотипы", 
                "hide": "Скрыть логотипы"
            },
            default: "all"
        },
        field: {
            name: "Настройки отображения логотипов",
            description: "Управление показом логотипов и названий"
        }
    });

    if (!window.logoAndTitlePlugin) {
        window.logoAndTitlePlugin = true;

        const TMDB_API_KEY = "4ef0d7355d9ffb5151e987764708ce96";
        const TMDB_API_URL = "https://api.themoviedb.org/3";
        const titleCache = new Map();

        // Получение русского названия
        async function getRussianTitle(movie) {
            try {
                if (titleCache.has(movie.id)) return titleCache.get(movie.id);
                
                const type = movie.first_air_date ? 'tv' : 'movie';
                const response = await fetch(`${TMDB_API_URL}/${type}/${movie.id}?language=ru-RU&api_key=${TMDB_API_KEY}`);
                if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                
                const data = await response.json();
                const title = data.title || data.name;
                if (title) titleCache.set(movie.id, title);
                return title;
            } catch (e) {
                console.error("Ошибка получения русского названия:", e);
                return null;
            }
        }

        // Обработка главной страницы
        Lampa.Listener.follow("full", function(e) {
            if (e.type !== "complite") return;

            const movie = e.data.movie;
            const render = e.object.activity.render();
            const titleElement = render.find(".full-start-new__title");
            const originalTitle = movie.title || movie.name;
            const setting = Lampa.Storage.get("logo_priority") || "all";

            // Удаляем предыдущие русские названия
            render.find('.ru-title-full').remove();

            // Режим "Скрыть логотипы"
            if (setting === "hide") {
                titleElement.text(originalTitle);
                
                // Показываем русское название
                getRussianTitle(movie).then(title => {
                    if (title && title !== originalTitle) {
                        render.find(".full-start-new__rate-line").before(`
                            <div class="ru-title-full" style="
                                color: #fff;
                                font-weight: 500;
                                text-align: right;
                                margin-bottom: 10px;
                                opacity: 0.8;
                                max-width: 500px;
                            ">RU: ${title}</div>
                        `);
                    }
                });
                return;
            }

            // Загрузка логотипов
            const url = Lampa.TMDB.api(movie.name ? "tv" : "movie") + 
                       `/${movie.id}/images?api_key=${Lampa.TMDB.key()}&include_image_language=ru,en,null`;

            $.get(url, function(data) {
                const logos = data.logos || [];
                let selectedLogo = null;

                // Выбор логотипа по настройкам
                if (setting === "ru_only") {
                    selectedLogo = logos.find(l => l.iso_639_1 === "ru");
                } else {
                    // Приоритет русских логотипов
                    selectedLogo = logos.find(l => l.iso_639_1 === "ru") || 
                                 logos.find(l => l.iso_639_1 === "en") || 
                                 logos[0];
                }

                // Отображение логотипа или оригинального названия
                if (selectedLogo?.file_path) {
                    titleElement.html(`
                        <img style="margin-top: 0.2em; margin-bottom: 0.1em; 
                             max-width: 9em; max-height: 4em;" 
                             src="${Lampa.TMDB.image("/t/p/w500" + selectedLogo.file_path)}" />
                    `);
                } else {
                    titleElement.text(originalTitle);
                }

                // Показываем русское название если нет русского логотипа
                if (setting !== "ru_only" && !logos.some(l => l.iso_639_1 === "ru")) {
                    getRussianTitle(movie).then(title => {
                        if (title && title !== originalTitle) {
                            render.find(".full-start-new__rate-line").before(`
                                <div class="ru-title-full" style="
                                    color: #fff;
                                    font-weight: 500;
                                    text-align: right;
                                    margin-bottom: 10px;
                                    opacity: 0.8;
                                    max-width: 500px;
                                ">RU: ${title}</div>
                            `);
                        }
                    });
                }
            }).fail(() => {
                console.error("Ошибка загрузки логотипов");
                titleElement.text(originalTitle);
            });
        });

        // Стили для русских названий
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