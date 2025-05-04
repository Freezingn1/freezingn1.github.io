// anime2.js - Оптимизирован для Lampa Uncensored
(function() {
    // Ждем загрузки Lampa
    function initPlugin() {
        if (typeof Lampa === 'undefined' || !Lampa.API) {
            setTimeout(initPlugin, 100);
            return;
        }

        // Создаем плагин
        const Anime2Plugin = {
            name: 'anime2',
            title: 'Аниме2',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ff5722"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="8.5" cy="10.5" r="1.5"/><circle cx="15.5" cy="10.5" r="1.5"/><path d="M12 17c2.76 0 5-2.24 5-5h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3H7c0 2.76 2.24 5 5 5z"/></svg>',
            menu: true,
            styles: `
                .plugin-anime2 { padding: 15px; }
                .plugin-anime2 h1 { color: #ff5722; font-size: 24px; margin-bottom: 20px; }
                .plugin-anime2 .collection { margin-bottom: 30px; }
                .plugin-anime2 .collection h2 { color: #e0e0e0; font-size: 18px; margin-bottom: 10px; }
            `,
            
            // Подборки аниме
            collections: [
                {
                    title: '🔥 Популярное',
                    params: { 
                        type: 'anime',
                        sort: 'popularity.desc',
                        genre: '16',
                        language: 'ja'
                    }
                },
                {
                    title: '⭐ Топ по рейтингу',
                    params: { 
                        type: 'anime',
                        sort: 'vote_average.desc',
                        genre: '16',
                        language: 'ja',
                        votes: '100'
                    }
                },
                {
                    title: '🆕 Новинки',
                    params: { 
                        type: 'anime',
                        sort: 'release_date.desc',
                        genre: '16',
                        language: 'ja'
                    }
                }
            ],

            // Инициализация
            init: function() {
                this.render();
            },

            // Рендер контента
            render: function() {
                let html = '<div class="plugin-anime2"><h1>Аниме подборки</h1>';
                
                this.collections.forEach(col => {
                    html += `
                        <div class="collection">
                            <h2>${col.title}</h2>
                            <div data-list="true" data-type="${col.params.type}" data-sort="${col.params.sort}" data-genre="${col.params.genre}" data-language="${col.params.language}"></div>
                        </div>
                    `;
                });

                html += '</div>';
                
                // Добавляем в DOM
                if (this.container) {
                    this.container.innerHTML = html;
                } else {
                    console.error('Container not found!');
                }
            }
        };

        // Регистрируем плагин через API Lampa Uncensored
        if (Lampa.API && Lampa.API.addPlugin) {
            Lampa.API.addPlugin(Anime2Plugin);
            console.log('Плагин "Аниме2" успешно загружен!');
        } else {
            console.error('Lampa.API.addPlugin not found!');
        }
    }

    // Запускаем инициализацию
    setTimeout(initPlugin, 1000);
})();