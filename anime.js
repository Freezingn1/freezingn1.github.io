// anime2.js - обновлённый плагин для Lampa
(function() {
    // Ждём полной загрузки Lampa
    function waitForLampa() {
        if (typeof Lampa === 'undefined') {
            setTimeout(waitForLampa, 100);
            return;
        }

        // Современный способ регистрации плагина
        Lampa.Plugin.add({
            name: 'anime2',
            title: 'Аниме2',
            version: '1.0',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="8.5" cy="10.5" r="1.5"/><circle cx="15.5" cy="10.5" r="1.5"/><path d="M12 17c2.76 0 5-2.24 5-5h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3H7c0 2.76 2.24 5 5 5z"/></svg>',
            group: 'anime',
            visible: true,

            // Подборки аниме
            collections: [
                {
                    title: '🔥 Популярное',
                    params: { url: 'anime', sort_by: 'popularity.desc', with_genres: '16' }
                },
                {
                    title: '⭐ Топ по рейтингу',
                    params: { url: 'anime', sort_by: 'vote_average.desc', with_genres: '16', vote_count_gte: 100 }
                }
            ],

            // Генерация контента
            onshow: function() {
                let html = '<div class="anime2-plugin"><h1>🎌 Аниме</h1>';
                
                this.collections.forEach(col => {
                    html += `
                        <div class="collection">
                            <h2>${col.title}</h2>
                            <div 
                                data-component="category" 
                                data-source="tmdb" 
                                data-params='${JSON.stringify(col.params)}'
                            ></div>
                        </div>
                    `;
                });

                this.html = html + '</div>';
            },

            // Стили
            style: `
                .anime2-plugin { padding: 15px; }
                .anime2-plugin h1 { color: #fff; font-size: 24px; margin: 0 0 20px 0; }
                .anime2-plugin .collection { margin-bottom: 30px; }
                .anime2-plugin .collection h2 { color: #e0e0e0; font-size: 18px; margin: 0 0 10px 0; }
            `
        });

        console.log('Плагин "Аниме2" успешно загружен!');
    }

    waitForLampa();
})();