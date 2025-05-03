(function() {
    'use strict';

    // Ждем полной загрузки Lampa
    function waitLampa(callback) {
        if (window.Lampa && Lampa.Reguest && Lampa.TMDB && Lampa.Storage) {
            callback();
        } else {
            setTimeout(function() {
                waitLampa(callback);
            }, 100);
        }
    }

    waitLampa(function() {
        if (window.plugin_interface_ready) return;
        window.plugin_interface_ready = true;

        function create() {
            var html;
            var timer;
            var network = new Lampa.Reguest();
            var loaded = {};
            var logoCache = {};
            var currentData = null;
            var currentRequest = null;
            var preloadedLogos = {};
            var items = [];
            var active = 0;

            this.create = function() {
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

            function preloadLogo(type, id) {
                const cacheKey = `${type}_${id}`;
                if (!preloadedLogos[cacheKey] && !logoCache[cacheKey]) {
                    const url = Lampa.TMDB.api(`${type}/${id}/images?api_key=${Lampa.TMDB.key()}&language=${Lampa.Storage.get('language')}&include_image_language=ru,en,null`);
                    
                    network.timeout(1500).silent(url, function(images) {
                        if (images && images.logos && images.logos.length) {
                            let logoToUse = images.logos.find(logo => logo.iso_639_1 === 'ru') || 
                                          images.logos.find(logo => logo.iso_639_1 === 'en') || 
                                          images.logos[0];
                            
                            if (logoToUse && logoToUse.file_path) {
                                const imageUrl = Lampa.TMDB.image(`/t/p/w300${logoToUse.file_path}`);
                                preloadedLogos[cacheKey] = imageUrl;
                            }
                        }
                    }, function() {
                        console.log('Preload failed for', type, id);
                    });
                }
            }

            this.update = function(data) {
                if (!data) return;

                if (currentRequest) {
                    network.clear(currentRequest);
                    currentRequest = null;
                }

                currentData = {
                    data: data,
                    timestamp: Date.now()
                };
                
                this.draw(data);

                if (Lampa.Storage.get('new_interface_logo', true) === true) {
                    const type = data.name ? 'tv' : 'movie';
                    const cacheKey = `${type}_${data.id}`;
                    const currentTimestamp = currentData.timestamp;

                    // Предзагрузка следующих логотипов
                    if (items.length > active + 1) {
                        const nextData = items[active + 1].data();
                        if (nextData) {
                            const nextType = nextData.name ? 'tv' : 'movie';
                            preloadLogo(nextType, nextData.id);
                        }
                    }

                    html.find('.new-interface-info__title').empty();

                    if (logoCache[cacheKey]) {
                        html.find('.new-interface-info__title').html(logoCache[cacheKey]);
                    } else if (preloadedLogos[cacheKey]) {
                        const safeTitle = (data.title || data.name).replace(/'/g, "\\'");
                        const logoHtml = `
                            <div style="margin-top:0.3em; margin-bottom:0.3em; max-width: 8em; max-height:4em;">
                                <img style="max-width:8em; max-height:2.8em; object-fit:contain;" 
                                     src="${preloadedLogos[cacheKey]}" 
                                     alt="${safeTitle}"
                                     onerror="this.parentElement.innerHTML='${safeTitle}'" />
                            </div>
                        `;
                        logoCache[cacheKey] = logoHtml;
                        html.find('.new-interface-info__title').html(logoHtml);
                    } else {
                        const url = Lampa.TMDB.api(`${type}/${data.id}/images?api_key=${Lampa.TMDB.key()}&language=${Lampa.Storage.get('language')}&include_image_language=ru,en,null`);

                        const loadLogo = (attempt = 1) => {
                            currentRequest = network.timeout(2000).silent(url, function(images) {
                                currentRequest = null;
                                if (!currentData || currentData.timestamp !== currentTimestamp) return;
                                
                                let logoToUse = null;
                                const safeTitle = (data.title || data.name).replace(/'/g, "\\'");
                                
                                if (images && images.logos && images.logos.length) {
                                    logoToUse = images.logos.find(logo => logo.iso_639_1 === 'ru') || 
                                               images.logos.find(logo => logo.iso_639_1 === 'en') || 
                                               images.logos[0];
                                }

                                if (logoToUse && logoToUse.file_path) {
                                    const imageUrl = Lampa.TMDB.image(`/t/p/w300${logoToUse.file_path}`);
                                    const img = new Image();
                                    
                                    img.onload = function() {
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
                                    
                                    img.onerror = function() {
                                        if (attempt < 2) {
                                            setTimeout(function() { loadLogo(attempt + 1); }, 300);
                                        } else {
                                            showTitleFallback();
                                        }
                                    };
                                    
                                    img.src = imageUrl;
                                } else {
                                    showTitleFallback();
                                }
                            }, function() {
                                currentRequest = null;
                                if (attempt < 2) {
                                    setTimeout(function() { loadLogo(attempt + 1); }, 300);
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
        }

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

            this.create = function() {};

            this.build = function(data) {
                var _this = this;

                lezydata = data;
                info = new create(object);
                info.create();
                info.items = items;
                scroll.minus(info.render());
                data.slice(0, viewall ? data.length : 2).forEach(this.append.bind(this));
                html.append(info.render());
                html.append(scroll.render());

                if (newlampa) {
                    Lampa.Layer.update(html);
                    Lampa.Layer.visible(scroll.render(true));
                    scroll.onEnd = this.loadNext.bind(this);

                    scroll.onWheel = function(step) {
                        if (!Lampa.Controller.own(_this)) _this.start();
                        if (step > 0) _this.down(); else if (active > 0) _this.up();
                    };
                }

                this.activity.loader(false);
                this.activity.toggle();
            };

            // ... (остальные методы компонента)

            this.append = function(element) {
                var _this = this;

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

                item.onToggle = function() {
                    active = items.indexOf(item);
                    info.active = active;
                };

                item.onFocus = function(elem) {
                    info.update(elem);
                    _this.background(elem);
                };

                item.onHover = function(elem) {
                    info.update(elem);
                    _this.background(elem);
                };

                item.onFocusMore = info.empty.bind(info);
                scroll.append(item.render());
                items.push(item);
            };

            // ... (остальные методы)
        }

        // Сохраняем оригинальный интерфейс
        var old_interface = Lampa.InteractionMain;
        
        // Переопределяем основной интерфейс
        Lampa.InteractionMain = function(object) {
            var use = component;

            // Для мобильных устройств используем старый интерфейс
            if (window.innerWidth < 767) use = old_interface;
            if (Lampa.Manifest.app_digital < 153) use = old_interface;
            if (object.title === 'Избранное') use = old_interface;

            return new use(object);
        };

        // Добавляем стили
        Lampa.Template.add('new_interface_style', `
            <style>
                /* Ваши стили здесь */
                .new-interface .card__promo {
                    display: none !important;
                }
                /* Остальные стили */
            </style>
        `);
        
        $('body').append(Lampa.Template.get('new_interface_style', {}, true));
    });
})();