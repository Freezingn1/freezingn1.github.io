// anime2.js - плагин для Lampa (загружается по URL)
(function() {
    if (typeof Lampa === 'undefined') return;

    const Anime2Plugin = {
        title: 'Аниме2',
        route: '/anime2',
        order: 15,
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="8.5" cy="10.5" r="1.5"/><circle cx="15.5" cy="10.5" r="1.5"/><path d="M12 17c2.76 0 5-2.24 5-5h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3H7c0 2.76 2.24 5 5 5z"/></svg>',
        
        collections: [
            {
                title: '🔥 Популярное аниме',
                params: { url: 'anime', sort_by: 'popularity.desc', with_genres: '16' }
            },
            {
                title: '⭐ Топ по рейтингу',
                params: { url: 'anime', sort_by: 'vote_average.desc', with_genres: '16', vote_count_gte: 100 }
            },
            {
                title: '🆕 Новинки',
                params: { url: 'anime', sort_by: 'primary_release_date.desc', with_genres: '16' }
            }
        ],

        generate() {
            let html = '<div class="anime2-plugin"><h1>🎌 Аниме подборки</h1>';
            this.collections.forEach(col => {
                html += `
                    <div class="collection">
                        <h2>${col.title}</h2>
                        <div data-component="category" data-source="tmdb" data-params='${JSON.stringify(col.params)}'></div>
                    </div>
                `;
            });
            return html + '</div>';
        },

        style: `
            .anime2-plugin { padding: 15px; }
            .anime2-plugin h1 { color: #fff; font-size: 24px; margin-bottom: 20px; }
            .anime2-plugin .collection { margin-bottom: 30px; }
            .anime2-plugin .collection h2 { color: #e0e0e0; font-size: 18px; margin-bottom: 10px; }
        `
    };

    Lampa.Plugin.register(Anime2Plugin);
    console.log('Plugin "Аниме2" loaded!');
})();