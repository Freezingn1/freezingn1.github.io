(function() {
    // Функция для извлечения номера серии
    function extractEpisodeNumber(text) {
        const match = text.match(/(?:Серия|S)\s*(\d+)/i);
        return match ? parseInt(match[1]) : 0;
    }

    // Основная функция
    function initEpisodesFilter() {
        // Находим все элементы серий
        const episodeElements = Array.from(document.querySelectorAll('.online.selector'));
        if (episodeElements.length === 0) return;

        // Собираем данные о сериях
        const episodes = episodeElements.map(el => {
            const title = el.querySelector('.online__title')?.textContent || '';
            return {
                element: el,
                number: extractEpisodeNumber(title),
                title: title.trim()
            };
        }).filter(ep => ep.number > 0);

        if (episodes.length === 0) return;

        // Сортируем по номеру
        episodes.sort((a, b) => a.number - b.number);
        const totalEpisodes = episodes[episodes.length - 1].number;
        
        // Определяем размер диапазона
        let rangeSize = 25;
        if (totalEpisodes > 100) rangeSize = 50;
        if (totalEpisodes > 200) rangeSize = 100;

        // Создаем диапазоны
        const ranges = [];
        for (let i = 1; i <= totalEpisodes; i += rangeSize) {
            const end = Math.min(i + rangeSize - 1, totalEpisodes);
            ranges.push({ start: i, end });
        }

        // Находим меню фильтров
        const filterMenu = document.querySelector('.selectbox__content .scroll__body');
        if (!filterMenu) return;

        // Сохраняем оригинальное содержимое меню
        const originalMenuContent = filterMenu.innerHTML;
        const originalTitle = document.querySelector('.selectbox__title');

        // Создаем пункт "Диапазон серий"
        const episodeFilterItem = document.createElement('div');
        episodeFilterItem.className = 'selectbox-item selector';
        episodeFilterItem.innerHTML = `
            <div class="selectbox-item__title">Диапазон серий</div>
            <div class="selectbox-item__subtitle">Все серии</div>
        `;

        // Вставляем после пункта "Сезон" или в конец
        const seasonItem = Array.from(filterMenu.querySelectorAll('.selectbox-item'))
            .find(item => item.querySelector('.selectbox-item__title')?.textContent.includes('Сезон'));
        
        if (seasonItem) {
            seasonItem.after(episodeFilterItem);
        } else {
            filterMenu.appendChild(episodeFilterItem);
        }

        // Функция для восстановления оригинального меню
        function restoreOriginalMenu() {
            if (!originalMenuContent || !originalTitle) return;
            filterMenu.innerHTML = originalMenuContent;
            originalTitle.textContent = 'Фильтр';
            // Повторно добавляем наш пункт в меню
            const newSeasonItem = Array.from(filterMenu.querySelectorAll('.selectbox-item'))
                .find(item => item.querySelector('.selectbox-item__title')?.textContent.includes('Сезон'));
            if (newSeasonItem) {
                newSeasonItem.after(episodeFilterItem);
            } else {
                filterMenu.appendChild(episodeFilterItem);
            }
        }

        // Обработчик клика на пункте "Диапазон серий"
        episodeFilterItem.addEventListener('click', function() {
            const selectboxTitle = document.querySelector('.selectbox__title');
            if (!selectboxTitle) return;

            // Меняем заголовок
            selectboxTitle.textContent = 'Диапазон серий';

            // Очищаем меню
            filterMenu.innerHTML = '';

            // Добавляем пункт "Все серии"
            const allItem = document.createElement('div');
            allItem.className = 'selectbox-item selector focus';
            allItem.innerHTML = `
                <div class="selectbox-item__title">Все серии</div>
                <div class="selectbox-item__subtitle">${episodes.length} серий</div>
            `;
            allItem.addEventListener('click', function() {
                episodeElements.forEach(el => el.style.display = '');
                episodeFilterItem.querySelector('.selectbox-item__subtitle').textContent = 'Все серии';
                restoreOriginalMenu();
            });
            filterMenu.appendChild(allItem);

            // Добавляем диапазоны
            ranges.forEach(range => {
                const count = episodes.filter(ep => ep.number >= range.start && ep.number <= range.end).length;
                if (count === 0) return;

                const rangeItem = document.createElement('div');
                rangeItem.className = 'selectbox-item selector';
                rangeItem.innerHTML = `
                    <div class="selectbox-item__title">${range.start}-${range.end}</div>
                    <div class="selectbox-item__subtitle">${count} серий</div>
                `;
                rangeItem.addEventListener('click', function() {
                    episodeElements.forEach(el => {
                        const num = extractEpisodeNumber(el.querySelector('.online__title')?.textContent || '');
                        el.style.display = (num >= range.start && num <= range.end) ? '' : 'none';
                    });
                    episodeFilterItem.querySelector('.selectbox-item__subtitle').textContent = `${range.start}-${range.end}`;
                    restoreOriginalMenu();
                });
                filterMenu.appendChild(rangeItem);
            });

            // Добавляем кнопку "Назад"
            const backItem = document.createElement('div');
            backItem.className = 'selectbox-item selector';
            backItem.innerHTML = '<div class="selectbox-item__title">Назад</div>';
            backItem.addEventListener('click', restoreOriginalMenu);
            filterMenu.appendChild(backItem);
        });
    }

    // Запускаем после загрузки страницы
    if (document.readyState === 'complete') {
        initEpisodesFilter();
    } else {
        window.addEventListener('load', initEpisodesFilter);
    }
})();