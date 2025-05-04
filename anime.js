(function() {
    'use strict';
    
    // Ждём загрузки Lampa
    if (typeof Lampa === 'undefined') {
        console.error('Lampa not found!');
        return;
    }

    // Конфигурация плагина
    const Anime2Plugin = {
        title: 'Аниме2',
        version: '1.1',
        description: 'Подборки аниме из TMDB',
        route: '/anime2',
        order: 12,
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="8.5" cy="10.5" r="1.5"/><circle cx="15.5" cy="10.5" r="1.5"/><path d="M12 17c2.76 0 5-2.24 5-5h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3H7c0 2.76 2.24 5 5 5z"/></svg>',
        
        collections: [
            {
                title: 'Популярное аниме',
                source: 'tmdb',
                component: 'category',
                params: {
                    url: 'anime',
                    sort_by: 'popularity.desc',
                    with_genres: '16',
                    with_original_language: 'ja'
                }
            },
            {
                title: 'Топ по рейтингу',
                source: 'tmdb',
                component: 'category',
                params: {
                    url: 'anime',
                    sort_by: 'vote_average.desc',
                    with_genres: '16',
                    with_original_language: 'ja',
                    vote_count_gte: 100
                }
            },
            {
                title: 'Новинки аниме',
                source: 'tmdb',
                component: 'category',
                params: {
                    url: 'anime',
                    sort_by: 'primary_release_date.desc',
                    with_genres: '16',
                    with_original_language: 'ja'
                }
            }
        ],
        
        generate: function() {
            let html = '<div class="plugin-anime2">';
            html += '<h1>Аниме подборки</h1>';
            
            this.collections.forEach(collection => {
                html += `
                    <div class="collection">
                        <h2>${collection.title}</h2>
                        <div 
                            data-component="${collection.component}" 
                            data-source="${collection.source}"
                            data-params='${JSON.stringify(collection.params)}'
                        ></div>
                    </div>
                `;
            });
            
            return html + '</div>';
        },
        
        style: `
            .plugin-anime2 {
                padding: 20px;
            }
            .plugin-anime2 h1 {
                margin-bottom: 30px;
                font-size: 28px;
                color: #fff;
            }
            .plugin-anime2 .collection {
                margin-bottom: 40px;
            }
            .plugin-anime2 .collection h2 {
                margin-bottom: 15px;
                font-size: 22px;
                color: #e0e0e0;
            }
        `
    };

    // Регистрация плагина
    Lampa.Plugin.register(Anime2Plugin);
    
    console.log('Anime2 plugin loaded successfully!');
})();