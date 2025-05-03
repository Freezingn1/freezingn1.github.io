(function () {
    'use strict';

    function create() {
        var html;
        var timer;
        var network;
        var loaded = {};
        var logoCache = {};
        var currentData = null;
        var currentRequest = null;
        var preloadedLogos = {};
        var items = [];
        var active = 0;

        this.create = function () {
            // Инициализируем network после проверки
            if (typeof Lampa !== 'undefined' && Lampa.Reguest) {
                network = new Lampa.Reguest();
            } else {
                console.error('Lampa.Reguest is not available');
                return;
            }

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
            if (!network) return;
            
            const cacheKey = `${type}_${id}`;
            if (!preloadedLogos[cacheKey] && !logoCache[cacheKey]) {
                const url = Lampa.TMDB.api(`${type}/${id}/images?api_key=${Lampa.TMDB.key()}&language=${Lampa.Storage.get('language')}&include_image_language=ru,en,null`);
                
                try {
                    network.timeout(1500).silent(url, (images) => {
                        if (images && images.logos?.length) {
                            let logoToUse = images.logos.find(logo => logo.iso_639_1 === 'ru') || 
                                          images.logos.find(logo => logo.iso_639_1 === 'en') || 
                                          images.logos[0];
                            
                            if (logoToUse?.file_path) {
                                const imageUrl = Lampa.TMDB.image(`/t/p/w300${logoToUse.file_path}`);
                                preloadedLogos[cacheKey] = imageUrl;
                            }
                        }
                    });
                } catch (e) {
                    console.error('Error preloading logo:', e);
                }
            }
        }

        this.update = function (data) {
            if (!network) return;
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

                // Предзагрузка следующих логотипов
                if (items.length > 0) {
                    const nextIndex = active + 1;
                    if (items[nextIndex] && items[nextIndex].data) {
                        const nextData = items[nextIndex].data();
                        if (nextData) {
                            const nextType = nextData.name ? 'tv' : 'movie';
                            preloadLogo(nextType, nextData.id);
                        }
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
                        try {
                            currentRequest = network.timeout(2000).silent(url, (images) => {
                                currentRequest = null;
                                if (!currentData || currentData.timestamp !== currentTimestamp) return;
                                
                                let logoToUse = null;
                                const safeTitle = (data.title || data.name).replace(/'/g, "\\'");
                                
                                if (images && images.logos?.length) {
                                    logoToUse = images.logos.find(logo => logo.iso_639_1 === 'ru') || 
                                               images.logos.find(logo => logo.iso_639_1 === 'en') || 
                                               images.logos[0];
                                }

                                if (logoToUse?.file_path) {
                                    const imageUrl = Lampa.TMDB.image(`/t/p/w300${logoToUse.file_path}`);
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
                                        if (attempt < 2) {
                                            setTimeout(() => loadLogo(attempt + 1), 300);
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
                                if (attempt < 2) {
                                    setTimeout(() => loadLogo(attempt + 1), 300);
                                } else {
                                    showTitleFallback();
                                }
                            });
                        } catch (e) {
                            console.error('Error loading logo:', e);
                            showTitleFallback();
                        }
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

    // ... (остальная часть кода компонента)

    function startPlugin() {
        // Проверяем наличие необходимых объектов Lampa
        if (typeof Lampa === 'undefined' || !Lampa.Reguest || !Lampa.TMDB || !Lampa.Storage) {
            console.error('Lampa core objects are not available');
            return;
        }

        window.plugin_interface_ready = true;
        // ... (остальной код инициализации)
    }

    // Запускаем плагин только когда DOM готов
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(startPlugin, 1);
    } else {
        document.addEventListener('DOMContentLoaded', startPlugin);
    }
})();