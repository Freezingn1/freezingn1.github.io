(function () {
    'use strict';

    function create() {
        var html;
        var timer;
        var network = new Lampa.Reguest();
        var loaded = {};
        var logoCache = {};
        var currentData = null;
        var currentRequest = null;

        this.create = function () {
            html = $(`
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

        this.update = function (data) {
            // Отменяем предыдущий запрос, если он есть
            if (currentRequest) {
                network.clear(currentRequest);
                currentRequest = null;
            }

            currentData = {
                data: data,
                timestamp: Date.now()
            };
            
            this.draw(data);

            if (Lampa.Storage.get('new_interface_logo') === true) {
                const type = data.name ? 'tv' : 'movie';
                const cacheKey = `${type}_${data.id}`;
                const currentTimestamp = currentData.timestamp;

                // Очищаем предыдущий заголовок перед загрузкой нового
                html.find('.new-interface-info__title').empty();

const MAX_CACHE_SIZE = 50;
if (Object.keys(logoCache).length >= MAX_CACHE_SIZE) {
    const oldestKey = Object.keys(logoCache)[0];
    delete logoCache[oldestKey];
}

                if (logoCache[cacheKey]) {
                    html.find('.new-interface-info__title').html(logoCache[cacheKey]);
                } else {
                    const url = Lampa.TMDB.api(`${type}/${data.id}/images?api_key=${Lampa.TMDB.key()}&language=${Lampa.Storage.get('language')}&include_image_language=ru,en,null`);

                    const loadLogo = (attempt = 1) => {
                        currentRequest = network.silent(url, (images) => {
                            currentRequest = null;
                            if (!currentData || currentData.timestamp !== currentTimestamp) return;
                            
                            let logoToUse = null;
                            const safeTitle = (data.title || data.name).replace(/'/g, "\\'");
                            
                            if (images.logos?.length) {
                                // 1. Приоритет русскому логотипу
                                logoToUse = images.logos.find(logo => logo.iso_639_1 === 'ru');
                                
                                // 2. Английский как запасной вариант
                                if (!logoToUse) {
                                    logoToUse = images.logos.find(logo => logo.iso_639_1 === 'en');
                                }
                                
                                // 3. Любой логотип если нет языковых
                                if (!logoToUse) {
                                    logoToUse = images.logos[0];
                                }
                                
                                // 4. Выбираем логотип с лучшим качеством
                                if (images.logos.length > 1 && !logoToUse) {
                                    logoToUse = images.logos.reduce((prev, current) => 
                                        (prev.width * prev.height > current.width * current.height) ? prev : current
                                    );
                                }
                            }

                            if (logoToUse?.file_path) {
                                const imageUrl = Lampa.TMDB.image(`/t/p/w500${logoToUse.file_path}`);
                                const img = new Image();
                                
                                img.onload = () => {
                                    if (!currentData || currentData.timestamp !== currentTimestamp) return;
                                    
                                    const logoHtml = `
                                        <div style="margin-top:0.3em; margin-bottom:0.3em; max-width: 8em; max-height:4em;">
                                            <img style="max-width:8em; max-height:2.8em; object-fit:contain;" 
                                                 src="${imageUrl}" 
                                                 alt="${safeTitle}"
                                                 onerror="this.parentElement.innerHTML='${safeTitle}'" />
                                        </div>
                                    `;
                                    logoCache[cacheKey] = logoHtml;
                                    html.find('.new-interface-info__title').html(logoHtml);
                                };
                                
                                img.onerror = () => {
                                    if (attempt < 3) {
                                        setTimeout(() => loadLogo(attempt + 1), 100 * attempt);
                                    } else {
                                        showTitleFallback();
                                    }
                                };
                                
                                img.src = imageUrl;
                            } else {
                                showTitleFallback();
                            }
                        }, () => {
                            currentRequest = null;
                            if (attempt < 3) {
                                setTimeout(() => loadLogo(attempt + 1), 100 * attempt);
                            } else {
                                showTitleFallback();
                            }
                        });
                    };

                    function showTitleFallback() {
                        if (!currentData || currentData.timestamp !== currentTimestamp) return;
                        html.find('.new-interface-info__title').text(data.title || data.name);
                    }

                    loadLogo();
                }
            } else {
                html.find('.new-interface-info__title').text(data.title || data.name);
            }

            if (Lampa.Storage.get('new_interface_show_description', true) !== false) {
                html.find('.new-interface-info__description').text(data.overview || Lampa.Lang.translate('full_notext')).show();
            } else {
                html.find('.new-interface-info__description').hide();
            }

            Lampa.Background.change(Lampa.Api.img(data.backdrop_path, 'w200'));
            this.load(data);
        };

        // ... (остальные методы остаются без изменений)
        this.draw = function (data) {
            if (!data && currentData && currentData.data) data = currentData.data;
            if (!data) return;

            var create = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
            var vote = parseFloat((data.vote_average || 0) + '').toFixed(1);
            var head = [];
            var details = [];
            var countries = Lampa.Api.sources.tmdb.parseCountries(data);
            var pg = Lampa.Api.sources.tmdb.parsePG(data);
            
            if (create !== '0000') head.push('<span>' + create + '</span>');
            if (countries.length > 0) head.push(countries.join(', '));
            
            if (vote > 0) details.push('<div class="full-start__rate"><div>' + vote + '</div><div>TMDB</div></div>');
            
            if (data.number_of_episodes && data.number_of_episodes > 0) {
                details.push('<span class="full-start__pg">Эпизодов ' + data.number_of_episodes + '</span>');
            }
            
            if (Lampa.Storage.get('new_interface_show_genres', true) !== false && data.genres?.length > 0) {
                details.push(data.genres.map(item => Lampa.Utils.capitalizeFirstLetter(item.name)).join(' | '));
            }
            
            if (data.runtime) details.push(Lampa.Utils.secondsToTime(data.runtime * 60, true));
            if (pg) details.push('<span class="full-start__pg" style="font-size: 0.9em;">' + pg + '</span>');
            
            html.find('.new-interface-info__head').empty().append(head.join(', '));
            html.find('.new-interface-info__details').html(details.join('<span class="new-interface-info__split">&#9679;</span>'));
        };

        this.load = function (data) {
            var _this = this;
            clearTimeout(timer);
            
            var url = Lampa.TMDB.api((data.name ? 'tv' : 'movie') + '/' + data.id + '?api_key=' + Lampa.TMDB.key() + '&append_to_response=content_ratings,release_dates&language=' + Lampa.Storage.get('language'));
            
            if (loaded[url]) {
                this.draw(loaded[url]);
                return;
            }
            
            timer = setTimeout(function () {
                network.clear();
                network.timeout(5000);
                network.silent(url, function (movie) {
                    loaded[url] = movie;
                    _this.draw(movie);
                }, function() {
                    _this.draw(data);
                });
            }, 400);
        };

        this.render = function () {
            return html;
        };

setInterval(() => {
    logoCache = {};
}, 60_000); // Каждую минуту

        this.empty = function () {};
		
		this.destroy = function() {
    if (currentRequest) network.clear(currentRequest);
    clearTimeout(timer); // Добавьте эту строку

};

        this.destroy = function () {
            if (currentRequest) {
                network.clear(currentRequest);
                currentRequest = null;
            }
            html.remove();
            loaded = {};
            logoCache = {};
            html = null;
        };
    }

    // ... (остальная часть кода компонента остается без изменений)
    function component(object) {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({
            mask: true,
            over: true,
            scroll_by_item: true
        });
        var items = [];
        var html = $('<div class="new-interface"><img class="full-start__background"></div>');
        var active = 0;
        var newlampa = Lampa.Manifest.app_digital >= 166;
        var info;
        var lezydata;
        var viewall = Lampa.Storage.field('card_views_type') == 'view' || Lampa.Storage.field('navigation_type') == 'mouse';
        var background_img = html.find('.full-start__background');
        var background_last = '';
        var background_timer;

        this.create = function () {};

        this.empty = function () {
            var button;

            if (object.source == 'tmdb') {
                button = $('<div class="empty__footer"><div class="simple-button selector">' + Lampa.Lang.translate('change_source_on_cub') + '</div></div>');
                button.find('.selector').on('hover:enter', function () {
                    Lampa.Storage.set('source', 'cub');
                    Lampa.Activity.replace({
                        source: 'cub'
                    });
                });
            }

            var empty = new Lampa.Empty();
            html.append(empty.render(button));
            this.start = empty.start;
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.loadNext = function () {
            var _this = this;

            if (this.next && !this.next_wait && items.length) {
                this.next_wait = true;
                this.next(function (new_data) {
                    _this.next_wait = false;
                    new_data.forEach(_this.append.bind(_this));
                    Lampa.Layer.visible(items[active + 1].render(true));
                }, function () {
                    _this.next_wait = false;
                });
            }
        };

        this.push = function () {};

        this.build = function (data) {
            var _this2 = this;

            lezydata = data;
            info = new create(object);
            info.create();
            scroll.minus(info.render());
            data.slice(0, viewall ? data.length : 2).forEach(this.append.bind(this));
            html.append(info.render());
            html.append(scroll.render());

            if (newlampa) {
                Lampa.Layer.update(html);
                Lampa.Layer.visible(scroll.render(true));
                scroll.onEnd = this.loadNext.bind(this);

                scroll.onWheel = function (step) {
                    if (!Lampa.Controller.own(_this2)) _this2.start();
                    if (step > 0) _this2.down();else if (active > 0) _this2.up();
                };
            }

            this.activity.loader(false);
            this.activity.toggle();
        };

        this.background = function (elem) {
            var new_background = Lampa.Api.img(elem.backdrop_path, 'w1280');
            clearTimeout(background_timer);
            if (new_background == background_last) return;
            
            background_last = new_background;
            background_img.removeClass('loaded');
            
            background_img[0].onload = function () {
                background_img.addClass('loaded');
            };
            
            background_img[0].onerror = function () {
                background_img.removeClass('loaded');
            };
            
            background_img[0].src = background_last;
        };

        this.append = function (element) {
            var _this3 = this;

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
            item.onDown = this.down.bind(this);
            item.onUp = this.up.bind(this);
            item.onBack = this.back.bind(this);

            item.onToggle = function () {
                active = items.indexOf(item);
            };

            if (this.onMore) item.onMore = this.onMore.bind(this);

            item.onFocus = function (elem) {
                info.update(elem);
                _this3.background(elem);
            };

            item.onHover = function (elem) {
                info.update(elem);
                _this3.background(elem);
            };

            item.onFocusMore = info.empty.bind(info);
            scroll.append(item.render());
            items.push(item);
        };

        this.back = function () {
            Lampa.Activity.backward();
        };

        this.down = function () {
            active++;
            active = Math.min(active, items.length - 1);
            if (!viewall) lezydata.slice(0, active + 2).forEach(this.append.bind(this));
            items[active].toggle();
            scroll.update(items[active].render());
        };

        this.up = function () {
            active--;

            if (active < 0) {
                active = 0;
                Lampa.Controller.toggle('head');
            } else {
                items[active].toggle();
                scroll.update(items[active].render());
            }
        };

        this.start = function () {
            var _this4 = this;

            Lampa.Controller.add('content', {
                link: this,
                toggle: function toggle() {
                    if (_this4.activity.canRefresh()) return false;

                    if (items.length) {
                        items[active].toggle();
                    }
                },
                update: function update() {},
                left: function left() {
                    if (Navigator.canmove('left')) Navigator.move('left');else Lampa.Controller.toggle('menu');
                },
                right: function right() {
                    Navigator.move('right');
                },
                up: function up() {
                    if (Navigator.canmove('up')) Navigator.move('up');else Lampa.Controller.toggle('head');
                },
                down: function down() {
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                back: this.back
            });
            Lampa.Controller.toggle('content');
        };

        this.refresh = function () {
            this.activity.loader(true);
            this.activity.need_refresh = true;
        };

        this.pause = function () {};

        this.stop = function () {};

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            network.clear();
            Lampa.Arrays.destroy(items);
            scroll.destroy();
            if (info) info.destroy();
            html.remove();
            items = null;
            network = null;
            lezydata = null;
        };
    }

    function startPlugin() {
        window.plugin_interface_ready = true;
        var old_interface = Lampa.InteractionMain;
        var new_interface = component;

        Lampa.InteractionMain = function (object) {
            var use = new_interface;

            if (window.innerWidth < 767) use = old_interface;
            if (Lampa.Manifest.app_digital < 153) use = old_interface;
            if (object.title === 'Избранное') {
                use = old_interface;
            }

            return new use(object);
        };

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'new_interface_logo',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Логотипы вместо названий',
                description: 'Отображать логотипы (русские → английские → любые)'
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'new_interface_show_description',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Показывать описание',
                description: 'Отображать описание фильмов/сериалов'
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
                height: 108%;
                left: 30px;
                top: -4.8em;
            }
            
            .new-interface .full-start__rate {
                font-size: 1.3em;
                margin-right: 0;
            }
            
            /* Полное удаление card__promo */
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