(function() {
    // Конфигурация
    const config = {
        checkInterval: 500,
        maxAttempts: 30,
        rangeSize: 25
    };

    // Главная функция инициализации
    function initPluginSystem() {
        let hdrezkaFound = false;
        let pluginInitialized = false;
        let attempts = 0;

        const observer = new MutationObserver(() => {
            checkHDRezka();
        });

        // Начинаем наблюдение за DOM
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        function checkHDRezka() {
            if (hdrezkaFound) return;
            
            attempts++;
            const hdrezkaItems = [...document.querySelectorAll('.selectbox-item__title')]
                .filter(item => item.textContent.trim() === 'HDRezka');

            if (hdrezkaItems.length > 0) {
                hdrezkaFound = true;
                observer.disconnect();
                initPlugin();
            } 
            else if (attempts >= config.maxAttempts) {
                observer.disconnect();
                console.log('SeriesFilter: HDRezka не найден');
            }
        }

        function initPlugin() {
            if (pluginInitialized) return;
            
            let initAttempts = 0;
            const checkElements = () => {
                initAttempts++;
                
                const episodes = document.querySelectorAll('.online.selector');
                const filterMenu = document.querySelector('.selectbox__content .scroll__body');
                
                if (episodes.length > 0 && filterMenu) {
                    pluginInitialized = true;
                    setupSeriesFilter(episodes, filterMenu);
                } 
                else if (initAttempts < config.maxAttempts) {
                    setTimeout(checkElements, config.checkInterval);
                }
            };

            checkElements();
        }

        function setupSeriesFilter(episodeElements, menuContainer) {
            // Функция извлечения номера серии
            const getEpisodeNum = (el) => {
                const title = el.querySelector('.online__title')?.textContent || '';
                const match = title.match(/Серия\s(\d+)/i);
                return match ? parseInt(match[1]) : 0;
            };

            // Подготовка данных о сериях
            const episodes = Array.from(episodeElements)
                .map(el => ({ element: el, number: getEpisodeNum(el) }))
                .filter(ep => ep.number > 0)
                .sort((a, b) => a.number - b.number);

            if (episodes.length === 0) return;

            // Создание диапазонов
            const lastEpisode = episodes[episodes.length - 1].number;
            const ranges = [];
            for (let i = 1; i <= lastEpisode; i += config.rangeSize) {
                ranges.push({
                    start: i,
                    end: Math.min(i + config.rangeSize - 1, lastEpisode)
                });
            }

            // Создание пункта меню
            const seasonItem = [...menuContainer.querySelectorAll('.selectbox-item')]
                .find(item => item.textContent.includes('Сезон'));

            const filterItem = document.createElement('div');
            filterItem.className = 'selectbox-item selector';
            filterItem.innerHTML = `
                <div class="selectbox-item__title">Диапазон серий</div>
                <div class="selectbox-item__subtitle">Все серии</div>
            `;

            // Вставка в меню
            const referenceNode = seasonItem || menuContainer.lastElementChild;
            referenceNode.after(filterItem);

            // Обработчик клика
            filterItem.addEventListener('click', () => {
                const selectbox = document.querySelector('.selectbox__content');
                if (!selectbox) return;

                const header = selectbox.querySelector('.selectbox__head .selectbox__title');
                const body = selectbox.querySelector('.scroll__body');
                
                // Сохраняем оригинальное состояние
                const originalState = {
                    title: header.textContent,
                    content: body.innerHTML
                };

                // Обновляем интерфейс
                header.textContent = 'Диапазон серий';
                body.innerHTML = '';

                // Функция добавления пункта
                const addMenuItem = (title, subtitle, onClick) => {
                    const item = document.createElement('div');
                    item.className = 'selectbox-item selector';
                    item.innerHTML = `
                        <div class="selectbox-item__title">${title}</div>
                        <div class="selectbox-item__subtitle">${subtitle}</div>
                    `;
                    item.addEventListener('click', onClick);
                    body.appendChild(item);
                    return item;
                };

                // "Все серии"
                addMenuItem('Все серии', `${episodes.length} серий`, () => {
                    episodes.forEach(ep => ep.element.style.display = '');
                    filterItem.querySelector('.selectbox-item__subtitle').textContent = 'Все серии';
                    restoreMenu();
                });

                // Диапазоны серий
                ranges.forEach(range => {
                    const count = episodes.filter(ep => 
                        ep.number >= range.start && ep.number <= range.end
                    ).length;
                    
                    if (count > 0) {
                        addMenuItem(
                            `${range.start}-${range.end}`,
                            `${count} серий`,
                            () => {
                                episodes.forEach(ep => {
                                    ep.element.style.display = 
                                        (ep.number >= range.start && ep.number <= range.end) 
                                        ? '' 
                                        : 'none';
                                });
                                filterItem.querySelector('.selectbox-item__subtitle').textContent = 
                                    `${range.start}-${range.end}`;
                                restoreMenu();
                            }
                        );
                    }
                });

                // Восстановление меню
                function restoreMenu() {
                    header.textContent = originalState.title;
                    body.innerHTML = originalState.content;
                    // Обновляем плагин
                    setTimeout(() => setupSeriesFilter(
                        document.querySelectorAll('.online.selector'),
                        document.querySelector('.selectbox__content .scroll__body')
                    ), 100);
                }
            });
        }
    }

    // Запуск системы
    if (document.readyState === 'complete') {
        initPluginSystem();
    } else {
        window.addEventListener('load', initPluginSystem);
        document.addEventListener('DOMContentLoaded', initPluginSystem);
    }

    // Для динамических страниц в Lampa
    if (window.lampa && lampa.router) {
        const originalRender = lampa.router.render;
        lampa.router.render = function() {
            originalRender.apply(this, arguments);
            setTimeout(initPluginSystem, 1000);
        };
    }
})();