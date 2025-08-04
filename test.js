(function () {
    'use strict';

    function start() {
        if (window.lampac_episodes_range_plugin) return;
        window.lampac_episodes_range_plugin = true;

        console.log("[Episodes Range Plugin] Loaded"); // Отладочное сообщение

        Lampa.Controller.listener.follow('toggle', function (event) {
            console.log("[Episodes Range Plugin] Toggle event:", event); // Отладочное сообщение

            if (event.name !== 'select') return;

            var active = Lampa.Activity.active();
            var componentName = active.component.toLowerCase();
            console.log("[Episodes Range Plugin] Active component:", componentName); // Отладочное сообщение

            // Проверяем, находимся ли мы в онлайн-плеере (может называться по-разному)
            if (!componentName.includes('online') && !componentName.includes('bwa')) {
                console.log("[Episodes Range Plugin] Not in online player, skipping");
                return;
            }

            // Ищем меню фильтров (возможно, классы отличаются)
            var $filterTitle = $('.selectbox__title, .filter__title');
            if ($filterTitle.length === 0 || $filterTitle.text().indexOf('Фильтр') === -1) {
                console.log("[Episodes Range Plugin] Filter menu not found");
                return;
            }

            // Создаём пункт меню для выбора диапазона серий
            var $selectBoxItem = Lampa.Template.get('selectbox_item', {
                title: "Диапазон серий", // Можно заменить на Lampa.Lang.translate('...')
                subtitle: "1-25" // Пример
            });

            $selectBoxItem.on('hover:enter', function () {
                console.log("[Episodes Range Plugin] Episodes range button clicked");
                
                // Получаем текущий номер серии
                var currentEpisodeText = $('.online__title').text();
                var episodeMatch = currentEpisodeText.match(/Серия (\d+)/i);
                if (!episodeMatch) {
                    console.log("[Episodes Range Plugin] Could not detect current episode");
                    return;
                }
                
                var currentEpisode = parseInt(episodeMatch[1]);
                console.log("[Episodes Range Plugin] Current episode:", currentEpisode);

                // Создаём варианты диапазонов (например, 1-25, 26-50...)
                var ranges = [];
                var rangeSize = 25; // Можно изменить
                var maxEpisodes = 100; // Нужно получать реальное количество серий!

                for (var i = 1; i <= maxEpisodes; i += rangeSize) {
                    var end = Math.min(i + rangeSize - 1, maxEpisodes);
                    ranges.push(i + "-" + end);
                }

                // Создаём меню выбора диапазона
                var $rangeMenu = $(`
                    <div class="selectbox" style="z-index: 9999;">
                        <div class="selectbox__title">Выберите диапазон</div>
                        <div class="scroll__body"></div>
                    </div>
                `);

                ranges.forEach(function (range) {
                    var $item = Lampa.Template.get('selectbox_item', { title: range, subtitle: "" });
                    $item.on('hover:enter', function () {
                        var firstEpisode = parseInt(range.split("-")[0]);
                        console.log("[Episodes Range Plugin] Selected range:", range, "First episode:", firstEpisode);
                        
                        // Находим кнопку нужной серии и эмулируем клик
                        var $targetEpisode = $('.online__episodes .online__episode:contains("Серия ' + firstEpisode + '")');
                        if ($targetEpisode.length) {
                            $targetEpisode.trigger('hover:enter');
                        } else {
                            console.log("[Episodes Range Plugin] Episode not found:", firstEpisode);
                        }
                        
                        $rangeMenu.remove();
                    });
                    $rangeMenu.find('.scroll__body').append($item);
                });

                $('body').append($rangeMenu);
                Lampa.Controller.collectionSet($rangeMenu.find('.scroll__body'));
                Lampa.Controller.collectionFocus($rangeMenu.find('.selectbox-item').first());
            });

            // Вставляем кнопку в меню
            var $selectOptions = $('.selectbox-item, .filter__item');
            if ($selectOptions.length) {
                $selectOptions.first().before($selectBoxItem);
            } else {
                $('.selectbox, .filter__box').find('.scroll__body, .filter__body').prepend($selectBoxItem);
            }

            console.log("[Episodes Range Plugin] Button added successfully");
        });
    }

    // Запуск плагина
    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }
})();