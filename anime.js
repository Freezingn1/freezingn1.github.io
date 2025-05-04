// Публичный API ключ TheMovieDB (v3 auth)
const TMDB_API_KEY = '8a8a1e62d9b9c49a50d280b5f6a9c3f4';

// Добавляем раздел "Аниме" в меню
function addAnimeSection() {
    // Проверяем, существует ли уже раздел "Аниме"
    if (!document.querySelector('.menu-section[data-section="anime"]')) {
        // Создаем HTML для раздела
        const animeSectionHTML = `
            <div class="menu-section" data-section="anime">
                <div class="menu-section__title">Аниме</div>
                <div class="menu-section__items">
                    <a href="#" class="menu-section__item" data-action="anime-list" data-list-id="146567">Лучшие аниме-сериалы</a>
                    <a href="#" class="menu-section__item" data-action="anime-top-rated">Топ по рейтингу</a>
                    <a href="#" class="menu-section__item" data-action="anime-popular">Популярные</a>
                    <a href="#" class="menu-section__item" data-action="anime-trending">В тренде</a>
                    <a href="#" class="menu-section__item" data-action="anime-upcoming">Скоро выйдет</a>
                </div>
            </div>
        `;
        
        // Вставляем раздел в меню
        const settingsSection = document.querySelector('.menu-section[data-section="settings"]');
        if (settingsSection) {
            settingsSection.insertAdjacentHTML('beforebegin', animeSectionHTML);
        } else {
            const menu = document.querySelector('.menu');
            if (menu) menu.insertAdjacentHTML('beforeend', animeSectionHTML);
        }
        
        // Добавляем обработчики событий
        document.querySelectorAll('.menu-section__item[data-action^="anime"]').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const action = this.getAttribute('data-action');
                const listId = this.getAttribute('data-list-id');
                loadAnimeList(action, listId);
            });
        });
    }
}

// Загружаем список аниме
async function loadAnimeList(type, listId = null) {
    try {
        let url, params = { language: 'ru-RU' };
        
        switch(type) {
            case 'anime-list':
                if (!listId) return;
                url = `https://api.themoviedb.org/3/list/${listId}`;
                break;
                
            case 'anime-top-rated':
                url = 'https://api.themoviedb.org/3/discover/tv';
                params = {
                    ...params,
                    with_genres: 16,
                    sort_by: 'vote_average.desc',
                    vote_count: 100
                };
                break;
                
            case 'anime-popular':
                url = 'https://api.themoviedb.org/3/tv/popular';
                params = {
                    ...params,
                    with_genres: 16
                };
                break;
                
            case 'anime-trending':
                url = 'https://api.themoviedb.org/3/trending/tv/week';
                params = {
                    ...params,
                    with_genres: 16
                };
                break;
                
            case 'anime-upcoming':
                url = 'https://api.themoviedb.org/3/discover/tv';
                params = {
                    ...params,
                    with_genres: 16,
                    sort_by: 'first_air_date.desc',
                    'first_air_date.gte': new Date().toISOString().split('T')[0]
                };
                break;
        }
        
        // Показываем loader
        Lampa.Loader.show();
        
        // Делаем запрос
        const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
            headers: {
                'Authorization': `Bearer ${TMDB_API_KEY}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        // Обрабатываем результаты
        const items = data.items || data.results || [];
        
        // Создаем карточки для Lampa
        displayAnimeItems(items);
        
    } catch (error) {
        console.error('Error loading anime list:', error);
        Lampa.Noty.show(`Ошибка загрузки: ${error.message}`);
    } finally {
        Lampa.Loader.hide();
    }
}

// Отображаем аниме в интерфейсе Lampa
function displayAnimeItems(items) {
    // Очищаем текущий контент
    const content = document.querySelector('.content');
    if (content) content.innerHTML = '';
    
    // Создаем контейнер для карточек
    const container = document.createElement('div');
    container.className = 'full-content';
    
    // Добавляем заголовок
    const title = document.createElement('div');
    title.className = 'full-content__title';
    title.textContent = 'Аниме подборка';
    container.appendChild(title);
    
    // Создаем сетку карточек
    const grid = document.createElement('div');
    grid.className = 'full-content__grid';
    
    // Добавляем карточки для каждого аниме
    items.forEach(item => {
        const card = document.createElement('a');
        card.className = 'card';
        card.href = `#tv/${item.id}`;
        
        // Постер
        const poster = document.createElement('div');
        poster.className = 'card__poster';
        
        const img = document.createElement('img');
        img.className = 'card__poster-item';
        img.loading = 'lazy';
        img.src = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
        img.alt = item.name || item.title;
        
        poster.appendChild(img);
        card.appendChild(poster);
        
        // Название
        const name = document.createElement('div');
        name.className = 'card__name';
        name.textContent = item.name || item.title;
        card.appendChild(name);
        
        // Рейтинг
        if (item.vote_average) {
            const rating = document.createElement('div');
            rating.className = 'card__rating';
            rating.textContent = item.vote_average.toFixed(1);
            card.appendChild(rating);
        }
        
        grid.appendChild(card);
    });
    
    container.appendChild(grid);
    
    // Вставляем в DOM
    if (content) {
        content.appendChild(container);
    } else {
        document.body.appendChild(container);
    }
    
    // Инициализируем карточки (если в Lampa есть такой функционал)
    if (typeof Lampa.Cards === 'object') {
        Lampa.Cards.init();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, что мы на нужной странице (lampa uncensored)
    if (document.querySelector('.menu')) {
        // Добавляем раздел в меню
        addAnimeSection();
        
        // Если нужно сразу загрузить список при открытии
        if (window.location.hash === '#anime') {
            loadAnimeList('anime-list', '146567');
        }
    }
});

// Добавляем обработчик для hash изменений
window.addEventListener('hashchange', function() {
    if (window.location.hash === '#anime') {
        loadAnimeList('anime-list', '146567');
    }
});