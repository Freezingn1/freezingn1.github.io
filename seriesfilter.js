(function() {
    // 1. Конфигурация
    const config = {
        checkDelay: 500,
        maxAttempts: 20,
        rangeSize: 25
    };

    // 2. Функция инициализации при активации HDRezka
    function initOnHDRezka() {
        let attempts = 0;

        const checkHDRezka = () => {
            attempts++;
            
            // Ищем кнопку HDRezka в меню
            const hdRezkaItem = [...document.querySelectorAll('.selectbox-item__title')]
                .find(item => item.textContent.trim() === 'HDRezka');
            
            if (hdRezkaItem) {
                // Нашли HDRezka - запускаем наш плагин
                initPlugin();
            } 
            else if (attempts < config.maxAttempts) {
                setTimeout(checkHDRezka, config.checkDelay);
            }
        };

        checkHDRezka();
    }

    // 3. Основная функция плагина
    function initPlugin() {
        let attempts = 0;

        const checkElements = () => {
            attempts++;
            
            const hasEpisodes = document.querySelectorAll('.online.selector').length > 0;
            const hasFilterMenu = document.querySelector('.selectbox__content .scroll__body');
            
            if (hasEpisodes && hasFilterMenu) {
                setupFilter();
            } 
            else if (attempts < config.maxAttempts) {
                setTimeout(checkElements, config.checkDelay);
            }
        };

        checkElements();
    }

    // 4. Настройка фильтра (аналогично предыдущему варианту)
    function setupFilter() {
        const getEpisodeNum = (text) => {
            const match = text.match(/Серия\s(\d+)/i);
            return match ? parseInt(match[1]) : 0;
        };

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

        episodes.sort((a, b) => a.number - b.number);
        const lastEpisode = episodes[episodes.length - 1].number;
        const ranges = [];
        
        for (let i = 1; i <= lastEpisode; i += config.rangeSize) {
            ranges.push({
                start: i,
                end: Math.min(i + config.rangeSize - 1, lastEpisode)
            });
        }

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

        filterItem.addEventListener('click', () => {
            const selectbox = document.querySelector('.selectbox__content');
            const header = selectbox.querySelector('.selectbox__head .selectbox__title');
            const body = selectbox.querySelector('.scroll__body');
            
            const original = {
                title: header.textContent,
                content: body.innerHTML
            };

            header.textContent = 'Выберите диапазон';
            body.innerHTML = '';

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

            addItem('Все серии', `${episodes.length} серий`, () => {
                episodes.forEach(ep => ep.element.style.display = '');
                filterItem.querySelector('.selectbox-item__subtitle').textContent = 'Все серии';
                resetMenu();
            });

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

            function resetMenu() {
                header.textContent = original.title;
                body.innerHTML = original.content;
                setTimeout(setupFilter, 100);
            }
        });
    }

    // 5. Запускаем мониторинг появления HDRezka
    document.addEventListener('DOMContentLoaded', initOnHDRezka);
    window.addEventListener('load', initOnHDRezka);
    
    // Для динамической подгрузки в Lampa
    if (window.lampa && lampa.router) {
        const originalRender = lampa.router.render;
        lampa.router.render = function() {
            originalRender.apply(this, arguments);
            setTimeout(initOnHDRezka, 1000);
        };
    }
})();