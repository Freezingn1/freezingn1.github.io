(function () {
    'use strict';

    function CreateInfo() {
        var self = this;
        self.html = null;
        self.timer = null;
        self.network = new Lampa.Reguest();
        self.loaded = {};
        self.logoCache = {};
        self.cacheQueue = {};
        self.MAX_CACHE_SIZE = 100;
        self.currentData = null;
        self.lastRequestId = 0;

        self.clearFields = function() {
            if (!self.html) return;
            self.html.find('.new-interface-info__head').empty();
            self.html.find('.new-interface-info__title').empty();
            self.html.find('.new-interface-info__details').empty();
            self.html.find('.new-interface-info__description').empty();
        };

        self.applyTextTitle = function(data) {
            if (!self.html || !data) return;
            var titleElement = self.html.find('.new-interface-info__title');
            if (titleElement.length) {
                titleElement.text(data.title || data.name);
            }
        };

        self.applyLogo = function(data, logo) {
            if (!self.html || !data) return;
            var titleElement = self.html.find('.new-interface-info__title');
            if (!titleElement.length) return;
            
            if (logo?.file_path) {
                var imageUrl = Lampa.TMDB.image("/t/p/w500" + logo.file_path);
                titleElement.html(
                    `<img style="margin-top:0.3em; margin-bottom:0.3em; max-width:7em; max-height:3em;" 
                     src="${imageUrl}" 
                     alt="${data.title || data.name}" />`
                );
            }
        };

        self.findBestLogo = function(images, logoSetting) {
            if (!images?.logos?.length) return null;
            
            var best = { ru: null, en: null, other: null };
            
            images.logos.forEach(function(logo) {
                if (logo.iso_639_1 === 'ru') {
                    if (!best.ru || logo.vote_average > best.ru.vote_average) best.ru = logo;
                }
                else if (logo.iso_639_1 === 'en') {
                    if (!best.en || logo.vote_average > best.en.vote_average) best.en = logo;
                }
                else if (!best.other || logo.vote_average > best.other.vote_average) {
                    best.other = logo;
                }
            });

            var bestLogo = best.ru || best.en || best.other;
            return (logoSetting === 'ru_only' && !best.ru) ? null : bestLogo;
        };

        self.drawBasicInfo = function(data) {
        if (!self.html || !data) return;
        
        var createYear = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
        var head = [];
        
        if (createYear !== '0000') head.push(`<span>${createYear}</span>`);
        
        // Исправленный код для отображения стран
        var countries = [];
        
        // Для фильмов
        if (data.production_countries && data.production_countries.length > 0) {
            countries = data.production_countries.map(function(c) { 
                return c.name || c.iso_3166_1; 
            });
        } 
        // Для TV-шоу
        else if (data.origin_country && data.origin_country.length > 0) {
            countries = data.origin_country;
        }
        
        // Добавляем страны, если они есть
        if (countries.length > 0) {
            head.push(countries.join(', '));
        }
        
        self.html.find('.new-interface-info__head').empty().append(head.join(', '));
    };

        self.drawDetails = function(data) {
            if (!self.html || !data) return;
            
            var vote = parseFloat((data.vote_average || 0) + '').toFixed(1);
            var details = [];
            
            if (vote > 0) details.push(`<div class="full-start__rate"><div>${vote}</div><div>TMDB</div></div>`);
            
            if (data.number_of_episodes > 0) {
                details.push(`<span class="full-start__pg">Эпизодов ${data.number_of_episodes}</span>`);
            }
            
            if (Lampa.Storage.get('new_interface_show_genres') !== false && data.genres?.length) {
                details.push(data.genres.map(function(item) { 
                    return Lampa.Utils.capitalizeFirstLetter(item.name);
                }).join(' | '));
            }
            
            if (data.runtime) details.push(Lampa.Utils.secondsToTime(data.runtime * 60, true));
            
            var pg = Lampa.Api.sources.tmdb.parsePG(data);
            if (pg) details.push(`<span class="full-start__pg" style="font-size:0.9em;">${pg}</span>`);
            
            self.html.find('.new-interface-info__details').html(details.join(
                '<span class="new-interface-info__split">&#9679;</span>'
            ));
            
            if (data.overview) {
                self.html.find('.new-interface-info__description').text(data.overview);
            }
        };

        self.loadFullData = function(data) {
            if (!self.html || !data) return;
            
            var url = Lampa.TMDB.api(
                (data.name ? 'tv' : 'movie') + '/' + data.id + 
                '?api_key=' + Lampa.TMDB.key() + 
                '&append_to_response=content_ratings,release_dates&language=' + 
                Lampa.Storage.get('language')
            );
            
            if (self.loaded[url]) {
                self.drawDetails(self.loaded[url]);
                return;
            }
            
            clearTimeout(self.timer);
            self.timer = setTimeout(function() {
                self.network.clear();
                self.network.timeout(5000);
                self.network.silent(url, function(movie) {
                    self.loaded[url] = movie;
                    self.drawDetails(movie);
                });
            }, 100);
        };

        self.create = function () {
            self.html = $(`<div class="new-interface-info">
                <div class="new-interface-info__body">
                    <div class="new-interface-info__head"></div>
                    <div class="new-interface-info__title"></div>
                    <div class="new-interface-info__details"></div>
                    <div class="new-interface-info__description"></div>
                </div>
            </div>`);
        };

        self.update = function (data) {
            if (!self.html) return;

            var requestId = ++self.lastRequestId;
            self.currentData = JSON.parse(JSON.stringify(data));
            
            self.clearFields();
            self.applyTextTitle(self.currentData);
            self.drawBasicInfo(self.currentData);
            
            var logoSetting = Lampa.Storage.get('logo_glav2') || 'show_all';
            
            if (logoSetting !== 'hide') {
                var type = data.name ? 'tv' : 'movie';
                var cacheKey = `${type}_${data.id}`;
                
                if (self.logoCache[cacheKey]) {
                    self.applyLogo(self.currentData, self.logoCache[cacheKey]);
                    self.loadFullData(self.currentData);
                    return;
                }
                
                if (!self.cacheQueue[cacheKey]) {
                    self.cacheQueue[cacheKey] = true;
                    var url = Lampa.TMDB.api(`${type}/${data.id}/images?api_key=${Lampa.TMDB.key()}`);

                    self.network.silent(url, function(images) {
                        delete self.cacheQueue[cacheKey];
                        if (requestId !== self.lastRequestId || !self.html || !self.currentData) return;

                        var bestLogo = self.findBestLogo(images, logoSetting);
                        
                        if (bestLogo) {
                            if (Object.keys(self.logoCache).length >= self.MAX_CACHE_SIZE) {
                                delete self.logoCache[Object.keys(self.logoCache)[0]];
                            }
                            self.logoCache[cacheKey] = bestLogo;
                            self.applyLogo(self.currentData, bestLogo);
                        }
                        
                        self.loadFullData(self.currentData);
                    }, function() {
                        delete self.cacheQueue[cacheKey];
                        if (requestId === self.lastRequestId) {
                            self.loadFullData(self.currentData);
                        }
                    });
                } else {
                    self.loadFullData(self.currentData);
                }
            } else {
                self.loadFullData(self.currentData);
            }

            Lampa.Background.change(Lampa.Api.img(data.backdrop_path, 'w200'));
        };

        self.render = function () { return self.html; };
        self.empty = function () {};
        
        self.destroy = function () {
            if (self.html) self.html.remove();
            self.loaded = {};
            self.logoCache = {};
            self.cacheQueue = {};
            self.currentData = null;
            self.html = null;
        };
    }

    function Component(object) {
        var self = this;
        self.network = new Lampa.Reguest();
        self.scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: true });
        self.items = [];
        self.html = $('<div class="new-interface"><img class="full-start__background"></div>');
        self.active = 0;
        self.newlampa = Lampa.Manifest.app_digital >= 166;
        self.info = null;
        self.lezydata = null;
        self.viewall = Lampa.Storage.field('card_views_type') == 'view' || Lampa.Storage.field('navigation_type') == 'mouse';
        self.background_img = self.html.find('.full-start__background');
        self.background_last = '';
        self.background_timer = null;

        self.create = function () {};

        self.empty = function () {
            var button;
            if (object.source == 'tmdb') {
                button = $(`<div class="empty__footer"><div class="simple-button selector">${Lampa.Lang.translate('change_source_on_cub')}</div></div>`);
                button.find('.selector').on('hover:enter', function () {
                    Lampa.Storage.set('source', 'cub');
                    Lampa.Activity.replace({ source: 'cub' });
                });
            }
            var empty = new Lampa.Empty();
            self.html.append(empty.render(button));
            self.start = empty.start;
            self.activity.loader(false);
            self.activity.toggle();
        };

        self.loadNext = function () {
            if (self.next && !self.next_wait && self.items.length) {
                self.next_wait = true;
                self.next(function (new_data) {
                    self.next_wait = false;
                    new_data.forEach(self.append.bind(self));
                    Lampa.Layer.visible(self.items[self.active + 1].render(true));
                }, function () { self.next_wait = false; });
            }
        };

        self.push = function () {};

        self.build = function (data) {
            self.lezydata = data;
            self.info = new CreateInfo(object);
            self.info.create();
            self.scroll.minus(self.info.render());
            data.slice(0, self.viewall ? data.length : 2).forEach(self.append.bind(self));
            self.html.append(self.info.render());
            self.html.append(self.scroll.render());

            if (self.newlampa) {
                Lampa.Layer.update(self.html);
                Lampa.Layer.visible(self.scroll.render(true));
                self.scroll.onEnd = self.loadNext.bind(self);
                self.scroll.onWheel = function (step) {
                    if (!Lampa.Controller.own(self)) self.start();
                    if (step > 0) self.down(); else if (self.active > 0) self.up();
                };
            }
            self.activity.loader(false);
            self.activity.toggle();
        };

        self.background = function (elem) {
            var new_background = Lampa.Api.img(elem.backdrop_path, 'w1280');
            clearTimeout(self.background_timer);
            if (new_background == self.background_last) return;
            
            self.background_last = new_background;
            self.background_img.removeClass('loaded');
            
            self.background_img[0].onload = function () {
                self.background_img.addClass('loaded');
            };
            
            self.background_img[0].onerror = function () {
                self.background_img.removeClass('loaded');
            };
            
            self.background_img[0].src = self.background_last;
        };

        self.append = function (element) {
            if (element.ready) return;
            element.ready = true;
            
            var item = new Lampa.InteractionLine(element, {
                url: element.url,
                card_small: true,
                cardClass: element.cardClass,
                genres: object.genres,
                object: object,
                card_wide: true,
                nomore: element.nomore
            });
            
            item.create();
            item.onDown = self.down.bind(self);
            item.onUp = self.up.bind(self);
            item.onBack = self.back.bind(self);
            item.onToggle = function () { self.active = self.items.indexOf(item); };
            if (self.onMore) item.onMore = self.onMore.bind(self);
            
            item.onFocus = function (elem) {
                self.info.update(elem);
                self.background(elem);
            };
            
            item.onHover = function (elem) {
                self.info.update(elem);
                self.background(elem);
            };
            
            item.onFocusMore = self.info.empty.bind(self.info);
            self.scroll.append(item.render());
            self.items.push(item);
        };

        self.back = function () { Lampa.Activity.backward(); };

        self.down = function () {
            self.active++;
            self.active = Math.min(self.active, self.items.length - 1);
            if (!self.viewall) self.lezydata.slice(0, self.active + 2).forEach(self.append.bind(self));
            self.items[self.active].toggle();
            self.scroll.update(self.items[self.active].render());
        };

        self.up = function () {
            self.active--;
            if (self.active < 0) {
                self.active = 0;
                Lampa.Controller.toggle('head');
            } else {
                self.items[self.active].toggle();
                self.scroll.update(self.items[self.active].render());
            }
        };

        self.start = function () {
            Lampa.Controller.add('content', {
                link: self,
                toggle: function () {
                    if (self.activity.canRefresh()) return false;
                    if (self.items.length) self.items[self.active].toggle();
                },
                update: function () {},
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left'); else Lampa.Controller.toggle('menu');
                },
                right: function () { Navigator.move('right'); },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up'); else Lampa.Controller.toggle('head');
                },
                down: function () { if (Navigator.canmove('down')) Navigator.move('down'); },
                back: self.back
            });
            Lampa.Controller.toggle('content');
        };

        self.refresh = function () {
            self.activity.loader(true);
            self.activity.need_refresh = true;
        };

        self.pause = function () {};
        self.stop = function () {};
        self.render = function () { return self.html; };

        self.destroy = function () {
            self.network.clear();
            Lampa.Arrays.destroy(self.items);
            self.scroll.destroy();
            if (self.info) self.info.destroy();
            self.html.remove();
            self.items = null;
            self.network = null;
            self.lezydata = null;
        };
    }

    function startPlugin() {
        window.plugin_interface_ready = true;
        var old_interface = Lampa.InteractionMain;
        var new_interface = Component;

        Lampa.InteractionMain = function (object) {
            var use = new_interface;
            if (window.innerWidth < 767) use = old_interface;
            if (Lampa.Manifest.app_digital < 153) use = old_interface;
            if (object.title === 'Избранное') use = old_interface;
            return new use(object);
        };

        Lampa.SettingsApi.addParam({
            component: "interface",
            param: {
                name: "logo_glav2",
                type: "select",
                values: { 
                    "show_all": "Все логотипы", 
                    "ru_only": "Только русские", 
                    "hide": "Скрыть логотипы"
                },
                default: "show_all"
            },
            field: {
                name: "Настройки логотипов на главной",
                description: "Управление отображением логотипов вместо названий"
            }
        }); 

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'new_interface_show_genres',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Показывать жанры',
                description: 'Отображать жанры фильмов/сериалов'
            }
        });

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
            .new-interface-info__body {
                width: 80%;
                padding-top: 1.1em;
            }
            .new-interface-info__head {
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 0em;
                font-size: 1.3em;
                min-height: 1em;
            }
            .new-interface-info__head span {
                color: #fff;
            }
            .new-interface-info__title {
                font-size: 4em;
                margin-top: 0.1em;
                font-weight: 800;
                margin-bottom: 0em;
                overflow: hidden;
                -o-text-overflow: ".";
                text-overflow: ".";
                display: -webkit-box;
                -webkit-line-clamp: 3;
                line-clamp: 3;
                -webkit-box-orient: vertical;
                margin-left: -0.03em;
                line-height: 1;
                text-shadow: 2px 3px 1px #00000040;
                max-width: 9em;
                text-transform: uppercase;
                letter-spacing: -2px;
                word-spacing: 5px;
            }
            .full-start__pg, .full-start__status {
                font-size: 0.9em;
            }
            .new-interface-info__details {
                margin-bottom: 1.6em;
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                min-height: 1.9em;
                font-size: 1.3em;
            }
            .new-interface-info__split {
                margin: 0 1em;
                font-size: 0.7em;
            }
            .new-interface-info__description {
                font-size: 1.2em;
                font-weight: 300;
                line-height: 1.5;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 4;
                line-clamp: 4;
                -webkit-box-orient: vertical;
                width: 70%;
            }
            .new-interface .full-start__background {
                opacity: 0.7 !important;
                height:109% !important;
                left:0em !important;
                top:-9.2% !important;
            }
            .new-interface .full-start__rate {
                font-size: 1.3em;
                margin-right: 0;
            }
            .new-interface .card__promo,
            .new-interface .card .card__promo {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                opacity: 0 !important;
            }
            .new-interface .card-more__box {
                padding-bottom: 95%;
            }
            .new-interface .card.card--wide+.card-more .card-more__box {
                padding-bottom: 95%;
            }
            .new-interface .card.card--wide .card-watched {
                display: none !important;
            }
            body.light--version .new-interface-info__body {
                width: 69%;
                padding-top: 1.5em;
            }
            body.light--version .new-interface-info {
                height: 25.3em;
            }
            body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.focus .card__view{
                animation: animation-card-focus 0.2s
            }
            body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.animate-trigger-enter .card__view{
                animation: animation-trigger-enter 0.2s forwards
            }
            </style>
        `);
        
        $('body').append(Lampa.Template.get('new_interface_style', {}, true));
    }

    if (!window.plugin_interface_ready) startPlugin();
})();