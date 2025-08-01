class SeriesFilter {
    constructor() {
        this.observer = null;
        this.attempts = 0;
        this.maxAttempts = 15;
        this.checkDelay = 500;
        
        this.init();
    }

    init() {
        if (this.isSeriesPage()) {
            this.startObservation();
        } else {
            document.addEventListener('lampa-page-changed', () => {
                if (this.isSeriesPage()) this.startObservation();
            });
        }
    }

    isSeriesPage() {
        return document.querySelector('.full-start-new__details')?.textContent.includes('Серии:');
    }

    startObservation() {
        this.observer = new MutationObserver(() => {
            this.trySetupFilter();
        });
        
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        this.trySetupFilter();
    }

    trySetupFilter() {
        if (this.attempts++ > this.maxAttempts) {
            this.observer?.disconnect();
            return;
        }

        if (this.checkElements()) {
            this.setupFilter();
            this.observer?.disconnect();
        } else {
            setTimeout(() => this.trySetupFilter(), this.checkDelay);
        }
    }

    checkElements() {
        return document.querySelectorAll('.online.selector').length > 0 && 
               document.querySelector('.selectbox__content .scroll__body');
    }

    setupFilter() {
        const extractNum = (text) => parseInt(text.match(/Серия\s(\d+)/i)?.[1]) || 0;
        
        const episodes = Array.from(document.querySelectorAll('.online.selector'))
            .map(el => ({
                element: el,
                number: extractNum(el.querySelector('.online__title')?.textContent || '')
            }))
            .filter(ep => ep.number > 0)
            .sort((a, b) => a.number - b.number);

        if (episodes.length === 0) return;

        const totalEpisodes = episodes[episodes.length - 1].number;
        const rangeSize = totalEpisodes > 100 ? 50 : 25;
        const ranges = [];

        for (let i = 1; i <= totalEpisodes; i += rangeSize) {
            ranges.push({
                start: i,
                end: Math.min(i + rangeSize - 1, totalEpisodes)
            });
        }

        const filterMenu = document.querySelector('.selectbox__content .scroll__body');
        const seasonItem = [...filterMenu.querySelectorAll('.selectbox-item')]
            .find(item => item.textContent.includes('Сезон'));

        const filterItem = document.createElement('div');
        filterItem.className = 'selectbox-item selector';
        filterItem.innerHTML = `
            <div class="selectbox-item__title">Диапазон серий</div>
            <div class="selectbox-item__subtitle">Все серии</div>
        `;

        seasonItem ? seasonItem.after(filterItem) : filterMenu.prepend(filterItem);

        filterItem.addEventListener('click', () => {
            const selectbox = document.querySelector('.selectbox__content');
            const header = selectbox.querySelector('.selectbox__head');
            const body = selectbox.querySelector('.scroll__body');
            const original = body.innerHTML;
            
            header.querySelector('.selectbox__title').textContent = 'Диапазон серий';
            body.innerHTML = '';

            const addOption = (title, count, action) => {
                const item = document.createElement('div');
                item.className = 'selectbox-item selector';
                item.innerHTML = `
                    <div class="selectbox-item__title">${title}</div>
                    <div class="selectbox-item__subtitle">${count} серий</div>
                `;
                item.addEventListener('click', action);
                body.appendChild(item);
            };

            addOption('Все серии', episodes.length, () => {
                episodes.forEach(ep => ep.element.style.display = '');
                filterItem.querySelector('.selectbox-item__subtitle').textContent = 'Все серии';
                header.querySelector('.selectbox__title').textContent = 'Фильтр';
                body.innerHTML = original;
                new SeriesFilter(); // Реинициализация
            });

            ranges.forEach(range => {
                const count = episodes.filter(ep => 
                    ep.number >= range.start && ep.number <= range.end
                ).length;
                
                if (count > 0) {
                    addOption(`${range.start}-${range.end}`, count, () => {
                        episodes.forEach(ep => {
                            ep.element.style.display = 
                                ep.number >= range.start && ep.number <= range.end ? '' : 'none';
                        });
                        filterItem.querySelector('.selectbox-item__subtitle').textContent = `${range.start}-${range.end}`;
                        header.querySelector('.selectbox__title').textContent = 'Фильтр';
                        body.innerHTML = original;
                        new SeriesFilter();
                    });
                }
            });
        });
    }
}

// Запуск при полной загрузке и при AJAX-навигации
if (document.readyState === 'complete') {
    new SeriesFilter();
} else {
    window.addEventListener('load', () => new SeriesFilter());
    document.addEventListener('DOMContentLoaded', () => new SeriesFilter());
}

// Для Lampa AJAX навигации
document.addEventListener('lampa-page-changed', () => {
    setTimeout(() => new SeriesFilter(), 500);
});