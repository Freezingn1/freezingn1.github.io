// Функция для точного извлечения номера серии
function extractEpisodeNumber(text) {
    const match = text.match(/Серия\s(\d+)/i);
    return match ? parseInt(match[1]) : 0;
}

// Функция создания фильтра серий
function addEpisodesFilterToMenu() {
    // Проверяем, не добавлен ли уже наш фильтр
    if (document.querySelector('.selectbox-item__title')?.textContent.includes('Диапазон серий')) {
        return;
    }

    // Находим все серии
    const episodeElements = Array.from(document.querySelectorAll('.online.selector'));
    const episodes = episodeElements.map(el => {
        const title = el.querySelector('.online__title')?.textContent || '';
        return {
            element: el,
            number: extractEpisodeNumber(title),
            title: title.trim()
        };
    }).filter(ep => ep.number > 0);

    if (episodes.length === 0) return;

    // Сортируем и определяем общее количество
    episodes.sort((a, b) => a.number - b.number);
    const totalEpisodes = episodes[episodes.length - 1].number;
    const rangeSize = totalEpisodes > 100 ? 50 : 25;

    // Создаем диапазоны
    const ranges = [];
    for (let i = 1; i <= totalEpisodes; i += rangeSize) {
        ranges.push({
            start: i,
            end: Math.min(i + rangeSize - 1, totalEpisodes)
        });
    }

    // Находим меню фильтров
    const filterMenu = document.querySelector('.selectbox__content .scroll__body');
    if (!filterMenu) return;

    // Находим пункт "Сезон"
    const seasonItem = Array.from(filterMenu.querySelectorAll('.selectbox-item'))
        .find(item => {
            const title = item.querySelector('.selectbox-item__title');
            return title && title.textContent.includes('Сезон');
        });

    // Создаем пункт "Диапазон серий"
    const episodeFilterItem = document.createElement('div');
    episodeFilterItem.className = 'selectbox-item selector';
    episodeFilterItem.innerHTML = `
        <div class="selectbox-item__title">Диапазон серий</div>
        <div class="selectbox-item__subtitle">Все серии</div>
    `;
    
    // Добавляем после пункта "Сезон" или в конец меню
    if (seasonItem) {
        seasonItem.after(episodeFilterItem);
    } else {
        filterMenu.appendChild(episodeFilterItem);
    }

    // Создаем обработчик для подменю
    episodeFilterItem.addEventListener('click', function() {
        // Находим основные элементы меню
        const selectboxContent = document.querySelector('.selectbox__content');
        const selectboxHead = selectboxContent.querySelector('.selectbox__head');
        const selectboxBody = selectboxContent.querySelector('.selectbox__body');
        
        if (!selectboxContent || !selectboxHead || !selectboxBody) return;

        // Очищаем тело меню
        selectboxBody.querySelector('.scroll__body').innerHTML = '';

        // Создаем контейнер для элементов
        const scrollBody = selectboxBody.querySelector('.scroll__body');

        // Кнопка "Все серии"
        const allItem = document.createElement('div');
        allItem.className = 'selectbox-item selector focus';
        allItem.innerHTML = `
            <div class="selectbox-item__title">Все серии</div>
            <div class="selectbox-item__subtitle">${episodes.length} серий</div>
        `;
        allItem.addEventListener('click', () => {
            episodeElements.forEach(el => el.style.display = '');
            episodeFilterItem.querySelector('.selectbox-item__subtitle').textContent = 'Все серии';
            selectboxHead.querySelector('.selectbox__title').textContent = 'Фильтр';
        });
        scrollBody.appendChild(allItem);

        // Добавляем варианты диапазонов
        ranges.forEach(range => {
            const count = episodes.filter(ep => 
                ep.number >= range.start && ep.number <= range.end
            ).length;
            
            if (count === 0) return;

            const rangeItem = document.createElement('div');
            rangeItem.className = 'selectbox-item selector';
            rangeItem.innerHTML = `
                <div class="selectbox-item__title">${range.start}-${range.end}</div>
                <div class="selectbox-item__subtitle">${count} серий</div>
            `;
            rangeItem.addEventListener('click', () => {
                episodeElements.forEach(el => {
                    const num = extractEpisodeNumber(el.querySelector('.online__title')?.textContent || '');
                    el.style.display = (num >= range.start && num <= range.end) ? '' : 'none';
                });
                episodeFilterItem.querySelector('.selectbox-item__subtitle').textContent = `${range.start}-${range.end}`;
                selectboxHead.querySelector('.selectbox__title').textContent = 'Фильтр';
            });
            scrollBody.appendChild(rangeItem);
        });
    });
}

// Функция для наблюдения за изменениями DOM
function observeDOM() {
    const observer = new MutationObserver(function(mutations) {
        // Проверяем, появилось ли нужное меню
        const filterMenu = document.querySelector('.selectbox__content .scroll__body');
        if (filterMenu) {
            addEpisodesFilterToMenu();
            // Можно отключить observer после нахождения элемента
            // observer.disconnect();
        }
    });

    // Начинаем наблюдение за изменениями в body и его потомках
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Запускаем наблюдение при загрузке страницы
document.addEventListener('DOMContentLoaded', observeDOM);