(function() {
    'use strict';

    function startPlugin() {
        if (window.plugin_myown_anime_ready) return;
        window.plugin_myown_anime_ready = true;

        var SourceMAL = function() {
            this.network = new (Lampa.Reguest || window.Lampa.Reguest)();
            
            this.main = function(params, oncomplite) {
                this.network.timeout(5000).get('https://api.jikan.moe/v4/top/anime?limit=10', (json) => {
                    if (json && json.data) {
                        oncomplite({
                            title: 'Топ аниме (MAL)',
                            results: json.data.map(item => ({
                                id: item.mal_id,
                                title: item.title,
                                poster_path: item.images?.jpg?.image_url,
                                vote_average: item.score
                            }))
                        });
                    }
                }, () => oncomplite({ results: [] }));
            };
        };

        // Добавляем источник
        Lampa.Api.sources.myown_anime = new SourceMAL();

        // Добавляем кнопку в меню
        var item = $('<li class="menu__item selector"><div class="menu__ico">🎬</div><div class="menu__text">Аниме</div></li>');
        item.on("hover:enter", () => {
            Lampa.Activity.push({
                title: 'Аниме',
                component: 'main',
                source: 'myown_anime'
            });
        });
        $(".menu .menu__list").append(item);
    }

    if (typeof Lampa !== 'undefined') startPlugin();
    else console.error('Lampa не загружена');
})();