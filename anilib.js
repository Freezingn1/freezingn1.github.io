(function() {
    'use strict';

    // Основной парсер
    var AnilibriaParser = {
        name: "Anilibria",
        baseUrl: "https://anilib.me",

        // Поиск аниме
        search: function(params) {
            return new Promise((resolve) => {
                fetch(`https://anilib.me/api/v2/searchTitle?search=${encodeURIComponent(params.query)}`)
                    .then(res => res.json())
                    .then(data => {
                        resolve(data.list.map(item => ({
                            id: item.id,
                            name: item.names.ru,
                            year: item.season.year,
                            poster: `https://anilib.me${item.posters.medium}`,
                            source: 'anilibria'
                        })));
                    })
                    .catch(() => resolve([]));
            });
        },

        // Получение информации о тайтле
        getInfo: function(url) {
            return new Promise((resolve) => {
                let id = url.match(/anime\/(\d+)/)[1];
                fetch(`https://anilib.me/api/v2/title?id=${id}`)
                    .then(res => res.json())
                    .then(data => resolve(data))
                    .catch(() => resolve(null));
            });
        },

        // Получение ссылки на видео
        getUrl: function(url) {
            return new Promise((resolve) => {
                let episode_id = url.match(/episode=(\d+)/)[1];
                fetch(`https://anilib.me/api/v2/player?episode_id=${episode_id}`)
                    .then(res => res.json())
                    .then(data => {
                        resolve({
                            url: `https://video1.anilib.me${data.url}`,
                            headers: {
                                "Referer": "https://anilib.me/",
                                "Origin": "https://anilib.me"
                            }
                        });
                    })
                    .catch(() => resolve(null));
            });
        }
    };

    // Регистрация парсера
    if (typeof Lampa !== 'undefined') {
        // Способ 1 - для новых версий Lampa
        if (Lampa.Parser && typeof Lampa.Parser.add === 'function') {
            Lampa.Parser.add(AnilibriaParser);
        }
        // Способ 2 - через глобальный объект
        else if (typeof window.lampac_parsers !== 'undefined') {
            window.lampac_parsers.push(AnilibriaParser);
        }
        // Способ 3 - ручная регистрация
        else {
            Lampa.Search.addSource({
                title: 'Anilibria',
                search: AnilibriaParser.search,
                params: {
                    lazy: true
                },
                onSelect: function(params, close) {
                    close();
                    Lampa.Activity.push({
                        url: params.element.url,
                        title: params.element.name,
                        component: 'full',
                        movie: params.element
                    });
                }
            });
        }

        // Добавляем кнопку просмотра
        Lampa.Listener.follow('full', function(e) {
            if (e.type == 'complite' && e.data.movie.source === 'anilibria') {
                let button = $(`
                    <div class="full-start__button selector view--anilibria">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M10,17l-5-5l1.41-1.41L10,14.17l7.59-7.59L19,8L10,17z"/>
                        </svg>
                        <span>Смотреть</span>
                    </div>
                `);

                button.on('hover:enter', function() {
                    AnilibriaParser.getUrl(e.data.movie.url).then(result => {
                        if (result) {
                            Lampa.Player.play({
                                title: e.data.movie.name,
                                url: result.url,
                                headers: result.headers
                            });
                        }
                    });
                });

                e.object.activity.render().find('.full-start__buttons').append(button);
            }
        });

        // Добавляем переводы для интерфейса
        Lampa.Lang.add({
            anilibria_watch: {
                ru: 'Смотреть на Anilibria',
                en: 'Watch on Anilibria',
                uk: 'Дивитися на Anilibria'
            }
        });
    }

})();