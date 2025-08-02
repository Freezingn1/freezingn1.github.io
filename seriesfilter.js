(function() {
    'use strict';
    
    // 1. Ждем полной загрузки Lampa
    function waitForLampa() {
        if (window.Lampa && window.Lampa.Template) {
            initPlugin();
        } else {
            setTimeout(waitForLampa, 300);
        }
    }
    
    // 2. Основная функция плагина
    function initPlugin() {
        // Защита от повторной инициализации
        if (window.seriesFilterInstalled) return;
        window.seriesFilterInstalled = true;
        
        // Функция для добавления фильтра в меню
        function injectSeriesFilter() {
            // Находим контейнер меню
            const $menu = $('body > .selectbox .scroll__body');
            if (!$menu.length) return;
            
            // Ищем все серии на странице
            const episodes = [];
            $('.online.selector').each(function() {
                const $el = $(this);
                const title = $el.find('.online__title').text() || '';
                const epNum = parseInt(title.match(/Серия\s(\d+)/i)?.[1]) || 0;
                if (epNum > 0) {
                    episodes.push({
                        element: $el,
                        number: epNum
                    });
                }
            });
            
            if (episodes.length === 0) return;
            
            // Создаем элемент меню
            const $filterItem = Lampa.Template.get('selectbox_item', {
                title: 'Диапазон серий',
                subtitle: 'Все серии'
            });
            
            // Обработчик клика
            $filterItem.on('hover:enter', function() {
                createRangeMenu(episodes, $filterItem);
            });
            
            // Вставляем в меню
            $menu.prepend($filterItem);
            Lampa.Controller.collectionSet($menu);
        }
        
        // Создаем меню диапазонов
        function createRangeMenu(episodes, $parentItem) {
            const $selectbox = $('body > .selectbox');
            const $content = $selectbox.find('.selectbox__content');
            const $head = $content.find('.selectbox__head');
            const $body = $content.find('.selectbox__body');
            const $scroll = $body.find('.scroll__body');
            
            // Сохраняем оригинальное меню
            const originalHTML = $scroll.html();
            const originalTitle = $head.find('.selectbox__title').text();
            
            // Очищаем и создаем новое меню
            $scroll.empty();
            $head.find('.selectbox__title').text('Диапазон серий');
            
            // Добавляем "Все серии"
            const $all = Lampa.Template.get('selectbox_item', {
                title: 'Все серии',
                subtitle: episodes.length + ' серий'
            });
            
            $all.on('hover:enter', function() {
                episodes.forEach(ep => ep.element.show());
                $parentItem.find('.selectbox-item__subtitle').text('Все серии');
                restoreOriginalMenu();
            });
            
            $scroll.append($all);
            
            // Создаем диапазоны
            const totalEpisodes = Math.max(...episodes.map(ep => ep.number));
            const rangeSize = totalEpisodes > 100 ? 50 : 25;
            
            for (let start = 1; start <= totalEpisodes; start += rangeSize) {
                const end = Math.min(start + rangeSize - 1, totalEpisodes);
                const count = episodes.filter(ep => ep.number >= start && ep.number <= end).length;
                
                if (count === 0) continue;
                
                const $range = Lampa.Template.get('selectbox_item', {
                    title: `${start}-${end}`,
                    subtitle: `${count} серий`
                });
                
                $range.on('hover:enter', function() {
                    episodes.forEach(ep => {
                        ep.element.toggle(ep.number >= start && ep.number <= end);
                    });
                    $parentItem.find('.selectbox-item__subtitle').text(`${start}-${end}`);
                    restoreOriginalMenu();
                });
                
                $scroll.append($range);
            }
            
            function restoreOriginalMenu() {
                $scroll.html(originalHTML);
                $head.find('.selectbox__title').text(originalTitle);
                Lampa.Controller.collectionSet($scroll);
            }
            
            Lampa.Controller.collectionSet($scroll);
            Lampa.Controller.collectionFocus($scroll.find('.selectbox-item').first());
        }
        
        // Постоянно проверяем наличие меню
        setInterval(() => {
            if ($('body > .selectbox').is(':visible')) {
                injectSeriesFilter();
            }
        }, 1000);
    }
    
    // Запускаем ожидание Lampa
    waitForLampa();
})();