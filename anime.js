/**
 * Anime TMDB Plugin - Полная рабочая версия
 * Создает раздел с подборками аниме из The Movie Database API
 */

class AnimeTmdbPlugin {
  constructor(options = {}) {
    // Конфигурация по умолчанию
    this.defaults = {
      containerSelector: '#anime-tmdb-section',
      apiKey: '', // Обязательно нужно указать свой API ключ
      language: 'ru-RU',
      lists: [
        {
          id: 'popular',
          title: 'Популярное аниме',
          endpoint: 'discover/tv',
          params: {
            with_genres: 16, // Жанр аниме
            sort_by: 'popularity.desc'
          }
        },
        {
          id: 'top-rated',
          title: 'Лучшее аниме по рейтингу',
          endpoint: 'discover/tv',
          params: {
            with_genres: 16,
            sort_by: 'vote_average.desc',
            'vote_count.gte': 100
          }
        },
        {
          id: 'trending',
          title: 'Сейчас популярно',
          endpoint: 'trending/tv/week',
          params: {}
        }
      ]
    };

    // Объединяем настройки
    this.config = { ...this.defaults, ...options };
    this.baseUrl = 'https://api.themoviedb.org/3/';
    
    // Инициализация
    this.init();
  }

  async init() {
    // Проверка API ключа
    if (!this.config.apiKey) {
      this.showError('Не указан API ключ TMDB. Получите ключ на themoviedb.org');
      return;
    }

    // Создаем контейнер
    this.createContainer();
    
    // Загружаем данные для каждой подборки
    for (const list of this.config.lists) {
      this.showLoading(list.title);
      
      try {
        const animeList = await this.fetchAnimeList(list);
        this.renderList(animeList);
      } catch (error) {
        console.error(`Ошибка загрузки "${list.title}":`, error);
        this.renderError(list.title, error.message);
      }
    }
  }

  // Создает основной контейнер
  createContainer() {
    let container = document.querySelector(this.config.containerSelector);
    
    if (!container) {
      container = document.createElement('div');
      container.id = this.config.containerSelector.replace('#', '');
      document.body.appendChild(container);
    }
    
    this.container = container;
    this.container.className = 'anime-tmdb-container';
  }

  // Загружает данные списка аниме
  async fetchAnimeList(listConfig) {
    const queryParams = new URLSearchParams({
      api_key: this.config.apiKey,
      language: this.config.language,
      ...listConfig.params
    });

    const url = `${this.baseUrl}${listConfig.endpoint}?${queryParams}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.status_message || `Ошибка ${response.status}`);
    }
    
    const data = await response.json();
    return {
      id: listConfig.id,
      title: listConfig.title,
      items: data.results.slice(0, 12) // Берем первые 12 результатов
    };
  }

  // Отображает загруженный список
  renderList(list) {
    // Удаляем индикатор загрузки
    const loadingElement = document.getElementById(`loading-${list.id}`);
    if (loadingElement) loadingElement.remove();
    
    // Создаем контейнер списка
    const listElement = document.createElement('div');
    listElement.className = 'anime-tmdb-list';
    listElement.id = `anime-tmdb-${list.id}`;
    
    // Заголовок
    const titleElement = document.createElement('h2');
    titleElement.className = 'anime-tmdb-list-title';
    titleElement.textContent = list.title;
    listElement.appendChild(titleElement);
    
    // Контейнер для карточек
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'anime-tmdb-items';
    
    // Добавляем карточки
    list.items.forEach(item => {
      itemsContainer.appendChild(this.createAnimeCard(item));
    });
    
    listElement.appendChild(itemsContainer);
    this.container.appendChild(listElement);
  }

  // Создает карточку аниме
  createAnimeCard(anime) {
    const card = document.createElement('div');
    card.className = 'anime-tmdb-card';
    
    // Постер
    const poster = document.createElement('img');
    poster.className = 'anime-tmdb-poster';
    poster.src = anime.poster_path 
      ? `https://image.tmdb.org/t/p/w200${anime.poster_path}`
      : 'https://via.placeholder.com/200x300?text=No+Poster';
    poster.alt = anime.name || anime.title;
    poster.loading = 'lazy';
    
    // Информация
    const info = document.createElement('div');
    info.className = 'anime-tmdb-info';
    
    const title = document.createElement('h3');
    title.className = 'anime-tmdb-title';
    title.textContent = anime.name || anime.title;
    
    const details = document.createElement('div');
    details.className = 'anime-tmdb-details';
    details.innerHTML = `
      <span>★ ${anime.vote_average?.toFixed(1) || 'N/A'}</span>
      <span>${anime.first_air_date?.substring(0, 4) || 'N/A'}</span>
    `;
    
    info.appendChild(title);
    info.appendChild(details);
    
    card.appendChild(poster);
    card.appendChild(info);
    
    // Клик по карточке
    card.addEventListener('click', () => {
      this.openAnimeDetails(anime.id);
    });
    
    return card;
  }

  // Показывает индикатор загрузки
  showLoading(title) {
    const loadingElement = document.createElement('div');
    loadingElement.id = `loading-${title.replace(/\s+/g, '-')}`;
    loadingElement.className = 'anime-tmdb-loading';
    loadingElement.textContent = `Загрузка ${title}...`;
    this.container.appendChild(loadingElement);
  }

  // Показывает ошибку
  renderError(title, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'anime-tmdb-error';
    errorElement.innerHTML = `
      <strong>${title}:</strong> ${message}
    `;
    this.container.appendChild(errorElement);
  }

  // Общая ошибка
  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'anime-tmdb-error';
    errorElement.textContent = message;
    this.container.appendChild(errorElement);
  }

  // Открывает страницу с деталями (можно реализовать по желанию)
  openAnimeDetails(animeId) {
    window.open(`https://www.themoviedb.org/tv/${animeId}`, '_blank');
  }
}

// Добавляем CSS стили
const style = document.createElement('style');
style.textContent = `
  .anime-tmdb-container {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 1200px;
    margin: 20px auto;
    padding: 0 15px;
  }
  
  .anime-tmdb-list {
    margin-bottom: 40px;
  }
  
  .anime-tmdb-list-title {
    color: #fff;
    font-size: 24px;
    margin-bottom: 15px;
    padding-bottom: 5px;
    border-bottom: 2px solid #3d3d3d;
  }
  
  .anime-tmdb-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
  }
  
  .anime-tmdb-card {
    background: #2d2d2d;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    color: white;
  }
  
  .anime-tmdb-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }
  
  .anime-tmdb-poster {
    width: 100%;
    height: auto;
    display: block;
  }
  
  .anime-tmdb-info {
    padding: 12px;
  }
  
  .anime-tmdb-title {
    font-size: 14px;
    margin: 0 0 8px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .anime-tmdb-details {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #aaa;
  }
  
  .anime-tmdb-error {
    background: #ffebee;
    color: #d32f2f;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    border-left: 4px solid #d32f2f;
  }
  
  .anime-tmdb-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    color: #fff;
  }
  
  @media (max-width: 768px) {
    .anime-tmdb-items {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 15px;
    }
  }
`;
document.head.appendChild(style);

// Инициализация плагина после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
  const animePlugin = new AnimeTmdbPlugin({
    apiKey: 'YOUR_TMDB_API_KEY' // Замените на свой ключ
  });
});