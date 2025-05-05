(function() {
    'use strict';

    // Инициализация платформы (TV)
    Lampa.Platform.tv();

    // Основной класс для отрисовки информации о контенте
    function ContentRenderer() {
        var _this = this;
        var request = new Lampa.Request();
        var cache = {};

        this.init = function() {
            this.container = $('<div class="new-interface"><img class="full-start__background"></div>');
        };

        // Обновление информации о контенте
        this.update = function(item) {
            var container = this.container;
            
            // Установка заголовка
            container.find('.new-interface-info__title').text(item.name || item.title);
            
            // Если включены логотипы вместо названий
            if (Lampa.Storage.get('logos') !== false) {
                var type = item.first_air_date ? 'tv' : 'movie';
                var lang = Lampa.Storage.get('language');
                var url = 'http://tmdbapi.bylampa.online/3/' + type + '/' + item.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=' + lang;
                
                $.get(url, function(data) {
                    if (data.logos && data.logos[0]) {
                        var logoPath = data.logos[0].file_path;
                        if (logoPath !== '') {
                            var logoUrl = 'http://tmdbimg.bylampa.online/t/p/w500' + logoPath.replace('.svg', '.png');
                            if (Lampa.Storage.get('logo_card_style') {
                                container.find('.new-interface-info__title').html('<img style="margin-top:0.3em; margin-bottom:0.1em; max-height:1.8em; max-width:6.8em;" src="' + logoUrl + '" />');
                            } else {
                                container.find('.new-interface-info__title').html('<img style="margin-top:0.3em; margin-bottom:0.1em; max-height:2.8em; max-width:6.8em;" src="' + logoUrl + '" />');
                            }
                        }
                    }
                });
            }

            // Установка описания
            if (Lampa.Storage.get('desc') !== false) {
                container.find('.new-interface-info__description').text(item.overview || Lampa.Lang.translate('Empty'));
            }

            // Загрузка фона
            Lampa.Template.make(Lampa.Api.img(item.backdrop_path, 'w200'));
            
            // Отрисовка дополнительной информации
            this.draw(item);
        };

        // Отрисовка деталей (год, рейтинг, жанры и т.д.)
        this.draw = function(item) {
            var year = ((item.first_air_date || item.release_date || '0000') + '').slice(0, 4);
            var rating = parseFloat((item.vote_average || 0) + '').toFixed(1);
            var genres = Lampa.Api.parseGenres(item).join(', ');
            var countries = Lampa.Api.parseCountries(item);
            
            var headItems = [];
            var detailsItems = [];

            // Год
            if (year !== '0000') headItems.push('<span class="full-start__pg" style="font-size:0.9em;">' + year + '</span>');
            
            // Жанры
            if (genres.length > 0) headItems.push(genres);
            
            // Рейтинг
            if (Lampa.Storage.get('rat') !== false && rating > 0) {
                detailsItems.push('<div class="full-start__rate"><div>' + rating + '</div><div>TMDB</div></div>');
            }
            
            // Страны
            if (Lampa.Storage.get('year_ogr') !== false && countries) {
                detailsItems.push('<span class="full-start__pg" style="font-size:0.9em;">' + countries + '</span>');
            }
            
            // Время фильма
            if (Lampa.Storage.get('vremya') !== false && item.runtime) {
                detailsItems.push(Lampa.Utils.secondsToTime(item.runtime * 60, true));
            }
            
            // Количество сезонов
            if (Lampa.Storage.get('seas') !== false && item.number_of_seasons) {
                detailsItems.push('<span class="full-start__pg" style="font-size:0.9em;">Сезонов ' + item.number_of_seasons + '</span>');
            }
            
            // Количество эпизодов
            if (Lampa.Storage.get('eps') !== false && item.number_of_episodes) {
                detailsItems.push('<span class="full-start__pg" style="font-size:0.9em;">Эпизодов ' + item.number_of_episodes + '</span>');
            }
            
            // Статус
            if (Lampa.Storage.get('status') !== false && item.status) {
                var statusText = '';
                switch (item.status.toLowerCase()) {
                    case 'released': statusText = 'Выпущенный'; break;
                    case 'post production': statusText = 'Пост-продакшн'; break;
                    case 'returning series': statusText = 'Онгоинг'; break;
                    case 'ended': statusText = 'Закончен'; break;
                    case 'canceled': statusText = 'Отменено'; break;
                    case 'planned': statusText = 'Запланировано'; break;
                    case 'in production': statusText = 'В производстве'; break;
                    default: statusText = item.status; break;
                }
                if (statusText) detailsItems.push('<span class="full-start__pg" style="font-size:0.9em;">' + statusText + '</span>');
            }

            // Объединение элементов
            this.container.find('.new-interface-info__head').empty().append(headItems.join(', '));
            this.container.find('.new-interface-info__details').html(detailsItems.join('<span class="new-interface-info__split">•</span>'));
        };

        // Загрузка дополнительных данных
        this.load = function(item) {
            clearTimeout(this.timeout);
            
            var url = Lampa.Utils.url((item.name ? 'tv' : 'movie') + '/' + item.id + 
                     '?api_key=' + Lampa.TMDB.key() + 
                     '&append_to_response=content_ratings,release_dates&language=' + 
                     Lampa.Storage.get('language'));
            
            if (cache[url]) return this.draw(cache[url]);
            
            this.timeout = setTimeout(function() {
                request.clear();
                request.timeout(5000);
                request.url(url, function(data) {
                    cache[url] = data;
                    _this.draw(data);
                });
            }, 300);
        };

        this.render = function() { return this.container; };
        this.clear = function() { this.container.empty(); };
        this.destroy = function() { 
            request.clear(); 
            this.container.remove(); 
            cache = {}; 
            this.container = null; 
        };
    }

    // Основной класс для управления интерфейсом
    function InterfaceManager(params) {
        var _this = this;
        var request = new Lampa.Request();
        var scroll = new Lampa.Scroll({mask: true, over: true, scroll_by_item: true});
        var items = [];
        var container = $('<div class="new-interface-info"></div>');
        var currentIndex = 0;
        var isModern = Lampa.Manifest.version >= 166;
        var renderer, currentItems, isWide;
        
        this.init = function() {};
        
        // Загрузка контента
        this.append = function(item) {
            if (item.ready) return;
            
            item.ready = true;
            var card = new Lampa.Card(item, {
                url: item.url,
                card_small: true,
                cardClass: item.cardClass,
                genres: params.genres,
                object: params,
                card_wide: Lampa.Storage.get('wide_post'),
                nomore: item.nomore
            });
            
            card.init();
            card.onDown = this.down.bind(this);
            card.onUp = this.up.bind(this);
            card.onMore = this.more.bind(this);
            card.onPosition = function() {
                currentIndex = items.indexOf(card);
            };
            
            if (this.onItem) card.onItem = this.onItem.bind(this);
            
            card.onFocus = function(data) {
                renderer.update(data);
                _this.updateBackground(data);
            };
            
            card.onHover = function(data) {
                renderer.update(data);
                _this.updateBackground(data);
            };
            
            card.onBlur = renderer.clear.bind(renderer);
            
            scroll.append(card.render());
            items.push(card);
        };
        
        // Обновление фона
        this.updateBackground = function(item) {
            clearTimeout(this.bgTimeout);
            var bgUrl = Lampa.Api.img(item.backdrop_path, 'w1280');
            
            if (bgUrl === this.currentBg) return;
            
            this.bgTimeout = setTimeout(function() {
                var bg = container.find('.full-start__background');
                bg.removeClass('loaded');
                bg[0].onload = function() { bg.addClass('loaded'); };
                bg[0].onerror = function() { bg.removeClass('loaded'); };
                _this.currentBg = bgUrl;
                setTimeout(function() { bg[0].src = bgUrl; }, 50);
            }, 100);
        };
        
        // Навигация вниз
        this.down = function() {
            currentIndex++;
            currentIndex = Math.min(currentIndex, items.length - 1);
            if (!isWide) currentItems.slice(0, currentIndex + 2).forEach(this.append.bind(this));
            items[currentIndex].toggle();
            scroll.focus(items[currentIndex].render());
        };
        
        // Навигация вверх
        this.up = function() {
            currentIndex--;
            if (currentIndex < 0) {
                currentIndex = 0;
                Lampa.Controller.toggle('head');
            } else {
                items[currentIndex].toggle();
                scroll.focus(items[currentIndex].render());
            }
        };
        
        // Инициализация управления
        this.start = function() {
            Lampa.Controller.add('content', {
                link: this,
                toggle: function() {
                    if (_this.activity.active()) return false;
                    if (items.length) items[currentIndex].toggle();
                },
                left: function() {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function() { Navigator.move('right'); },
                up: function() {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function() {
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                back: this.back
            });
            
            Lampa.Controller.toggle('content');
        };
        
        // Назад
        this.back = function() { Lampa.Backward.backward(); };
        
        // Основная функция отрисовки
        this.render = function(data) {
            currentItems = data;
            isWide = Lampa.Storage.get('card_views_type') == 'view' || 
                    Lampa.Storage.get('navigation_type') == 'cub';
            
            renderer = new ContentRenderer();
            renderer.init();
            
            scroll.append(renderer.render());
            data.slice(0, isWide ? data.length : 2).forEach(this.append.bind(this));
            
            container.append(renderer.render());
            container.append(scroll.render());
            
            if (isModern) {
                Lampa.Layer.append(container);
                Lampa.Layer.visible(scroll.render(true));
                scroll.onDown = this.down.bind(this);
                scroll.onScroll = function(pos) {
                    if (!Lampa.Controller.active(this)) this.start();
                    if (pos > 0) this.down();
                    else {
                        if (currentIndex > 0) this.up();
                    }
                };
            }
            
            this.activity.loader(false);
            this.activity.toggle();
        };
        
        this.destroy = function() {
            request.clear();
            Lampa.Collection.destroy(items);
            scroll.destroy();
            if (renderer) renderer.destroy();
            container.remove();
            items = null;
            renderer = null;
        };
    }

    // Инициализация плагина
    function initPlugin() {
        if (Lampa.manifest.author !== 'bylampa') {
            Lampa.Noty.show('Ошибка доступа');
            return;
        }

        window.plugin_interface_ready = true;
        
        var defaultInterface = Lampa.InteractionMain;
        var newInterface = InterfaceManager;
        
        // Переопределение основного интерфейса
        Lampa.InteractionMain = function(params) {
            if (window.innerWidth < 767) return new defaultInterface(params);
            if (Lampa.Manifest.version < 153) return new defaultInterface(params);
            if (Lampa.Platform.is('mobile')) return new defaultInterface(params);
            if (params.name === 'Избранное') return new defaultInterface(params);
            
            return new newInterface(params);
        };
        
        // Добавление стилей
        if (Lampa.Storage.get('wide_post') === true) {
            Lampa.Template.add('new_interface_style', `
                <style>
                    .new-interface .card--small.card--wide {
                        width: 18.3em;
                    }
                    
                    .new-interface-info {
                        position: relative;
                        padding: 1.5em;
                        height: 26em;
                    }
                    
                    /* ... и другие стили ... */
                </style>
            `);
            
            $('body').append(Lampa.Template.get('new_interface_style', {}, true));
        } else {
            Lampa.Template.add('new_interface_compact', `...компактные стили...`);
            $('body').append(Lampa.Template.get('new_interface_compact', {}, true));
        }
        
        // Добавление настроек
        Lampa.Settings.listener('open', function(e) {
            if (e.name == 'interface') {
                if (Lampa.Settings.main().render().find('[data-component="style_interface"]').length == 0) {
                    Lampa.SettingsApi.add({
                        component: 'style_interface',
                        name: 'Стильный интерфейс'
                    });
                }
                Lampa.Settings.interface().update();
                Lampa.Settings.interface().render().find('[data-component="style_interface"]').addClass('settings-param--active');
            }
        });
        
        // Параметры настроек
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {name: 'new_interface_style', type: 'trigger', default: true},
            field: {name: 'Основные', description: 'Настройки элементов'},
            onRender: function(item) {
                setTimeout(function() {
                    $('.settings-param > div:contains("Стильный интерфейс")').parent().prepend($('.selector'));
                }, 20);
                
                item.on('hover:enter', function() {
                    Lampa.Settings.toggle('new_interface_style');
                    Lampa.Controller.collection().collection.up = function() {
                        Lampa.Settings.create('interface');
                    };
                });
            }
        });
        
        // Другие параметры
        Lampa.SettingsApi.addParam({
            component: 'style_interface',
            param: {name: 'wide_post', type: 'trigger', default: true},
            field: {name: 'Широкие постеры'}
        });
        
        Lampa.SettingsApi.addParam({
            component: 'style_interface',
            param: {name: 'logo_card_style', type: 'trigger', default: true},
            field: {name: 'Логотип вместо названия'}
        });
        
        // ... и другие настройки (rat, vremya, eps и т.д.)
        
        // Первоначальная настройка параметров
        var checkReady = setInterval(function() {
            if (typeof Lampa !== 'undefined') {
                clearInterval(checkReady);
                if (!Lampa.Storage.get('int_plug', 'false')) setupDefaults();
            }
        }, 200);
        
        function setupDefaults() {
            Lampa.Storage.set('int_plug', 'true');
            Lampa.Storage.set('wide_post', 'true');
            Lampa.Storage.set('logos', 'true');
            Lampa.Storage.set('desc', 'true');
            Lampa.Storage.set('status', 'true');
            Lampa.Storage.set('seas', 'false');
            Lampa.Storage.set('eps', 'false');
            Lampa.Storage.set('year_ogr', 'true');
            Lampa.Storage.set('rat', 'true');
        }
    }

    if (!window.plugin_interface_installed) initPlugin();
})();