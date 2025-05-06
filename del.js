(function() {
    'use strict';

    // Ожидаем полной загрузки Lampa
    function initPlugin() {
        if (typeof Lampa === 'undefined' || !Lampa.Storage || !Lampa.Template) {
            setTimeout(initPlugin, 100);
            return;
        }

        // Основной класс для отрисовки контента
        function ContentRenderer() {
            var self = this;
            this.request = new Lampa.Request();
            this.cache = {};
            this.timeout = null;
            this.container = null;

            this.init = function() {
                this.container = $('<div class="new-interface"><img class="full-start__background"></div>');
                this.container.append(`
                    <div class="new-interface-info">
                        <div class="new-interface-info__body">
                            <div class="new-interface-info__head"></div>
                            <div class="new-interface-info__title"></div>
                            <div class="new-interface-info__details"></div>
                            <div class="new-interface-info__description"></div>
                        </div>
                    </div>
                `);
            };

            this.update = function(item) {
                if (!item || !this.container) return;

                var title = item.name || item.title || '';
                this.container.find('.new-interface-info__title').text(title);

                // Логотипы
                if (Lampa.Storage.get('logos') !== false) {
                    this.loadLogo(item);
                }

                // Описание
                if (Lampa.Storage.get('desc') !== false) {
                    var overview = item.overview || Lampa.Lang.translate('Empty');
                    this.container.find('.new-interface-info__description').text(overview);
                }

                // Фон
                if (item.backdrop_path) {
                    this.container.find('.full-start__background').attr(
                        'src', 
                        Lampa.Api.img(item.backdrop_path, 'w1280')
                    );
                }

                this.load(item);
            };

            this.loadLogo = function(item) {
                var type = item.first_air_date ? 'tv' : 'movie';
                var languages = ['ru', 'en', '']; // Приоритет языков: русский -> английский -> любой
                var currentLang = 0;
                
                var tryLoadLogo = function() {
                    if (currentLang >= languages.length) {
                        // Все языки перебраны, логотип не найден
                        return;
                    }
                    
                    var langParam = languages[currentLang] ? '&language=' + languages[currentLang] : '';
                    var url = `http://tmdbapi.bylampa.online/3/${type}/${item.id}/images?api_key=${Lampa.TMDB.key()}${langParam}`;
                    
                    $.get(url, function(data) {
                        if (data.logos && data.logos[0] && data.logos[0].file_path) {
                            var logoUrl = 'http://tmdbimg.bylampa.online/t/p/w500' + 
                                        data.logos[0].file_path.replace('.svg', '.png');
                            var imgStyle = Lampa.Storage.get('logo_card_style') ? 
                                'max-height:1.8em; max-width:6.8em;' : 
                                'max-height:2.8em; max-width:6.8em;';
                            
                            self.container.find('.new-interface-info__title').html(`
                                <img style="margin-top:0.3em; margin-bottom:0.1em; ${imgStyle}" 
                                     src="${logoUrl}" />
                            `);
                        } else {
                            // Пробуем следующий язык
                            currentLang++;
                            tryLoadLogo();
                        }
                    }).fail(function() {
                        // При ошибке пробуем следующий язык
                        currentLang++;
                        tryLoadLogo();
                    });
                };
                
                // Начинаем попытки загрузки
                tryLoadLogo();
            };

            this.draw = function(item) {
                if (!item) return;

                var year = (item.first_air_date || item.release_date || '0000').slice(0, 4);
                var rating = parseFloat(item.vote_average || 0).toFixed(1);
                var genres = Lampa.Api.parseGenres(item).join(', ');
                var details = [];

                // Год
                if (year !== '0000') {
                    details.push(`<span class="full-start__pg">${year}</span>`);
                }

                // Жанры
                if (genres && Lampa.Storage.get('genres') !== false) {
                    details.push(genres);
                }

                // Рейтинг
                if (rating > 0 && Lampa.Storage.get('rat') !== false) {
                    details.push(`
                        <div class="full-start__rate">
                            <div>${rating}</div>
                            <div>TMDB</div>
                        </div>
                    `);
                }

                this.container.find('.new-interface-info__details').html(details.join(' '));
            };

            this.destroy = function() {
                clearTimeout(this.timeout);
                if (this.request) this.request.clear();
                if (this.container) this.container.remove();
            };
        }

        // Регистрируем плагин
        Lampa.Plugin.register('style_interface', {
            name: 'Стильный интерфейс',
            author: 'bylampa',
            version: '1.0',
            
            init: function() {
                // Добавляем CSS стили
                Lampa.Template.add('style_interface_css', `
                    <style>
                        .new-interface {
                            position: relative;
                            width: 100%;
                            height: 100%;
                        }
                        .new-interface-info {
                            position: absolute;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            padding: 2em;
                            color: white;
                            background: linear-gradient(transparent, rgba(0,0,0,0.7));
                        }
                        .new-interface-info__title {
                            font-size: 4em;
                            font-weight: 600;
                            margin-bottom: 0.2em;
                        }
                        .new-interface-info__details {
                            margin-bottom: 1.6em;
                            display: flex;
                            flex-wrap: wrap;
                            align-items: center;
                            font-size: 1.3em;
                        }
                        .new-interface-info__description {
                            font-size: 1.4em;
                            font-weight: 310;
                            line-height: 1.3;
                            width: 70%;
                        }
                        /* Дополнительные стили */
                    </style>
                `);

                $('body').append(Lampa.Template.get('style_interface_css'));

                // Переопределяем стандартный интерфейс
                var originalInteraction = Lampa.InteractionMain;
                
                Lampa.InteractionMain = function(params) {
                    if (params.name === 'Избранное') {
                        return new originalInteraction(params);
                    }
                    
                    return new (function() {
                        var renderer = new ContentRenderer();
                        renderer.init();
                        
                        this.render = function(items) {
                            if (items && items.length) {
                                renderer.update(items[0]);
                            }
                            return renderer.container;
                        };
                        
                        this.destroy = function() {
                            renderer.destroy();
                        };
                    })();
                };
            }
        });

        // Инициализируем плагин
        Lampa.Plugin.init('style_interface');
    }

    // Запускаем плагин
    if (window.addEventListener) {
        window.addEventListener('DOMContentLoaded', initPlugin);
    } else {
        setTimeout(initPlugin, 1000);
    }
})();