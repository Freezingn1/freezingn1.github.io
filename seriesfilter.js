(function() {
    'use strict';

    // Ждем полной загрузки приложения
    function init() {
        // Защита от дублирования
        if (window.lampac_series_filter_plugin) return;
        window.lampac_series_filter_plugin = true;

        // Основная функция добавления фильтра
        function addSeriesFilter() {
            // Проверяем активное окно
            const active = Lampa.Activity.active();
            if (!active || !active.component) return;
            
            const componentName = active.component.toLowerCase();
            if (componentName !== 'online' && componentName !== 'lampac' && componentName.indexOf('bwa') !== 0) return;

            // Ищем меню фильтров
            const $filterMenu = $('.selectbox__content .scroll__body');
            if (!$filterMenu.length) return;

            // Проверяем заголовок (должен быть "Фильтр")
            const $filterTitle = $('.selectbox__title');
            if (!$filterTitle.length || $filterTitle.text() !== Lampa.Lang.translate('title_filter')) return;

            // Ищем все серии на странице
            const episodes = [];
            $('.online.selector').each(function() {
                const $el = $(this);
                const title = $el.find('.online__title').text() || '';
                const epNum = extractEpisodeNumber(title);
                if (epNum > 0) {
                    episodes.push({
                        element: $el,
                        number: epNum,
                        title: title.trim()
                    });
                }
            });

            if (episodes.length === 0) return;

            // Создаем элемент меню
            const $filterItem = Lampa.Template.get('selectbox_item', {
                title: 'Диапазон серий',
                subtitle: 'Все серии'
            });

            // Добавляем обработчик
            $filterItem.on('hover:enter', function() {
                showSeriesRangeMenu($filterItem, episodes);
            });

            // Вставляем в меню (после первого элемента или в начало)
            const $firstItem = $filterMenu.find('.selectbox-item').first();
            if ($firstItem.length) {
                $firstItem.after($filterItem);
            } else {
                $filterMenu.prepend($filterItem);
            }

            // Обновляем навигацию
            Lampa.Controller.collectionSet($filterMenu);
        }

        // Функция извлечения номера серии
        function extractEpisodeNumber(text) {
            const match = text.match(/Серия\s(\d+)/i);
            return match ? parseInt(match[1]) : 0;
        }

        // Показ меню диапазонов
        function showSeriesRangeMenu($mainItem, episodes) {
            const $selectbox = $('body > .selectbox');
            const $content = $selectbox.find('.selectbox__content');
            const $head = $content.find('.selectbox__head');
            const $body = $content.find('.selectbox__body');
            const $scrollBody = $body.find('.scroll__body');

            // Сохраняем оригинальное меню
            const originalMenu = $scrollBody.html();
            const originalTitle = $head.find('.selectbox__title').text();

            // Очищаем и создаем новое меню
            $scrollBody.empty();
            $head.find('.selectbox__title').text('Диапазон серий');

            // Сортируем серии
            episodes.sort((a, b) => a.number - b.number);
            const totalEpisodes = episodes[episodes.length - 1].number;
            const rangeSize = totalEpisodes > 100 ? 50 : 25;

            // Добавляем "Все серии"
            const $allItem = Lampa.Template.get('selectbox_item', {
                title: 'Все серии',
                subtitle: episodes.length + ' серий'
            });

            $allItem.on('hover:enter', function() {
                episodes.forEach(ep => ep.element.show());
                $mainItem.find('.selectbox-item__subtitle').text('Все серии');
                restoreMenu();
            });

            $scrollBody.append($allItem);

            // Добавляем диапазоны
            for (let i = 1; i <= totalEpisodes; i += rangeSize) {
                const end = Math.min(i + rangeSize - 1, totalEpisodes);
                const count = episodes.filter(ep => ep.number >= i && ep.number <= end).length;
                
                if (count === 0) continue;

                const $rangeItem = Lampa.Template.get('selectbox_item', {
                    title: i + '-' + end,
                    subtitle: count + ' серий'
                });

                $rangeItem.on('hover:enter', function() {
                    episodes.forEach(ep => {
                        ep.element.toggle(ep.number >= i && ep.number <= end);
                    });
                    $mainItem.find('.selectbox-item__subtitle').text(i + '-' + end);
                    restoreMenu();
                });

                $scrollBody.append($rangeItem);
            }

            function restoreMenu() {
                $scrollBody.html(originalMenu);
                $head.find('.selectbox__title').text(originalTitle);
                Lampa.Controller.collectionSet($scrollBody);
                Lampa.Controller.collectionFocus($scrollBody.find('.selectbox-item').first());
            }

            Lampa.Controller.collectionSet($scrollBody);
            Lampa.Controller.collectionFocus($scrollBody.find('.selectbox-item').first());
        }

        // Отслеживаем открытие меню
        Lampa.Controller.listener.follow('toggle', function(e) {
            if (e.name === 'select') {
                // Даем время на отрисовку меню
                setTimeout(addSeriesFilter, 100);
            }
        });
    }

    // Запускаем после готовности приложения
    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') init();
        });
    }
})();