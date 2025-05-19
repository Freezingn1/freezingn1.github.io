!function() {
    "use strict";
    
    // Добавляем компонент в настройки Lampa
    Lampa.SettingsApi.addComponent({
        component: 'logo_nazvanie',
        name: Lampa.Lang.translate('Отображение логотипов'),
        icon: `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
        `
    });

    // Настройка выбора версии логотипов
    Lampa.SettingsApi.addParam({
        component: "logo_nazvanie",
        param: {
            name: "logo_version",
            type: "select",
            values: { 
                "uncensored": "Lampa Uncensored (рекомендуется)", 
                "lampa": "Lampa (оригинальный)"
            },
            default: "uncensored"
        },
        field: {
            name: "Режим отображения",
            description: "Выберите стиль показа логотипов"
        }
    });

    // Настройки отображения логотипов (для режима Uncensored)
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
            name: "Настройки логотипов",
            description: "Управление отображением логотипов (только для Uncensored)"
        }
    });

    // Настройки русских названий (для режима Uncensored)
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
            description: "Управление отображением русских названий (только для Uncensored)"
        }
    });

    if (!window.logoplugin) {
        window.logoplugin = true;

        const TMDB_API_KEY = "4ef0d7355d9ffb5151e987764708ce96";
        const titleCache = new Map();

        /**
         * Выбирает лучший логотип (для режима Uncensored)
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
         * Получает русское название (для режима Uncensored)
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
         * Оригинальный метод отображения логотипов (режим Lampa)
         */
        function showOriginalLogo(event) {
            const movie = event.data.movie;
            if (!movie) return;

            const type = movie.name ? 'tv' : 'movie';
            const url = Lampa.TMDB.api(type+'/'+movie.id+'/images?api_key='+Lampa.TMDB.key()+'&language='+Lampa.Storage.get('language'));
            
            $.get(url, function(data) {
                if(data.logos?.[0]?.file_path) {
                    const logo = data.logos[0].file_path;
                    const render = event.object.activity.render();
                    render.find('.full-start-new__title').html(
                        `<img style="margin-top:5px;max-height:125px;" 
                         src="${Lampa.TMDB.image('/t/p/w300'+logo.replace('.svg','.png'))}"/>`
                    );
                }
            });
        }

        /**
         * Улучшенный метод отображения логотипов (режим Uncensored)
         */
        function showUncensoredLogo(event) {
            const movie = event.data.movie;
            if (!movie || !event.object?.activity?.render) return;
            
            const render = event.object.activity.render();
            const titleElement = render.find(".full-start-new__title");
            if (!titleElement.length) return;

            const originalTitle = movie.title || movie.name;
            const isAnime = movie.genres?.some(g => g.name.toLowerCase().includes("аниме")) || /аниме|anime/i.test(originalTitle);
            const logoSetting = Lampa.Storage.get("logo_glav") || "show_all";
            const russianTitleSetting = Lampa.Storage.get("russian_titles_settings") || "show_when_no_ru_logo";

            // Удаляем предыдущие русские названия
            render.find('.ru-title-full').remove();

            // Режим "Скрыть логотипы"
            if (logoSetting === "hide") {
                showTextTitle();
                if (russianTitleSetting === "show_always") {
                    showRussianTitle();
                }
                return;
            }

            // Очищаем заголовок перед загрузкой
            titleElement.empty();

            // Загружаем логотипы с TMDB
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

                function showRussianTitle() {
                    fetchRussianTitle(movie).then(title => {
                        if (title) {
                            const rateLine = render.find(".full-start-new__rate-line").first();
                            if (rateLine.length) {
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
            }).fail(() => {
                console.error("Ошибка загрузки логотипов из TMDB");
                showTextTitle();
            });
        }

        // Основной обработчик
        Lampa.Listener.follow("full", function(event) {
            if (event.type !== "complite") return;
            
            const logoVersion = Lampa.Storage.get("logo_version") || "uncensored";
            
            if (logoVersion === "lampa") {
                showOriginalLogo(event);
            } else {
                showUncensoredLogo(event);
            }
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
