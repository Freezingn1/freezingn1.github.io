(function () {
    'use strict';
    
    var anime_icon = '<svg height="173" viewBox="0 0 180 173" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M126 3C126 18.464 109.435 31 89 31C68.5655 31 52 18.464 52 3C52 2.4505 52.0209 1.90466 52.0622 1.36298C21.3146 15.6761 0 46.8489 0 83C0 132.706 40.2944 173 90 173C139.706 173 180 132.706 180 83C180 46.0344 157.714 14.2739 125.845 0.421326C125.948 1.27051 126 2.13062 126 3ZM88.5 169C125.779 169 156 141.466 156 107.5C156 84.6425 142.314 64.6974 122 54.0966C116.6 51.2787 110.733 55.1047 104.529 59.1496C99.3914 62.4998 94.0231 66 88.5 66C82.9769 66 77.6086 62.4998 72.4707 59.1496C66.2673 55.1047 60.3995 51.2787 55 54.0966C34.6864 64.6974 21 84.6425 21 107.5C21 141.466 51.2208 169 88.5 169Z" fill="currentColor"></path><path d="M133 121.5C133 143.315 114.196 161 91 161C67.804 161 49 143.315 49 121.5C49 99.6848 67.804 116.5 91 116.5C114.196 116.5 133 99.6848 133 121.5Z" fill="currentColor"></path><path d="M72 81C72 89.8366 66.1797 97 59 97C51.8203 97 46 89.8366 46 81C46 72.1634 51.8203 65 59 65C66.1797 65 72 72.1634 72 81Z" fill="currentColor"></path><path d="M131 81C131 89.8366 125.18 97 118 97C110.82 97 105 89.8366 105 81C105 72.1634 110.82 65 118 65C125.18 65 131 72.1634 131 81Z" fill="currentColor"></path></svg>';

    // Жанры аниме (MAL IDs)
    var myGenres = [
        { id: 1, title: 'filter_genre_action' },     // Action
        { id: 2, title: 'filter_genre_adventure' },  // Adventure
        { id: 4, title: 'filter_genre_comedy' },      // Comedy
        { id: 8, title: 'filter_genre_drama' },       // Drama
        { id: 10, title: 'filter_genre_fantasy' },    // Fantasy
        { id: 14, title: 'filter_genre_horror' },     // Horror
        { id: 22, title: 'filter_genre_romance' },    // Romance
        { id: 24, title: 'filter_genre_sci_fi' },     // Sci-Fi
        { id: 37, title: 'filter_genre_slice_of_life' } // Slice of Life
    ];

    function startPlugin() {
        window.plugin_myown_anime_ready = true;

        // Класс для работы с Jikan API
        var SourceMAL = function (parrent) {
            this.network = new Lampa.Reguest();
            this.discovery = false;

            // Преобразуем данные MAL в формат, совместимый с Lampa
            this._mapMalToLampa = function (malData) {
                return malData.map(item => ({
                    id: item.mal_id,
                    title: item.title || item.name,
                    original_title: item.title_japanese,
                    poster_path: item.images?.jpg?.image_url,
                    backdrop_path: item.images?.jpg?.large_image_url,
                    vote_average: item.score,
                    release_date: item.aired?.from,
                    release_year: item.aired?.from ? item.aired.from.split('-')[0] : '0000',
                    overview: item.synopsis,
                    type: item.type.toLowerCase()
                }));
            };

            this.main = function (params, oncomplite, onerror) {
                var owner = this;
                var parts_limit = 6;
                var parts_data = [
                    // Топ популярных аниме
                    function (call) {
                        owner.get('https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=20 ', params, function (json) {
                            json.title = 'Популярные аниме (MAL)';
                            json.results = owner._mapMalToLampa(json.data);
                            call(json);
                        }, call);
                    },
                    // Топ рейтинговых аниме
                    function (call) {
                        owner.get('https://api.jikan.moe/v4/top/anime?filter=favorite&limit=20 ', params, function (json) {
                            json.title = 'Лучшие аниме (MAL)';
                            json.results = owner._mapMalToLampa(json.data);
                            call(json);
                        }, call);
                    },
                    // Сейчас в эфире
                    function (call) {
                        owner.get('https://api.jikan.moe/v4/seasons/now?limit=20 ', params, function (json) {
                            json.title = 'Сейчас в эфире (MAL)';
                            json.results = owner._mapMalToLampa(json.data);
                            call(json);
                        }, call);
                    },
                    // Аниме по жанрам
                    ...myGenres.map(genre => function (call) {
                        owner.get(`https://api.jikan.moe/v4/anime?genres=${genre.id}&order_by=popularity&limit=20`, params, function (json) {
                            json.title = `Аниме: ${Lampa.Lang.translate(genre.title)}`;
                            json.results = owner._mapMalToLampa(json.data);
                            call(json);
                        }, call);
                    })
                ];

                function loadPart(partLoaded, partEmpty) {
                    Lampa.Api.partNext(parts_data, parts_limit, partLoaded, partEmpty);
                }

                loadPart(oncomplite, onerror);
                return loadPart;
            };
        };

        // Добавляем источник в Lampa
        function add() {
            var myown_anime = Object.assign({}, Lampa.Api.sources.tmdb, new SourceMAL(Lampa.Api.sources.tmdb));
            Lampa.Api.sources.myown_anime = myown_anime;
            
            Object.defineProperty(Lampa.Api.sources, 'myown_anime', {
                get: function () { return myown_anime; }
            });

            Lampa.Params.select('source', Object.assign({}, Lampa.Params.values['source'], {
                'myown_anime': 'myown_anime'
            }), 'tmdb');

            // Добавляем кнопку в меню
            var e = $('<li class="menu__item selector" data-action="rus"><div class="menu__ico">' + anime_icon + '</div><div class="menu__text">Аниме (MAL)</div></li>');
            e.on("hover:enter", function () {
                Lampa.Activity.push({
                    title: 'Аниме (MyAnimeList)',
                    component: 'main',
                    source: 'myown_anime'
                });
            });
            $(".menu .menu__list").eq(0).append(e);
        }

        if (window.appready) add();
        else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') add();
            });
        }
    }

    if (!window.plugin_myown_anime_ready) startPlugin();
})();