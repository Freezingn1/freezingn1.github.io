(function() {
    'use strict';
    
    function startPlugin() {
        window.logoplugin = true;
        const titleCache = new Map();

        // Функция для получения лучшего логотипа
        function getBestLogo(logos, setting) {
            if (!logos || !logos.length) return null;
            
            let filteredLogos = [...logos];
            if (setting === "ru_only") {
                filteredLogos = filteredLogos.filter(l => l.iso_639_1 === 'ru');
            }
            
            if (!filteredLogos.length) return null;
            
            return filteredLogos.sort((a, b) => {
                const langPriority = {'ru': 3, 'en': 2, 'null': 1, 'undefined': 0};
                const aPriority = langPriority[a.iso_639_1] || 0;
                const bPriority = langPriority[b.iso_639_1] || 0;
                return bPriority - aPriority || (b.vote_average || 0) - (a.vote_average || 0);
            })[0];
        }

        // Обработка полной страницы
        Lampa.Listener.follow('full', function(e) {
            if (e.type !== 'complite') return;
            
            const movie = e.data.movie;
            if (!movie) return;
            
            const render = e.object.activity.render();
            if (!render || !render.find) return;
            
            const titleElement = render.find('.full-start-new__title');
            if (!titleElement || !titleElement.length) return;
            
            const logoSetting = Lampa.Storage.get('logo_glav') || 'show_all';
            const russianTitleSetting = Lampa.Storage.get('russian_titles_settings') || 'show_when_no_ru_logo';
            
            // Удаляем предыдущие русские названия
            render.find('.ru-title-full').remove();
            
            // Если логотипы скрыты
            if (logoSetting === 'hide') {
                titleElement.text(movie.title || movie.name);
                if (russianTitleSetting === 'show_always') showRussianTitle();
                return;
            }
            
            // Загружаем логотипы
            const type = movie.name ? 'tv' : 'movie';
            const url = Lampa.TMDB.api(type + '/' + movie.id + '/images?api_key=' + Lampa.TMDB.key());
            
            $.get(url, function(data) {
                const logo = getBestLogo(data.logos, logoSetting);
                
                if (logo?.file_path) {
                    const imageUrl = Lampa.TMDB.image('/t/p/w500' + logo.file_path);
                    titleElement.html(`<img style="margin-top:0.2em;max-height:4em;" src="${imageUrl}"/>`);
                    
                    if (russianTitleSetting === 'show_always' || 
                        (russianTitleSetting === 'show_when_no_ru_logo' && logo.iso_639_1 !== 'ru')) {
                        showRussianTitle();
                    }
                } else {
                    titleElement.text(movie.title || movie.name);
                    if (russianTitleSetting === 'show_always') showRussianTitle();
                }
            }).fail(() => {
                titleElement.text(movie.title || movie.name);
            });
            
            function showRussianTitle() {
                const originalTitle = movie.title || movie.name;
                if (titleCache.has(movie.id)) {
                    addRussianTitle(titleCache.get(movie.id));
                    return;
                }
                
                const langUrl = Lampa.TMDB.api(type) + `/${movie.id}?language=ru-RU&api_key=${Lampa.TMDB.key()}`;
                $.get(langUrl, function(data) {
                    const ruTitle = data.title || data.name;
                    if (ruTitle && ruTitle !== originalTitle) {
                        titleCache.set(movie.id, ruTitle);
                        addRussianTitle(ruTitle);
                    }
                });
            }
            
            function addRussianTitle(title) {
                const rateLine = render.find('.full-start-new__rate-line').first();
                if (rateLine && rateLine.length) {
                    rateLine.before(`
                        <div class="ru-title-full" style="color:#fff;font-weight:500;text-align:right;margin-bottom:10px;opacity:0.8;max-width:15em;text-shadow:1px 1px 0 #00000059;">
                            RU: ${title}
                        </div>
                    `);
                }
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

    // Настройки плагина
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
            name: 'logo_glav',
            type: 'select',
            values: { 
                'show_all': 'Все логотипы', 
                'ru_only': 'Только русские', 
                'hide': 'Скрыть логотипы'
            },
            default: 'show_all'
        },
        field: {
            name: 'Настройки логотипов',
            description: 'Управление отображением логотипов'
        }
    });

    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
            name: 'russian_titles_settings',
            type: 'select',
            values: {
                'show_when_no_ru_logo': 'Показывать, если нет русского логотипа',
                'show_never': 'Никогда не показывать',
                'show_always': 'Показывать всегда'
            },
            default: 'show_when_no_ru_logo'
        },
        field: {
            name: 'Настройки русских названий',
            description: 'Управление отображением русских названий'
        }
    });

    if (!window.logoplugin) startPlugin();
})();