(function() {
    // Конфигурация
    const CONFIG = {
        checkInterval: 1000, // Проверять наличие элементов каждую секунду
        maxChecks: 10,       // Максимальное количество проверок
        rangeSize: 25        // Серий в одном диапазоне
    };

    // Основная функция
    function initSeriesFilter() {
        let checkCount = 0;
        
        const intervalId = setInterval(() => {
            // Проверяем, загрузились ли серии и меню
            const hasEpisodes = document.querySelectorAll('.online.selector').length > 0;
            const hasFilterMenu = document.querySelector('.selectbox__content .scroll__body');
            
            if (hasEpisodes && hasFilterMenu) {
                clearInterval(intervalId);
                setupSeriesFilter();
            } else if (checkCount >= CONFIG.maxChecks) {
                clearInterval(intervalId);
                console.log('SeriesFilter: Не удалось инициализировать');
            }
            checkCount++;
        }, CONFIG.checkInterval);
    }

    function setupSeriesFilter() {
        // Извлечение номеров серий
        const extractEpisodeNum = (text) => {
            const match = text.match(/Серия\s(\d+)/i);
            return match ? parseInt(match[1]) : 0;
        };

        // Получение элементов
        const episodeElements = Array.from(document.querySelectorAll('.online.selector'));
        const episodes = episodeElements.map(el => {
            const title = el.querySelector('.online__title')?.textContent || '';
            return {
                element: el,
                number: extractEpisodeNum(title)
            };
        }).filter(ep => ep.number > 0);

        if (episodes.length === 0) return;

        // Сортировка и определение диапазонов
        episodes.sort((a, b) => a.number - b.number);
        const totalEpisodes = episodes[episodes.length - 1].number;
        const ranges = [];
        
        for (let i = 1; i <= totalEpisodes; i += CONFIG.rangeSize) {
            ranges.push({
                start: i,
                end: Math.min(i + CONFIG.rangeSize - 1, totalEpisodes)
            });
        }

        // Создание элемента фильтра
        const filterMenu = document.querySelector('.selectbox__content .scroll__body');
        const seasonItem = [...filterMenu.querySelectorAll('.selectbox-item')]
            .find(item => item.querySelector('.selectbox-item__title')?.textContent.includes('Сезон'));

        const episodeFilterItem = document.createElement('div');
        episodeFilterItem.className = 'selectbox-item selector';
        episodeFilterItem.innerHTML = `
            <div class="selectbox-item__title">Диапазон серий</div>
            <div class="selectbox-item__subtitle">Все серии</div>
        `;

        if (seasonItem) {
            seasonItem.after(episodeFilterItem);
        } else {
            filterMenu.prepend(episodeFilterItem);
        }

        // Обработчик клика
        episodeFilterItem.addEventListener('click', () => {
            const selectboxContent = document.querySelector('.selectbox__content');
            const selectboxHead = selectboxContent.querySelector('.selectbox__head');
            const scrollBody = selectboxContent.querySelector('.scroll__body');
            
            // Сохраняем оригинальное состояние
            const originalContent = scrollBody.innerHTML;
            const originalTitle = selectboxHead.textContent;
            
            // Обновляем интерфейс
            selectboxHead.querySelector('.selectbox__title').textContent = 'Диапазон серий';
            scrollBody.innerHTML = '';

            // Добавляем варианты
            const addMenuItem = (title, subtitle, action) => {
                const item = document.createElement('div');
                item.className = 'selectbox-item selector';
                item.innerHTML = `
                    <div class="selectbox-item__title">${title}</div>
                    <div class="selectbox-item__subtitle">${subtitle}</div>
                `;
                item.addEventListener('click', action);
                scrollBody.appendChild(item);
            };

            // "Все серии"
            addMenuItem('Все серии', `${episodes.length} серий`, () => {
                episodeElements.forEach(el => el.style.display = '');
                episodeFilterItem.querySelector('.selectbox-item__subtitle').textContent = 'Все серии';
                selectboxHead.querySelector('.selectbox__title').textContent = originalTitle;
                scrollBody.innerHTML = originalContent;
                setupSeriesFilter(); // Реинициализация
            });

            // Диапазоны
            ranges.forEach(range => {
                const count = episodes.filter(ep => ep.number >= range.start && ep.number <= range.end).length;
                if (count > 0) {
                    addMenuItem(
                        `${range.start}-${range.end}`,
                        `${count} серий`,
                        () => {
                            episodeElements.forEach(el => {
                                const num = extractEpisodeNum(el.querySelector('.online__title')?.textContent || '');
                                el.style.display = (num >= range.start && num <= range.end) ? '' : 'none';
                            });
                            episodeFilterItem.querySelector('.selectbox-item__subtitle').textContent = `${range.start}-${range.end}`;
                            selectboxHead.querySelector('.selectbox__title').textContent = originalTitle;
                            scrollBody.innerHTML = originalContent;
                            setupSeriesFilter();
                        }
                    );
                }
            });
        });
    }

    // Запускаем при полной загрузке страницы
    if (document.readyState === 'complete') {
        initSeriesFilter();
    } else {
        window.addEventListener('load', initSeriesFilter);
        document.addEventListener('DOMContentLoaded', initSeriesFilter);
    }
})();