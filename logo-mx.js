!function() {
    "use strict";

    // Настройки плагина
    Lampa.SettingsApi.addParam({
        component: "interface",
        param: {
            name: "logo_settings",
            type: "select",
            values: { 
                "show_all": "Все логотипы", 
                "ru_only": "Только русские", 
                "hide": "Скрыть логотипы"
            },
            default: "show_all"
        },
        field: {
            name: "Отображение логотипов",
            description: "Управление показом логотипов вместо текстовых названий"
        }
    });

    Lampa.SettingsApi.addParam({
        component: "interface",
        param: {
            name: "russian_title_settings",
            type: "select",
            values: {
                "show_when_no_ru_logo": "Показывать, если нет русского логотипа",
                "show_never": "Никогда не показывать",
                "show_always": "Показывать всегда"
            },
            default: "show_when_no_ru_logo"
        },
        field: {
            name: "Отображение русских названий",
            description: "Управление показом русских названий"
        }
    });

    if (!window.logoPlugin) {
        window.logoPlugin = true;

        const TMDB_API_KEY = "4ef0d7355d9ffb5151e987764708ce96";
        const titleCache = new Map();
        const logoCache = new Map();

        // Получаем тип контента (movie/tv) по объекту карточки
        function getMediaType(card) {
            return card.first_air_date ? 'tv' : 'movie';
        }

        // Получаем русское название
        async function fetchRussianTitle(card) {
            try {
                if (titleCache.has(card.id)) return titleCache.get(card.id);

                const response = await fetch(`https://api.themoviedb.org/3/${getMediaType(card)}/${card.id}?language=ru-RU&api_key=${TMDB_API_KEY}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                const title = data.title || data.name;

                if (title) {
                    titleCache.set(card.id, title);
                    return title;
                }
            } catch (error) {
                console.error("Ошибка получения русского названия:", error);
            }
            return null;
        }

        // Получаем логотипы
        async function fetchLogos(card) {
            try {
                if (logoCache.has(card.id)) return logoCache.get(card.id);

                const response = await fetch(`https://api.themoviedb.org/3/${getMediaType(card)}/${card.id}/images?api_key=${TMDB_API_KEY}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                const logos = data.logos || [];

                if (logos.length) {
                    logoCache.set(card.id, logos);
                    return logos;
                }
            } catch (error) {
                console.error("Ошибка получения логотипов:", error);
            }
            return [];
        }

        // Выбираем лучший логотип согласно настройкам
        function selectBestLogo(logos, setting) {
            if (!logos || !logos.length) return null;

            let filtered = [...logos];
            
            if (setting === "ru_only") {
                filtered = filtered.filter(l => l.iso_639_1 === 'ru');
                if (!filtered.length) return null;
            }

            return filtered.sort((a, b) => {
                // Приоритет: русские > английские > другие
                const aLang = a.iso_639_1 === 'ru' ? 2 : a.iso_639_1 === 'en' ? 1 : 0;
                const bLang = b.iso_639_1 === 'ru' ? 2 : b.iso_639_1 === 'en' ? 1 : 0;
                
                if (aLang !== bLang) return bLang - aLang;
                return (b.vote_average || 0) - (a.vote_average || 0);
            })[0];
        }

        // Обработчик для страницы контента
        Lampa.Listener.follow("full", async (event) => {
            if (event.type !== "complite") return;
            
            const movie = event.data.movie;
            if (!movie) return;

            const render = event.object.activity.render();
            if (!render || !render.find) return;

            // Ищем заголовок по всем возможным селекторам
            const titleSelectors = [
                ".full-start-new__title", 
                ".full-start__title",
                ".full__title",
                ".full-start__head h1",
                ".full-start-new__head h1"
            ];
            
            let titleElement = null;
            for (const selector of titleSelectors) {
                titleElement = render.find(selector);
                if (titleElement && titleElement.length) break;
            }
            
            if (!titleElement || !titleElement.length) return;

            const originalTitle = movie.title || movie.name;
            const logoSetting = Lampa.Storage.get("logo_settings", "interface") || "show_all";
            const titleSetting = Lampa.Storage.get("russian_title_settings", "interface") || "show_when_no_ru_logo";

            // Удаляем предыдущие русские названия
            render.find(".ru-title").remove();

            // Если логотипы скрыты в настройках
            if (logoSetting === "hide") {
                titleElement.text(originalTitle);
                if (titleSetting === "show_always") {
                    const ruTitle = await fetchRussianTitle(movie);
                    if (ruTitle) insertRussianTitle(render, ruTitle);
                }
                return;
            }

            // Получаем логотипы
            const logos = await fetchLogos(movie);
            const logo = selectBestLogo(logos, logoSetting);

            if (logo?.file_path) {
                const imageUrl = Lampa.TMDB.image(`/t/p/w500${logo.file_path}`);
                
                // Создаем элемент изображения
                const img = document.createElement('img');
                img.src = imageUrl;
                img.style = "max-height: 4em; max-width: 100%; object-fit: contain; margin: 0.5em 0;";
                
                img.onload = () => {
                    titleElement.empty().append(img);
                    
                    // Показываем русское название по условиям
                    if (titleSetting === "show_always" || 
                       (titleSetting === "show_when_no_ru_logo" && logo.iso_639_1 !== 'ru')) {
                        fetchRussianTitle(movie).then(ruTitle => {
                            if (ruTitle) insertRussianTitle(render, ruTitle);
                        });
                    }
                };
                
                img.onerror = () => {
                    console.error("Не удалось загрузить логотип:", imageUrl);
                    titleElement.text(originalTitle);
                };
            } else {
                titleElement.text(originalTitle);
                if (titleSetting === "show_always") {
                    const ruTitle = await fetchRussianTitle(movie);
                    if (ruTitle) insertRussianTitle(render, ruTitle);
                }
            }
        });

        // Вставляем русское название
        function insertRussianTitle(render, title) {
            const insertPoints = [
                ".full-start-new__rate-line",
                ".full-start__rate-line",
                ".full-start-new__subtitle",
                ".full-start__subtitle",
                ".full__subtitle"
            ];
            
            for (const selector of insertPoints) {
                const point = render.find(selector);
                if (point && point.length) {
                    point.before(`
                        <div class="ru-title" style="
                            color: #ffffff;
                            font-weight: 500;
                            margin-bottom: 10px;
                            opacity: 0.8;
                            max-width: 100%;
                            text-shadow: 1px 1px 2px #000;
                            font-size: 1.1em;
                        ">
                            ${title}
                        </div>
                    `);
                    break;
                }
            }
        }

        // Добавляем стили
        const style = document.createElement('style');
        style.textContent = `
            .ru-title {
                transition: opacity 0.3s ease;
            }
            .ru-title:hover {
                opacity: 1 !important;
            }
        `;
        document.head.appendChild(style);
    }
}();