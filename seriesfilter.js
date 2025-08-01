(function() {
    // 1. Ждём полной загрузки Lampa
    if (!window.lampa) {
        console.error('Lampa не найдена');
        return;
    }

    // 2. Конфигурация
    const config = {
        checkDelay: 500,     // Задержка проверки элементов
        maxAttempts: 20,     // Максимум попыток
        rangeSize: 25        // Серий в диапазоне
    };

    // 3. Основная функция
    function initPlugin() {
        let attempts = 0;

        const check = () => {
            attempts++;
            
            // Ищем необходимые элементы
            const hasEpisodes = document.querySelectorAll('.online.selector').length > 0;
            const hasFilterMenu = document.querySelector('.selectbox__content .scroll__body');
            
            if (hasEpisodes && hasFilterMenu) {
                setupFilter();
            } 
            else if (attempts < config.maxAttempts) {
                setTimeout(check, config.checkDelay);
            }
            else {
                console.log('SeriesFilter: Элементы не найдены');
            }
        };

        // Первая проверка
        setTimeout(check, 1000);
    }

    // 4. Настройка фильтра
    function setupFilter() {
        // Функция парсинга номера
        const getEpisodeNum = (text) => {
            const match = text.match(/Серия\s(\d+)/i);
            return match ? parseInt(match[1]) : 0;
        };

        // Получаем все серии
        const episodes = Array.from(document.querySelectorAll('.online.selector'))
            .map(el => {
                const title = el.querySelector('.online__title')?.textContent || '';
                return {
                    element: el,
                    number: getEpisodeNum(title)
                };
            })
            .filter(ep => ep.number > 0);

        if (!episodes.length) return;

        // Сортируем и создаём диапазоны
        episodes.sort((a, b) => a.number - b.number);
        const lastEpisode = episodes[episodes.length - 1].number;
        const ranges = [];
        
        for (let i = 1; i <= lastEpisode; i += config.rangeSize) {
            ranges.push({
                start: i,
                end: Math.min(i + config.rangeSize - 1, lastEpisode)
            });
        }

        // Создаём элемент в меню
        const menu = document.querySelector('.selectbox__content .scroll__body');
        const seasonItem = [...menu.querySelectorAll('.selectbox-item')]
            .find(item => item.textContent.includes('Сезон'));

        const filterItem = document.createElement('div');
        filterItem.className = 'selectbox-item selector';
        filterItem.innerHTML = `
            <div class="selectbox-item__title">Диапазон серий</div>
            <div class="selectbox-item__subtitle">Все серии</div>
        `;

        (seasonItem ? seasonItem : menu.lastElementChild).after(filterItem);

        // Обработчик клика
        filterItem.addEventListener('click', () => {
            const selectbox = document.querySelector('.selectbox__content');
            const header = selectbox.querySelector('.selectbox__head .selectbox__title');
            const body = selectbox.querySelector('.scroll__body');
            
            // Сохраняем оригинальное состояние
            const original = {
                title: header.textContent,
                content: body.innerHTML
            };

            // Обновляем интерфейс
            header.textContent = 'Выберите диапазон';
            body.innerHTML = '';

            // Функция добавления пункта
            const addItem = (title, subtitle, action) => {
                const item = document.createElement('div');
                item.className = 'selectbox-item selector';
                item.innerHTML = `
                    <div class="selectbox-item__title">${title}</div>
                    <div class="selectbox-item__subtitle">${subtitle}</div>
                `;
                item.addEventListener('click', action);
                body.appendChild(item);
            };

            // "Все серии"
            addItem('Все серии', `${episodes.length} серий`, () => {
                episodes.forEach(ep => ep.element.style.display = '');
                filterItem.querySelector('.selectbox-item__subtitle').textContent = 'Все серии';
                resetMenu();
            });

            // Добавляем диапазоны
            ranges.forEach(range => {
                const count = episodes.filter(ep => 
                    ep.number >= range.start && ep.number <= range.end
                ).length;
                
                if (count) {
                    addItem(`${range.start}-${range.end}`, `${count} серий`, () => {
                        episodes.forEach(ep => {
                            ep.element.style.display = 
                                (ep.number >= range.start && ep.number <= range.end) ? '' : 'none';
                        });
                        filterItem.querySelector('.selectbox-item__subtitle').textContent = 
                            `${range.start}-${range.end}`;
                        resetMenu();
                    });
                }
            });

            // Функция восстановления меню
            function resetMenu() {
                header.textContent = original.title;
                body.innerHTML = original.content;
                // Реинициализируем плагин
                setTimeout(setupFilter, 100);
            }
        });
    }

    // 5. Запуск
    document.addEventListener('DOMContentLoaded', initPlugin);
    window.addEventListener('load', initPlugin);
    
    // Для динамических страниц Lampa
    if (window.lampa && lampa.router) {
        const original = lampa.router.render;
        lampa.router.render = function() {
            original.apply(this, arguments);
            setTimeout(initPlugin, 1000);
        };
    }
})();