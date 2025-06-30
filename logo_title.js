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
        const titleCache = new Map(); // Кэш для хранения русских названий

        /**
         * Выбирает лучший логотип в зависимости от настроек
         * @param {Array} logos - Массив логотипов
         * @param {string} setting - Настройка отображения логотипов
         * @param {boolean} isCardifyUsed - Флаг использования cardify
         * @returns {Object|null} Лучший логотип или null
         */
        function getBestLogo(logos, setting, isCardifyUsed) {
            if (!logos || !logos.length) return null;

            let filteredLogos = [...logos];
            
            // Если cardify не используется И это не мобильное устройство, фильтруем только широкие логотипы
            if (!isCardifyUsed && window.innerWidth > 480) {
                filteredLogos = filteredLogos.filter(logo => {
                    if (!logo.width || !logo.height) return true; // Если размеры неизвестны, оставляем
                    return logo.width / logo.height > 2; // Оставляем только широкие логотипы
                });
            }
            
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
                
                // Проверяем, является ли контент аниме
                const isAnime = movie.genres?.some(g => g.name.toLowerCase().includes("аниме")) 
                                || /аниме|anime/i.test(originalTitle);
                const logoSetting = Lampa.Storage.get("logo_glav") || "show_all";
                const russianTitleSetting = Lampa.Storage.get("russian_titles_settings") || "show_when_no_ru_logo";

                // Проверяем, используется ли cardify.js
                const isCardifyUsed = document.querySelector('.cardify') !== null;
                
                // Применяем стили в зависимости от использования cardify
                if (!isCardifyUsed) {
                    // Скрываем tagline
                    render.find('.full-start-new__tagline').hide();
                    
                    // Применяем стиль для rate-line
                    render.find('.full-start-new__rate-line').css('margin-bottom', '1.2em');
                    
                    // Применяем стиль для title
                    titleElement.css('margin-top', '0.2em');
                }

                // Удаляем предыдущие русские названия
                render.find('.ru-title-full').remove();

                // Режим "Скрыть логотипы" - показываем только оригинальное название
                if (logoSetting === "hide") {
                    showTextTitle();
                    if (russianTitleSetting === "show_always") {
                        showRussianTitle(isCardifyUsed);
                    }
                    return;
                }

                // Очищаем заголовок перед загрузкой
                titleElement.empty();

                // Загружаем все логотипы с TMDB
                const tmdbUrl = Lampa.TMDB.api(movie.name ? "tv" : "movie") + `/${movie.id}/images?api_key=${Lampa.TMDB.key()}`;

                $.get(tmdbUrl, function(data) {
                    const logos = data.logos || [];
                    const logo = getBestLogo(logos, logoSetting, isCardifyUsed);
                    
                    const logoHeight = isCardifyUsed ? '4em' : '1.5em';
                    const logoStyle = `margin-top: 0.2em; margin-bottom: 0.1em; max-width: 9em; max-height: ${logoHeight}; filter: drop-shadow(0 0 0.6px rgba(255, 255, 255, 0.4));`;

                    if (logo?.file_path) {
                        // Показываем логотип
                        const imageUrl = Lampa.TMDB.image("/t/p/w400" + logo.file_path);
                        titleElement.html(`<img style="${logoStyle}" src="${imageUrl}" />`);
                        
                        // Показываем русское название в зависимости от настроек
                        if (russianTitleSetting === "show_always" || 
                            (russianTitleSetting === "show_when_no_ru_logo" && logo.iso_639_1 !== "ru")) {
                            showRussianTitle(isCardifyUsed);
                        }
                    } else {
                        // Если логотипов нет вообще
                        showTextTitle();
                        if (russianTitleSetting === "show_always") {
                            showRussianTitle(isCardifyUsed);
                        }
                    }
                }).fail(() => {
                    console.error("Ошибка загрузки логотипов из TMDB");
                    showTextTitle();
                });

                /**
                 * Показывает русское название под заголовком
                 * @param {boolean} isCardifyUsed - Флаг использования cardify
                 */
                function showRussianTitle(isCardifyUsed) {
                    fetchRussianTitle(movie).then(title => {
                        if (title && render && render.find) {
                            const rateLine = render.find(".full-start-new__rate-line").first();
                            if (rateLine && rateLine.length) {
                                const textAlign = isCardifyUsed ? 'right' : 'left';
                                const maxWidth = isCardifyUsed ? '15em' : '30em';
                                const marginBottom = isCardifyUsed ? '0.4em' : '1em';
                                rateLine.before(`
                                    <div class="ru-title-full" style="color: #ffffff; font-weight: 500; text-align: ${textAlign}; margin-bottom: ${marginBottom}; opacity: 0.80; max-width: ${maxWidth}; text-shadow: 1px 1px 0px #00000059;">
                                        RU: ${title}
                                    </div>
                                `);
                            }
                        }
                    });
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
            }
        });

        // Добавляем CSS стили для плавного появления русских названий
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

        // Обработчик изменения размера окна
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // Принудительно обновляем отображение карточек при изменении размера
                Lampa.Listener.send('full', {type: 'update'});
            }, 200);
        });
    }
}();