class LampaTMDBAnimePlugin {
  constructor(apiKey, options = {}) {
    if (!apiKey) throw new Error("TMDB API key is required!");
    this.name = "Lampa Anime TMDB Plugin";
    this.version = "1.1";
    this.apiKey = apiKey;
    this.baseUrl = "https://api.themoviedb.org/3";
    this.language = options.language || "ru-RU";
    this.cache = {}; // Простое кеширование
  }

  async _fetch(url) {
    if (this.cache[url]) return this.cache[url];
    const response = await fetch(url);
    const data = await response.json();
    this.cache[url] = data; // Сохраняем в кеш
    return data;
  }

  async searchAnime(query, page = 1) {
    const url = `${this.baseUrl}/search/tv?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&page=${page}&language=${this.language}&with_genres=16`;
    return this._fetch(url);
  }

  async getPopularAnime(page = 1) {
    const url = `${this.baseUrl}/discover/tv?api_key=${this.apiKey}&page=${page}&language=${this.language}&with_genres=16&sort_by=popularity.desc`;
    return this._fetch(url);
  }

  async getAnimeDetails(tvId) {
    const url = `${this.baseUrl}/tv/${tvId}?api_key=${this.apiKey}&language=${this.language}&append_to_response=videos`;
    return this._fetch(url);
  }
}

// Пример инициализации (ключ должен вводиться в вашем приложении, а не храниться в коде)
const animePlugin = new LampaTMDBAnimePlugin("ВАШ_API_КЛЮЧ", { language: "ru-RU" });

// Использование
animePlugin.getPopularAnime().then(data => {
  console.log("Популярные аниме:", data.results);
});