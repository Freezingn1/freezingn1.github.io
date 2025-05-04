// anime2-uncensored.js - 100% рабочий вариант для Lampa Uncensored
(function() {
    // Ждём полной загрузки Lampa
    function initPlugin() {
        if (!window.Lampa || !Lampa.API) {
            setTimeout(initPlugin, 200);
            return;
        }

        // Конфигурация плагина
        const pluginConfig = {
            name: 'anime2_plugin',
            title: 'Аниме2',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ff5722"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 12H9v-2h2v2zm0-4H9V9h2v2zm4 4h-2v-2h2v2zm0-4h-2V9h2v2z"/></svg>',
            group: 'anime',
            version: '1.0',
            visible: true,
            
            // Подборки аниме
            collections: [
                {
                    title: '🔥 Популярное аниме',
                    component: 'tmdb',
                    params: 'sort_by=popularity.desc&with_genres=16'
                },
                {
                    title: '⭐ Топ по рейтингу',
                    component: 'tmdb',
                    params: 'sort_by=vote_average.desc&with_genres=16&vote_count.gte=100'
                }
            ],
            
            // Инициализация
            onStart: function() {
                this.render();
            },
            
            // Генерация контента
            render: function() {
                let html = `
                    <div class="anime2-plugin">
                        <div class="plugin-header">
                            <h1>Аниме подборки</h1>
                        </div>
                `;
                
                this.collections.forEach((col, index) => {
                    html += `
                        <div class="collection">
                            <h2>${col.title}</h2>
                            <div 
                                data-component="${col.component}" 
                                data-params="${col.params}"
                                id="anime2-collection-${index}"
                            ></div>
                        </div>
                    `;
                });
                
                html += `</div>`;
                
                // Вставляем в основной контейнер
                document.getElementById('content').innerHTML = html;
                
                // Инициализируем компоненты
                this.initComponents();
            },
            
            // Инициализация TMDB компонентов
            initComponents: function() {
                this.collections.forEach((col, index) => {
                    Lampa.Components.init(document.getElementById(`anime2-collection-${index}`));
                });
            }
        };

        // Регистрация плагина
        Lampa.API.add({
            type: 'plugin',
            name: pluginConfig.name,
            component: pluginConfig
        });
        
        console.log('[Аниме2] Плагин успешно зарегистрирован!');
    }

    // Старт с задержкой для полной загрузки Lampa
    setTimeout(initPlugin, 1500);
})();