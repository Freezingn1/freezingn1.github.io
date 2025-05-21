!function() {
    "use strict";
    
    // Добавляем компонент в настройки Lampa
    Lampa.SettingsApi.addComponent({
        component: 'logo_nazvanie',
        name: Lampa.Lang.translate('Интерфейс карточек'),
        icon: `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
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
        const titleCache = new Map(); // Кэш для хранения русских названий
        const logoCache = new Map();  // Кэш для хранения логотипов

        /**
         * Выбирает лучший логотип в зависимости от настроек
         * @param {Array} logos - Массив логотипов
         * @param {string} setting - Настройка отображения логотипов
         * @returns {Object|null} Лучший логотип или null
         */
        function getBestLogo(logos, setting) {
            if (!logos || !logos.length) return null;

            let filteredLogos = [...logos];
            
            // Фильтрация по русским логотипам, если выбрана соответствующая настройка
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

        /**
         * Получает русское название для карточки
         * @param {Object} card - Объект карточки фильма/сериала
         * @returns {Promise<string|null>} Русское название или null
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

        /**
         * Загружает логотипы для карточки
         * @param {Object} card - Объект карточки
         * @returns {Promise<Array>} Массив логотипов
         */
        async function fetchLogos(card) {
            try {
                if (logoCache.has(card.id)) return logoCache.get(card.id);

                const mediaType = card.name ? "tv" : "movie";
                const url = Lampa.TMDB.api(mediaType) + `/${card.id}/images?api_key=${Lampa.TMDB.key()}`;
                
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const data = await response.json();
                const logos = data.logos || [];
                
                logoCache.set(card.id, logos);
                return logos;
            } catch (error) {
                console.error("Ошибка при загрузке логотипов:", error);
                return [];
            }
        }

        /**
         * Показывает логотип с плавной анимацией
         * @param {HTMLElement} container - Контейнер для логотипа
         * @param {string} imageUrl - URL изображения логотипа
         * @param {string} altText - Альтернативный текст
         */
        function showLogoWithAnimation(container, imageUrl, altText) {
            // Создаем временный элемент для предзагрузки
            const tempImg = new Image();
            tempImg.src = imageUrl;

            tempImg.onload = () => {
                container.html(`
                    <img class="logo-loading" 
                         src="${imageUrl}" 
                         alt="${altText}"
                         style="margin-top: 0.2em; margin-bottom: 0.1em; 
                                max-width: 9em; max-height: 4em; 
                                filter: drop-shadow(0 0 0.6px rgba(255, 255, 255, 0.4));" />
                `);

                // Плавное появление через 10мс
                setTimeout(() => {
                    container.find('img').removeClass('logo-loading');
                }, 10);
            };

            tempImg.onerror = () => {
                console.error("Не удалось загрузить логотип:", imageUrl);
                container.text(altText); // Fallback на текст
            };
        }

        // Обработчик для полной страницы карточки
        Lampa.Listener.follow("full", async function(event) {
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
                
                // Проверяем, является ли контент аниме
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

                // Загружаем логотипы
                const logos = await fetchLogos(movie);
                const logo = getBestLogo(logos, logoSetting);

                if (logo?.file_path) {
                    // Показываем логотип с анимацией
                    const imageUrl = Lampa.TMDB.image("/t/p/w500" + logo.file_path);
                    showLogoWithAnimation(titleElement, imageUrl, originalTitle);
                    
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

                /**
                 * Показывает русское название под заголовком
                 */
                async function showRussianTitle() {
                    const title = await fetchRussianTitle(movie);
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
                }

                /**
                 * Показывает текстовый заголовок (оригинальное название)
                 */
                function showTextTitle() {
                    if (isAnime) {
                        titleElement.html(`<span style="font-family: 'Anime Ace', sans-serif; color: #ff6b6b;">${originalTitle}</span>`);
                    } else {
                        titleElement.text(originalTitle);
                    }
                }
            } catch (error) {
                console.error("Ошибка в обработчике full:", error);
                showTextTitle();
            }
        });

        // Добавляем CSS стили для плавного появления
        const style = document.createElement('style');
        style.textContent = `
            .logo-loading {
                opacity: 0;
                transition: opacity 0.3s ease;
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