(function() {
    // Конфигурация плагина
    const pluginConfig = {
        name: 'tmdb-anime',
        title: 'Аниме (TMDB)',
        description: 'Аниме из The Movie Database',
        version: '1.0',
        update: '2023-11-15',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7,9.5A1.5,1.5 0 0,1 8.5,8A1.5,1.5 0 0,1 10,9.5A1.5,1.5 0 0,1 8.5,11A1.5,1.5 0 0,1 7,9.5M16,17H8V15H16V17M15,13H9V11H15V13M15,9H9V7H15V9Z"/></svg>'
    };

    // Основной класс плагина
    class TMDBAnimePlugin {
        constructor() {
            this.apiKey = ''; // Будет установлено при инициализации
            this.initialized = false;
        }

        // Инициализация плагина
        initialize() {
            if (this.initialized) return;

            // Получаем API ключ из настроек Lampa
            this.apiKey = Lampa.Storage.get('tmdb_api_key') || '';

            // Регистрируем новый раздел
            this.registerSection();
            
            this.initialized = true;
        }

        // Регистрация раздела в меню
        registerSection() {
            Lampa.Sidebar.add({
                id: pluginConfig.name,
                name: pluginConfig.title,
                icon: pluginConfig.icon,
                component: {
                    template: `
                        <div class="section">
                            <div class="section__head">
                                <h2>${pluginConfig.title}</h2>
                            </div>
                            <div class="section__content">
                                <anime-list :key="componentKey"></anime-list>
                            </div>
                        </div>
                    `,
                    components: {
                        'anime-list': {
                            template: `
                                <div>
                                    <loader v-if="loading"></loader>
                                    <div v-else class="card-list">
                                        <card 
                                            v-for="item in items" 
                                            :key="item.id"
                                            :item="item"
                                            @click="openItem(item)"
                                        ></card>
                                    </div>
                                </div>
                            `,
                            data: () => ({
                                loading: true,
                                items: [],
                                componentKey: 0
                            }),
                            methods: {
                                fetchData() {
                                    this.loading = true;
                                    fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${this.$root.apiKey}&with_genres=16&sort_by=popularity.desc`)
                                        .then(res => res.json())
                                        .then(data => {
                                            this.items = data.results.map(item => ({
                                                id: item.id,
                                                title: item.name,
                                                poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                                                year: new Date(item.first_air_date).getFullYear(),
                                                rating: item.vote_average
                                            }));
                                        })
                                        .finally(() => {
                                            this.loading = false;
                                        });
                                },
                                openItem(item) {
                                    Lampa.Activity.push({
                                        component: {
                                            template: `
                                                <div class="item-details">
                                                    <h1>{{item.title}}</h1>
                                                    <img :src="item.poster" alt="Poster">
                                                    <p>Год: {{item.year}}</p>
                                                    <p>Рейтинг: {{item.rating}}</p>
                                                </div>
                                            `,
                                            data: () => ({ item })
                                        }
                                    });
                                }
                            },
                            mounted() {
                                this.fetchData();
                            }
                        }
                    },
                    data: () => ({
                        apiKey: this.apiKey,
                        componentKey: 0
                    })
                }
            });
        }
    }

    // Регистрация плагина
    Lampa.Plugin.register(new TMDBAnimePlugin());

    // Добавляем настройки для API ключа
    Lampa.Settings.list.push({
        title: 'TMDB API Key',
        name: 'tmdb_api_key',
        component: {
            template: `
                <div class="setting">
                    <div class="setting__content">
                        <input 
                            type="text" 
                            v-model="value" 
                            placeholder="Введите ваш TMDB API ключ"
                            @change="save"
                        >
                    </div>
                </div>
            `,
            data: () => ({
                value: Lampa.Storage.get('tmdb_api_key') || ''
            }),
            methods: {
                save() {
                    Lampa.Storage.set('tmdb_api_key', this.value);
                }
            }
        }
    });

    console.log(`Плагин "${pluginConfig.name}" загружен!`);
})();