(function () {
    'use strict'

    function start() {
        if (window.lampac_episodes_range_plugin) {
            return;
        }

        window.lampac_episodes_range_plugin = true;

        Lampa.Controller.listener.follow('toggle', function (event) {
            if (event.name !== 'select') {
                return;
            }

            var active = Lampa.Activity.active();
            var componentName = active.component.toLowerCase();

            // Проверяем, что находимся в онлайн-плеере
            if (componentName !== 'online') {
                return;
            }

            var $filterTitle = $('.selectbox__title');

            if ($filterTitle.length !== 1 || $filterTitle.text() !== Lampa.Lang.translate('title_filter')) {
                return;
            }

            // Создаем кнопку для выбора диапазона серий
            var $episodesBtn = $('<div class="simple-button--filter filter--sort hide"><div>' + Lampa.Lang.translate('episodes_range') + '</div></div>');
            $('body').append($episodesBtn);

            var $selectBoxItem = Lampa.Template.get('selectbox_item', {
                title: Lampa.Lang.translate('episodes_range'),
                subtitle: '1-' // Будем обновлять динамически
            });

            $selectBoxItem.on('hover:enter', function () {
                // Получаем текущий номер серии из заголовка
                var currentEpisode = parseInt($('.online__title').text().match(/Серия (\d+)/i)[1]);
                
                // Создаем массив диапазонов (например, 1-25, 26-50 и т.д.)
                var ranges = [];
                var rangeSize = 25; // Размер диапазона (можно изменить)
                
                // Определяем максимальный номер серии (можно получить из API или установить вручную)
                var maxEpisodes = 100; // Здесь нужно получить реальное количество серий
                
                for (var i = 1; i <= maxEpisodes; i += rangeSize) {
                    var end = Math.min(i + rangeSize - 1, maxEpisodes);
                    ranges.push(i + '-' + end);
                }
                
                // Создаем меню выбора диапазона
                var $rangeMenu = $('<div class="selectbox"><div class="selectbox__title">' + 
                                  Lampa.Lang.translate('select_episodes_range') + 
                                  '</div><div class="scroll__body"></div></div>');
                
                ranges.forEach(function(range) {
                    var $item = Lampa.Template.get('selectbox_item', {
                        title: range,
                        subtitle: ''
                    });
                    
                    $item.on('hover:enter', function() {
                        // При выборе диапазона переключаемся на первую серию в диапазоне
                        var firstEpisode = parseInt(range.split('-')[0]);
                        // Здесь должен быть код для перехода к выбранной серии
                        // Например, эмулируем клик по соответствующей серии
                        $('.online__episodes .online__episode:contains("Серия ' + firstEpisode + '")').trigger('hover:enter');
                        $rangeMenu.remove();
                    });
                    
                    $rangeMenu.find('.scroll__body').append($item);
                });
                
                $('body').append($rangeMenu);
                Lampa.Controller.collectionSet($rangeMenu.find('.scroll__body'));
                Lampa.Controller.collectionFocus($rangeMenu.find('.selectbox-item').first());
            });

            var $selectOptions = $('.selectbox-item');

            if ($selectOptions.length > 0) {
                $selectOptions.first().after($selectBoxItem);
            } else {
                $('body > .selectbox').find('.scroll__body').prepend($selectBoxItem);
            }

            Lampa.Controller.collectionSet($('body > .selectbox').find('.scroll__body'));
            Lampa.Controller.collectionFocus($('.selectbox-item').first());
        });
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                start();
            }
        });
    }
})();