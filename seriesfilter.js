(function () {
    'use strict';

    function extractEpisodeNumber(text) {
        const match = text.match(/Серия\s(\d+)/i);
        return match ? parseInt(match[1]) : 0;
    }

    function createEpisodeFilter() {
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

        const $selectBoxItem = Lampa.Template.get('selectbox_item', {
            title: 'Диапазон серий',
            subtitle: 'Все серии'
        });

        $selectBoxItem.on('hover:enter', function () {
            const selectboxContent = $('.selectbox__content');
            const selectboxHead = selectboxContent.find('.selectbox__head');
            const selectboxBody = selectboxContent.find('.selectbox__body');
            const scrollBody = selectboxBody.find('.scroll__body');

            scrollBody.empty();

            // Add "All episodes" option
            const $allItem = Lampa.Template.get('selectbox_item', {
                title: 'Все серии',
                subtitle: episodes.length + ' серий'
            });

            $allItem.on('hover:enter', function () {
                episodeElements.forEach(el => el.style.display = '');
                $selectBoxItem.find('.selectbox-item__subtitle').text('Все серии');
                selectboxHead.find('.selectbox__title').text('Фильтр');
                Lampa.Controller.toggle('back');
            });

            scrollBody.append($allItem);

            // Add range options
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
                    episodeElements.forEach(el => {
                        const num = extractEpisodeNumber(el.querySelector('.online__title')?.textContent || '');
                        el.style.display = (num >= range.start && num <= range.end) ? '' : 'none';
                    });
                    $selectBoxItem.find('.selectbox-item__subtitle').text(range.start + '-' + range.end);
                    selectboxHead.find('.selectbox__title').text('Фильтр');
                    Lampa.Controller.toggle('back');
                });

                scrollBody.append($rangeItem);
            });

            selectboxHead.find('.selectbox__title').text('Диапазон серий');
            Lampa.Controller.collectionSet(scrollBody);
            Lampa.Controller.collectionFocus(scrollBody.find('.selectbox-item').first());
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

            if (componentName !== 'online' && componentName !== 'lampac' && componentName.indexOf('bwa') !== 0) {
                return;
            }

            const $filterTitle = $('.selectbox__title');
            if ($filterTitle.length !== 1 || $filterTitle.text() !== Lampa.Lang.translate('title_filter')) {
                return;
            }

            const $episodeFilterItem = createEpisodeFilter();
            if (!$episodeFilterItem) return;

            const $selectOptions = $('.selectbox-item');
            if ($selectOptions.length > 0) {
                $selectOptions.first().after($episodeFilterItem);
            } else {
                $('body > .selectbox').find('.scroll__body').prepend($episodeFilterItem);
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