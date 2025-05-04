class LampaTMDBAnimePlugin {
  constructor(options = {}) {
    this.name = "Lampa Anime TMDB Plugin";
    this.version = "1.0";
    this.apiKey = options.apiKey || "f83446fde4dacae2924b41ff789d2bb0"; // Замените на свой API-ключ
    this.baseUrl = "https://api.themoviedb.org/3";
    this.language = options.language || "ru-RU"; // Язык (можно поменять)
  }

  // Поиск аниме по названию
  async searchAnime(query, page = 1) {
    const url = `${this.baseUrl}/search/tv?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&page=${page}&language=${this.language}&with_genres=16`;
    const response = await fetch(url);
    return await response.json();
  }

  // Получить популярные аниме
  async getPopularAnime(page = 1) {
    const url = `${this.baseUrl}/discover/tv?api_key=${this.apiKey}&page=${page}&language=${this.language}&with_genres=16&sort_by=popularity.desc`;
    const response = await fetch(url);
    return await response.json();
  }

  // Получить информацию о конкретном аниме (по ID)
  async getAnimeDetails(tvId) {
    const url = `${this.baseUrl}/tv/${tvId}?api_key=${this.apiKey}&language=${this.language}&append_to_response=videos`;
    const response = await fetch(url);
    return await response.json();
  }
}

// Пример использования
const animePlugin = new LampaTMDBAnimePlugin({
  apiKey: "ВАШ_API_КЛЮЧ", // Получите на https://www.themoviedb.org/settings/api
  language: "ru-RU" // Язык результатов
});

// Поиск аниме
animePlugin.searchAnime("Наруто").then(data => console.log(data.results));

// Получить популярные аниме
animePlugin.getPopularAnime().then(data => console.log(data.results));

// Получить информацию о конкретном аниме (например, ID 46260 — Sword Art Online)
animePlugin.getAnimeDetails(46260).then(data => console.log(data));