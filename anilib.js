(function() {
    'use strict';

    var parser = {
        name: "Anilibria",
        type: "anime",
        baseUrl: "https://anilib.me",

        // Поиск аниме
        search: async function(query) {
            let res = await fetch(`https://anilib.me/api/v2/searchTitle?search=${encodeURIComponent(query)}`);
            let data = await res.json();
            
            return data.list.map(item => ({
                id: item.id,
                name: item.names.ru,
                year: item.season.year,
                poster: `https://anilib.me${item.posters.medium}`
            }));
        },

        // Получение списка серий
        playlist: async function(id) {
            let res = await fetch(`https://anilib.me/api/v2/title?id=${id}`);
            let data = await res.json();
            
            return data.episodes.list.map(ep => ({
                id: ep.episode_id,
                name: `Серия ${ep.episode}`,
                url: `https://anilib.me/ru/anime/${id}/watch?episode=${ep.episode_id}`
            }));
        },

        // Получение ссылки на видео
        parsePlaylist: async function(url) {
            let episode_id = url.match(/episode=(\d+)/)[1];
            let res = await fetch(`https://anilib.me/api/v2/player?episode_id=${episode_id}`);
            let data = await res.json();
            
            return {
                links: [{
                    url: `https://video1.anilib.me${data.url}`,
                    quality: "1080p",
                    format: "mp4"
                }],
                headers: {
                    "Referer": "https://anilib.me/",
                    "Origin": "https://anilib.me"
                }
            };
        }
    };

    // Компонент для отображения
    function component(object) {
        // ... (остальной код компонента без изменений)
    }

    // Регистрация плагина
    if (!window.anilibria_plugin) {
        window.anilibria_plugin = true;
        
        // Регистрируем парсер через Lampa.Parser если доступен
        if (typeof Lampa !== 'undefined' && Lampa.Parser) {
            Lampa.Parser.add(parser);
        }
        
        // Альтернативный способ регистрации
        if (typeof window.lampac_parsers !== 'undefined') {
            window.lampac_parsers.push(parser);
        }

        Lampa.Manifest.plugins = {
            type: 'video',
            name: 'Anilibria',
            description: 'Плагин для просмотра аниме с Anilib.me',
            component: 'anilibria',
            onContextMenu: function(object) {
                return {
                    name: "Смотреть на Anilibria",
                    description: 'Открыть в Anilibria'
                };
            },
            onContextLauch: function(object) {
                Lampa.Component.add('anilibria', component);
                
                Lampa.Activity.push({
                    url: '',
                    title: 'Anilibria',
                    component: 'anilibria',
                    movie: object
                });
            }
        };

        // Добавляем кнопку на страницу аниме
        Lampa.Listener.follow('full', function(e) {
            if (e.type == 'complite') {
                var button = $(`
                    <div class="full-start__button selector view--anilibria" data-subtitle="Anilibria">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
                        </svg>
                        <span>Anilibria</span>
                    </div>
                `);
                
                button.on('hover:enter', function() {
                    Lampa.Component.add('anilibria', component);
                    Lampa.Activity.push({
                        url: '',
                        title: 'Anilibria',
                        component: 'anilibria',
                        movie: e.data.movie
                    });
                });
                
                e.object.activity.render().find('.view--torrent').after(button);
            }
        });
    }

})();