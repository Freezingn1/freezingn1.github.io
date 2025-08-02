(function () {
    'use strict';

    function extractEpisodeNumber(text) {
        const match = text.match(/Серия\s(\d+)/i);
        return match ? parseInt(match[1]) : 0;
    }

    function createEpisodeRanges(episodes) {
        if (episodes.length === 0) return [];

        episodes.sort((a, b) => a.number - b.number);
        const totalEpisodes = episodes[episodes.length - 1].number;
        const rangeSize = totalEpisodes > 100 ? 50 : 25;

        const ranges = [];
        for (let i = 1; i <= totalEpisodes; i += rangeSize) {
            ranges.push({
                start: i,
                end: Math.min(i + rangeSize - 1, totalEpisodes)
            });
        }
        return ranges;
    }

    function showEpisodeRangeMenu($mainFilterItem, episodes, ranges) {
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

        // Добавляем пункт "Все серии"
        const $allItem = Lampa.Template.get('selectbox_item', {
            title: 'Все серии',
            subtitle: episodes.length + ' серий'
        });

        $allItem.on('hover:enter', function () {
            episodes.forEach(ep => ep.element.style.display = '');
            $mainFilterItem.find('.selectbox-item__subtitle').text('Все серии');
            restoreOriginalMenu();
        });

        $scrollBody.append($allItem);

        // Добавляем диапазоны
        ranges.forEach(range => {
            const count = episodes.filter(ep => 
                ep.number >= range.start && ep.number <= range.end
            ).length;
            
            if (count === 0) return;

            const $rangeItem = Lampa.Template.get('selectbox_item', {
                title: range.start + '-' + range.end,
                subtitle: count + ' серий'
            });

            $rangeItem.on('hover:enter', function () {
                episodes.forEach(ep => {
                    ep.element.style.display = (ep.number >= range.start && ep.number <= range.end) ? '' : 'none';
                });
                $mainFilterItem.find('.selectbox-item__subtitle').text(range.start + '-' + range.end);
                restoreOriginalMenu();
            });

            $scrollBody.append($rangeItem);
        });

        function restoreOriginalMenu() {
            $scrollBody.html(originalMenu);
            $head.find('.selectbox__title').text(originalTitle);
            Lampa.Controller.collectionSet($scrollBody);
            Lampa.Controller.collectionFocus($scrollBody.find('.selectbox-item').first());
        }

        Lampa.Controller.collectionSet($scrollBody);
        Lampa.Controller.collectionFocus($scrollBody.find('.selectbox-item').first());
    }

    function addEpisodeFilter() {
        const episodeElements = Array.from(document.querySelectorAll('.online.selector'));
        const episodes = episodeElements.map(el => {
            const title = el.querySelector('.online__title')?.textContent || '';
            return {
                element: el,
                number: extractEpisodeNumber(title),
                title: title.trim()
            };
        }).filter(ep => ep.number > 0);

        if (episodes.length === 0) return null;

        const ranges = createEpisodeRanges(episodes);
        if (ranges.length === 0) return null;

        const $selectBoxItem = Lampa.Template.get('selectbox_item', {
            title: 'Диапазон серий',
            subtitle: 'Все серии'
        });

        $selectBoxItem.on('hover:enter', function () {
            showEpisodeRangeMenu($selectBoxItem, episodes, ranges);
        });

        return $selectBoxItem;
    }

    function start() {
        if (window.lampac_series_filter_plugin) return;
        window.lampac_series_filter_plugin = true;

        Lampa.Controller.listener.follow('toggle', function (event) {
            if (event.name !== 'select') return;

            const active = Lampa.Activity.active();
            const componentName = active.component.toLowerCase();

            // Проверяем, что находимся в нужном компоненте
            if (componentName !== 'online' && componentName !== 'lampac' && componentName.indexOf('bwa') !== 0) {
                return;
            }

            // Проверяем, что открыто меню фильтра
            const $filterTitle = $('.selectbox__title');
            if ($filterTitle.length !== 1 || $filterTitle.text() !== Lampa.Lang.translate('title_filter')) {
                return;
            }

            // Проверяем наличие кнопки фильтра (как в lampac-src-filter.js)
            const $filterBtn = $('.simple-button--filter.filter--sort');
            if ($filterBtn.length !== 1 || $filterBtn.hasClass('hide')) {
                return;
            }

            // Создаем и добавляем наш фильтр
            const $episodeFilter = addEpisodeFilter();
            if (!$episodeFilter) return;

            // Вставляем наш фильтр в меню
            const $selectOptions = $('.selectbox-item');
            if ($selectOptions.length > 0) {
                // Пытаемся вставить после пункта "Сезон", если он есть
                const $seasonItem = $selectOptions.filter((index, item) => {
                    return $(item).find('.selectbox-item__title').text().includes('Сезон');
                });
                
                if ($seasonItem.length > 0) {
                    $seasonItem.after($episodeFilter);
                } else {
                    $selectOptions.first().after($episodeFilter);
                }
            } else {
                $('body > .selectbox').find('.scroll__body').prepend($episodeFilter);
            }

            // Обновляем коллекцию для навигации
            Lampa.Controller.collectionSet($('body > .selectbox').find('.scroll__body'));
            Lampa.Controller.collectionFocus($('.selectbox-item').first());
        });
    }

    // Запускаем плагин после готовности приложения
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