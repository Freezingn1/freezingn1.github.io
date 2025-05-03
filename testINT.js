(function () {
    'use strict';

    function create() {
        var html, timer, network = new Lampa.Reguest();
        var loaded = {}, logoCache = {}, currentData = null;
        var activeRequest = null, activeImageLoad = null;
        var titleElement, headElement, detailsElement, descElement;

        function cleanupImage() {
            if (activeImageLoad) {
                activeImageLoad.onload = activeImageLoad.onerror = null;
                activeImageLoad.src = '';
                activeImageLoad = null;
            }
        }

        this.create = function () {
            html = $(`<div class="new-interface-info">
                <div class="new-interface-info__body">
                    <div class="new-interface-info__head"></div>
                    <div class="new-interface-info__title"></div>
                    <div class="new-interface-info__details"></div>
                    <div class="new-interface-info__description"></div>
                </div>
            </div>`);
            
            titleElement = html.find('.new-interface-info__title')[0];
            headElement = html.find('.new-interface-info__head')[0];
            detailsElement = html.find('.new-interface-info__details')[0];
            descElement = html.find('.new-interface-info__description')[0];
        };

        this.update = function (data) {
            // Отменяем предыдущие запросы
            if (activeRequest) network.clear();
            cleanupImage();

            currentData = {
                data: data,
                timestamp: Date.now()
            };

            // Устанавливаем текст сразу
            titleElement.textContent = data.title || data.name;
            this.draw(data);

            if (Lampa.Storage.get('new_interface_logo') === true) {
                this.loadLogo(data);
            }

            if (Lampa.Storage.get('new_interface_show_description', true) !== false) {
                descElement.textContent = data.overview || Lampa.Lang.translate('full_notext');
                descElement.style.display = '';
            } else {
                descElement.style.display = 'none';
            }

            Lampa.Background.change(Lampa.Api.img(data.backdrop_path, 'w200'));
            this.load(data);
        };

        this.loadLogo = function(data) {
            const type = data.name ? 'tv' : 'movie';
            const cacheKey = `${type}_${data.id}`;
            const currentTimestamp = currentData.timestamp;

            if (logoCache[cacheKey]) {
                requestAnimationFrame(() => {
                    if (currentData && currentData.timestamp === currentTimestamp) {
                        titleElement.innerHTML = logoCache[cacheKey];
                    }
                });
                return;
            }

            const url = Lampa.TMDB.api(`${type}/${data.id}/images?api_key=${Lampa.TMDB.key()}&language=${Lampa.Storage.get('language')}`);

            activeRequest = network.silent(url, (images) => {
                if (!currentData || currentData.timestamp !== currentTimestamp) return;
                
                if (images.logos?.length) {
                    const logoPath = images.logos[0].file_path;
                    if (logoPath) {
                        cleanupImage();
                        
                        const imageUrl = Lampa.TMDB.image(`/t/p/w500${logoPath.replace(".svg", ".png")}`);
                        const img = new Image();
                        activeImageLoad = img;
                        
                        img.onload = () => {
                            if (!currentData || currentData.timestamp !== currentTimestamp) return;
                            const logoHtml = `<img style="margin-top:0.3em;margin-bottom:0.3em;max-width:8em;max-height:2.8em;" src="${imageUrl}">`;
                            logoCache[cacheKey] = logoHtml;
                            titleElement.innerHTML = logoHtml;
                            cleanupImage();
                        };
                        
                        img.onerror = cleanupImage;
                        img.src = imageUrl;
                    }
                }
            }, () => {
                if (currentData && currentData.timestamp === currentTimestamp) {
                    titleElement.textContent = data.title || data.name;
                }
            });
        };

        this.draw = function (data) {
            if (!data && currentData?.data) data = currentData.data;
            if (!data) return;

            const createYear = (data.release_date || data.first_air_date || '0000').slice(0, 4);
            const vote = parseFloat(data.vote_average || 0).toFixed(1);
            const countries = Lampa.Api.sources.tmdb.parseCountries(data);
            const pg = Lampa.Api.sources.tmdb.parsePG(data);
            
            let headHTML = '';
            if (createYear !== '0000') headHTML += `<span>${createYear}</span>`;
            if (countries.length) headHTML += (headHTML ? ', ' : '') + countries.join(', ');
            
            let detailsHTML = '';
            if (vote > 0) detailsHTML += `<div class="full-start__rate"><div>${vote}</div><div>TMDB</div></div>`;
            
            if (data.number_of_episodes > 0) {
                detailsHTML += `<span class="full-start__pg">Эпизодов ${data.number_of_episodes}</span>`;
            }
            
            if (Lampa.Storage.get('new_interface_show_genres', true) !== false && data.genres?.length) {
                detailsHTML += data.genres.map(item => Lampa.Utils.capitalizeFirstLetter(item.name)).join(' | ');
            }
            
            if (data.runtime) {
                detailsHTML += (detailsHTML ? '<span class="new-interface-info__split">&#9679;</span>' : '') + 
                    Lampa.Utils.secondsToTime(data.runtime * 60, true);
            }
            
            if (pg) {
                detailsHTML += (detailsHTML ? '<span class="new-interface-info__split">&#9679;</span>' : '') + 
                    `<span class="full-start__pg" style="font-size:0.9em;">${pg}</span>`;
            }

            requestAnimationFrame(() => {
                headElement.innerHTML = headHTML;
                detailsElement.innerHTML = detailsHTML;
            });
        };

        this.load = function (data) {
            clearTimeout(timer);
            
            const url = Lampa.TMDB.api(`${data.name ? 'tv' : 'movie'}/${data.id}?api_key=${Lampa.TMDB.key()}&append_to_response=content_ratings,release_dates&language=${Lampa.Storage.get('language')}`);
            
            if (loaded[url]) {
                this.draw(loaded[url]);
                return;
            }
            
            timer = setTimeout(() => {
                network.clear();
                network.timeout(5000);
                network.silent(url, (movie) => {
                    loaded[url] = movie;
                    this.draw(movie);
                }, () => {
                    this.draw(data);
                });
            }, 300);
        };

        this.render = function () { return html; };
        this.empty = function () {};
        this.destroy = function () {
            if (activeRequest) network.clear();
            cleanupImage();
            html.remove();
            loaded = logoCache = {};
        };
    }

    function component(object) {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: true });
        var items = [], html = $('<div class="new-interface"><img class="full-start__background"></div>');
        var active = 0, background_img = html.find('.full-start__background')[0];
        var background_last = '', background_timer;
        var info, lezydata;
        var newlampa = Lampa.Manifest.app_digital >= 166;
        var viewall = Lampa.Storage.field('card_views_type') == 'view' || Lampa.Storage.field('navigation_type') == 'mouse';

        this.create = function () {};
        this.empty = function () {
            if (object.source == 'tmdb') {
                const button = $('<div class="empty__footer"><div class="simple-button selector">' + 
                    Lampa.Lang.translate('change_source_on_cub') + '</div></div>');
                button.find('.selector').on('hover:enter', () => {
                    Lampa.Storage.set('source', 'cub');
                    Lampa.Activity.replace({ source: 'cub' });
                });
                html.append(new Lampa.Empty().render(button));
            } else {
                html.append(new Lampa.Empty().render());
            }
            this.activity.loader(false).toggle();
        };

        this.build = function (data) {
            lezydata = data;
            info = new create(object);
            info.create();
            scroll.minus(info.render());
            
            data.slice(0, viewall ? data.length : 2).forEach(this.append.bind(this));
            html.append(info.render(), scroll.render());

            if (newlampa) {
                Lampa.Layer.update(html);
                Lampa.Layer.visible(scroll.render(true));
                scroll.onEnd = this.loadNext.bind(this);
                scroll.onWheel = (step) => {
                    if (!Lampa.Controller.own(this)) this.start();
                    step > 0 ? this.down() : (active > 0 && this.up());
                };
            }

            this.activity.loader(false).toggle();
        };

        this.background = function (elem) {
            const new_background = Lampa.Api.img(elem.backdrop_path, 'w1280');
            if (new_background === background_last) return;
            
            clearTimeout(background_timer);
            background_last = new_background;
            background_img.classList.remove('loaded');
            
            background_img.onload = () => background_img.classList.add('loaded');
            background_img.onerror = () => background_img.classList.remove('loaded');
            background_img.src = background_last;
        };

        this.append = function (element) {
            if (element.ready) return;
            element.ready = true;
            
            const item = new Lampa.InteractionLine(element, {
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
            item.onToggle = () => active = items.indexOf(item);
            if (this.onMore) item.onMore = this.onMore.bind(this);
            
            item.onFocus = item.onHover = (elem) => {
                info.update(elem);
                this.background(elem);
            };
            
            item.onFocusMore = info.empty.bind(info);
            scroll.append(item.render());
            items.push(item);
        };

        this.back = () => Lampa.Activity.backward();
        this.down = function () {
            active = Math.min(active + 1, items.length - 1);
            if (!viewall) lezydata.slice(0, active + 2).forEach(this.append.bind(this));
            items[active].toggle();
            scroll.update(items[active].render());
        };
        this.up = function () {
            if (--active < 0) {
                active = 0;
                Lampa.Controller.toggle('head');
            } else {
                items[active].toggle();
                scroll.update(items[active].render());
            }
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                link: this,
                toggle: () => !this.activity.canRefresh() && items.length && items[active].toggle(),
                left: () => Navigator.canmove('left') ? Navigator.move('left') : Lampa.Controller.toggle('menu'),
                right: () => Navigator.move('right'),
                up: () => Navigator.canmove('up') ? Navigator.move('up') : Lampa.Controller.toggle('head'),
                down: () => Navigator.canmove('down') && Navigator.move('down'),
                back: this.back
            }).toggle('content');
        };

        this.loadNext = function () {
            if (!this.next || this.next_wait || !items.length) return;
            
            this.next_wait = true;
            this.next((new_data) => {
                this.next_wait = false;
                new_data.forEach(this.append.bind(this));
                Lampa.Layer.visible(items[active + 1].render(true));
            }, () => { this.next_wait = false; });
        };

        this.push = function () {};
        this.render = () => html;
        this.refresh = function () { this.activity.loader(true).need_refresh = true; };
        this.pause = this.stop = function () {};

        this.destroy = function () {
            network.clear();
            Lampa.Arrays.destroy(items);
            scroll.destroy();
            if (info) info.destroy();
            html.remove();
            items = lezydata = null;
        };
    }

    function startPlugin() {
        if (window.plugin_interface_ready) return;
        window.plugin_interface_ready = true;

        const old_interface = Lampa.InteractionMain;
        Lampa.InteractionMain = function (object) {
            const use = (window.innerWidth < 767 || Lampa.Manifest.app_digital < 153 || object.title === 'Избранное') ? 
                old_interface : component;
            return new use(object);
        };

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'new_interface_logo', type: 'trigger', default: false },
            field: {
                name: 'Логотипы в новом интерфейсе',
                description: 'Отображать логотипы фильмов/сериалов вместо названия в новом интерфейсе'
            }
        });

        const style = `<style>
            .new-interface .card--small.card--wide { width: 18.3em; }
            .new-interface-info {
                position: relative; padding: 1.5em; height: 26em;
                contain: strict; /* Оптимизация рендеринга */
            }
            .new-interface-info__body { width: 80%; padding-top: 1.1em; }
            .new-interface-info__head {
                color: rgba(255, 255, 255, 0.6); margin-bottom: 0;
                font-size: 1.3em; min-height: 1em;
            }
            .new-interface-info__head span { color: #fff; }
            .new-interface-info__title {
                font-size: 4em; margin: 0.1em 0; font-weight: 800;
                overflow: hidden; text-overflow: ellipsis;
                display: -webkit-box; -webkit-line-clamp: 3;
                line-clamp: 3; -webkit-box-orient: vertical;
                line-height: 1; text-shadow: 2px 3px 1px #00000040;
                max-width: 9em; text-transform: uppercase;
                letter-spacing: -2px; word-spacing: 5px;
                will-change: transform, opacity; /* Оптимизация анимации */
            }
            .new-interface-info__details {
                margin-bottom: 1.6em; display: flex; flex-wrap: wrap;
                align-items: center; min-height: 1.9em; font-size: 1.3em;
            }
            .new-interface-info__split { margin: 0 1em; font-size: 0.7em; }
            .new-interface-info__description {
                font-size: 1.2em; font-weight: 300; line-height: 1.5;
                overflow: hidden; text-overflow: ellipsis;
                display: -webkit-box; -webkit-line-clamp: 4;
                line-clamp: 4; -webkit-box-orient: vertical; width: 70%;
            }
            .new-interface .full-start__background {
                height: 108%; left: 30px; top: -4.8em;
                will-change: transform, opacity; /* Оптимизация анимации */
            }
            .new-interface .full-start__rate { font-size: 1.3em; margin-right: 0; }
            .new-interface .card__promo { display: none; }
            .new-interface .card-watched { display: none !important; }
            body.light--version .new-interface-info__body { width: 69%; padding-top: 1.5em; }
            body.light--version .new-interface-info { height: 25.3em; }
        </style>`;
        
        document.head.insertAdjacentHTML('beforeend', style);
    }

    startPlugin();
})();