(function() {
    'use strict';
    
    // Защита от повторной инициализации
    if (window.seriesFilterInstalled) return;
    window.seriesFilterInstalled = true;
    
    // Ожидаем загрузки Lampa
    function waitForLampa() {
        if (window.Lampa && window.Lampa.Template) {
            initPlugin();
        } else {
            setTimeout(waitForLampa, 300);
        }
    }
    
    function initPlugin() {
        // Переменная для хранения текущего элемента фильтра
        let currentFilterItem = null;
        
        // Функция проверки контекста
        function isCorrectContext() {
            // Проверяем что это главное меню фильтра
            const $filterTitle = $('.selectbox__title');
            if ($filterTitle.length !== 1 || $filterTitle.text() !== Lampa.Lang.translate('title_filter')) {
                return false;
            }
            
            // Проверяем что это раздел с сериями
            const active = Lampa.Activity.active();
            const componentName = active.component.toLowerCase();
            return (componentName === 'online' || componentName === 'lampac' || componentName.indexOf('bwa') === 0);
        }
        
        // Основная функция добавления фильтра
        function addSeriesFilter() {
            // Проверяем контекст
            if (!isCorrectContext()) {
                if (currentFilterItem) {
                    currentFilterItem.remove();
                    currentFilterItem = null;
                }
                return;
            }
            
            // Если фильтр уже добавлен - выходим
            if (currentFilterItem && $('body').find(currentFilterItem).length) return;
            
            // Находим серии
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
            currentFilterItem = Lampa.Template.get('selectbox_item', {
                title: 'Диапазон серий',
                subtitle: 'Все серии'
            });
            
            // Обработчик клика
            currentFilterItem.on('hover:enter', function() {
                if (!isCorrectContext()) return;
                createRangeMenu(episodes, currentFilterItem);
            });
            
            // Вставляем в меню после первого элемента
            const $firstItem = $('.selectbox-item').first();
            if ($firstItem.length) {
                $firstItem.after(currentFilterItem);
            } else {
                $('body > .selectbox .scroll__body').prepend(currentFilterItem);
            }
            
            Lampa.Controller.collectionSet($('body > .selectbox .scroll__body'));
        }
        
        // Создание меню диапазонов
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
        
        // Отслеживаем открытие меню
        Lampa.Controller.listener.follow('toggle', function(e) {
            if (e.name === 'select') {
                setTimeout(addSeriesFilter, 300);
            }
        });
        
        // Также проверяем периодически на случай если событие не сработало
        const checkInterval = setInterval(() => {
            if ($('body > .selectbox').is(':visible')) {
                addSeriesFilter();
            }
        }, 1000);
        
        // Очистка при закрытии приложения
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'close') {
                clearInterval(checkInterval);
                if (currentFilterItem) {
                    currentFilterItem.remove();
                    currentFilterItem = null;
                }
            }
        });
    }
    
    // Запускаем
    waitForLampa();
})();