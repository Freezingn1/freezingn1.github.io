(function() {
    'use strict';

    // Ждем полной загрузки Lampa
    function waitForLampa(callback) {
        if (window.Lampa && window.Lampa.Storage) {
            callback();
        } else {
            setTimeout(function() { waitForLampa(callback); }, 100);
        }
    }

    waitForLampa(function() {
        // Проверяем версию Lampa
        if (!Lampa.Manifest || !Lampa.Storage) {
            console.error('Lampa Uncensored not detected');
            return;
        }

        // Добавляем CSS стили
        var css = `
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
                z-index: 10;
            }
            .new-interface-info__title {
                font-size: 3em;
                font-weight: 600;
                margin-bottom: 0.5em;
            }
            .new-interface-info__details {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 1em;
                margin-bottom: 1.5em;
            }
            .new-interface-info__description {
                font-size: 1.2em;
                line-height: 1.4;
                max-width: 80%;
            }
            .new-interface .full-start__background {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                z-index: 1;
            }
        `;

        $('head').append(`<style>${css}</style>`);

        // Переопределяем стандартный рендер
        var originalRender = Lampa.InteractionMain.prototype.render;
        
        Lampa.InteractionMain.prototype.render = function(items) {
            var container = originalRender.call(this, items);
            
            if (!this._styleInterfaceAdded && items && items.length > 0) {
                this._styleInterfaceAdded = true;
                
                // Создаем новый интерфейс
                var newInterface = $(`
                    <div class="new-interface">
                        <img class="full-start__background" src="${Lampa.Api.img(items[0].backdrop_path, 'w1280')}">
                        <div class="new-interface-info">
                            <div class="new-interface-info__title">${items[0].name || items[0].title}</div>
                            <div class="new-interface-info__details"></div>
                            <div class="new-interface-info__description">${items[0].overview || ''}</div>
                        </div>
                    </div>
                `);
                
                // Вставляем перед основным контентом
                container.prepend(newInterface);
                
                // Обновляем данные при навигации
                this.on('change', function(item) {
                    if (item && item.backdrop_path) {
                        newInterface.find('.full-start__background').attr('src', Lampa.Api.img(item.backdrop_path, 'w1280'));
                        newInterface.find('.new-interface-info__title').text(item.name || item.title);
                        newInterface.find('.new-interface-info__description').text(item.overview || '');
                        
                        // Загружаем логотип
                        loadLogo(item, newInterface);
                    }
                });
            }
            
            return container;
        };

        // Функция загрузки логотипа с приоритетами языков
        function loadLogo(item, container) {
            var type = item.first_air_date ? 'tv' : 'movie';
            var languages = ['ru', 'en', '']; // Приоритет: русский -> английский -> любой
            
            function tryLoad(index) {
                if (index >= languages.length) return;
                
                var lang = languages[index] ? '&language=' + languages[index] : '';
                var url = `https://tmdbapi.bylampa.online/3/${type}/${item.id}/images?api_key=${Lampa.TMDB.key()}${lang}`;
                
                $.get(url).then(function(data) {
                    if (data.logos && data.logos[0] && data.logos[0].file_path) {
                        var logoUrl = 'https://tmdbimg.bylampa.online/t/p/w500' + data.logos[0].file_path.replace('.svg', '.png');
                        container.find('.new-interface-info__title').html(`
                            <img style="max-height: 3em; max-width: 100%;" src="${logoUrl}" />
                        `);
                    } else {
                        tryLoad(index + 1); // Пробуем следующий язык
                    }
                }).fail(function() {
                    tryLoad(index + 1); // Пробуем следующий язык при ошибке
                });
            }
            
            tryLoad(0); // Начинаем с русского языка
        }

        console.log('Style Interface plugin loaded for Lampa Uncensored');
    });
})();