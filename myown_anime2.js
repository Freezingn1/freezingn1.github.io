(function () {
    'use strict';
    
    var anime_icon = '<svg height="173" viewBox="0 0 180 173" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M126 3C126 18.464 109.435 31 89 31C68.5655 31 52 18.464 52 3C52 2.4505 52.0209 1.90466 52.0622 1.36298C21.3146 15.6761 0 46.8489 0 83C0 132.706 40.2944 173 90 173C139.706 173 180 132.706 180 83C180 46.0344 157.714 14.2739 125.845 0.421326C125.948 1.27051 126 2.13062 126 3ZM88.5 169C125.779 169 156 141.466 156 107.5C156 84.6425 142.314 64.6974 122 54.0966C116.6 51.2787 110.733 55.1047 104.529 59.1496C99.3914 62.4998 94.0231 66 88.5 66C82.9769 66 77.6086 62.4998 72.4707 59.1496C66.2673 55.1047 60.3995 51.2787 55 54.0966C34.6864 64.6974 21 84.6425 21 107.5C21 141.466 51.2208 169 88.5 169Z" fill="currentColor"></path><path d="M133 121.5C133 143.315 114.196 161 91 161C67.804 161 49 143.315 49 121.5C49 99.6848 67.804 116.5 91 116.5C114.196 116.5 133 99.6848 133 121.5Z" fill="currentColor"></path><path d="M72 81C72 89.8366 66.1797 97 59 97C51.8203 97 46 89.8366 46 81C46 72.1634 51.8203 65 59 65C66.1797 65 72 72.1634 72 81Z" fill="currentColor"></path><path d="M131 81C131 89.8366 125.18 97 118 97C110.82 97 105 89.8366 105 81C105 72.1634 110.82 65 118 65C125.18 65 131 72.1634 131 81Z" fill="currentColor"></path></svg>';

    // Жанры (соответствуют Shikimori)
    var myGenres = [
        { id: 4,   title: 'filter_genre_cm' },   // Комедия
        { id: 7,   title: 'filter_genre_cr' },   // Приключения
        { id: 10,  title: 'filter_genre_dr' },   // Драма
        { id: 22,  title: 'filter_genre_fm' },   // Фэнтези
        { id: 27,  title: 'filter_genre_de' },   // Детектив
        { id: 35,  title: 'filter_genre_md' }    // Романтика
    ];

    function startPlugin() {
        window.plugin_myown_anime_ready = true;

        // Класс для эпизодов (адаптирован под Shikimori)
        var Episode = function(data) {
            var card = data.card || data;
            var episode = data.next_episode || data.episode || {};
            card.source = 'shikimori';
            
            Lampa.Arrays.extend(card, {
                title: card.name || card.russian || card.title,
                original_title: card.name,
                release_date: card.aired_on,
                poster_path: card.image?.original || card.image?.preview
            });
            card.release_year = (card.release_date || '0000').slice(0, 4);

            this.build = function() {
                this.card = Lampa.Template.js('card_episode');
                this.img_poster = this.card.querySelector('.card__img');
                this.img_episode = this.card.querySelector('.full-episode__img img');
                
                this.card.querySelector('.card__title').innerText = card.title;
                this.card.querySelector('.full-episode__num').innerText = card.episodes_aired || '';
                
                if (episode && episode.aired_at) {
                    this.card.querySelector('.full-episode__name').innerText = `Серия ${episode.episode_number}: ${episode.name || 'Без названия'}`;
                    this.card.querySelector('.full-episode__date').innerText = Lampa.Utils.parseTime(episode.aired_at).full;
                }

                if (card.release_year === '0000') {
                    this.card.querySelector('.card__age').remove();
                } else {
                    this.card.querySelector('.card__age').innerText = card.release_year;
                }

                this.card.addEventListener('visible', this.visible.bind(this));
            };

            this.visible = function() {
                if (card.poster_path) this.img_poster.src = card.poster_path;
                else this.img_poster.src = './img/img_broken.svg';
                
                if (episode.image) this.img_episode.src = episode.image;
                else if (card.poster_path) this.img_episode.src = card.poster_path;
                else this.img_episode.src = './img/img_broken.svg';
            };

            this.create = function() {
                this.build();
                this.card.addEventListener('hover:enter', () => {
                    if (this.onEnter) this.onEnter(this.card, card);
                });
            };

            this.destroy = function() {
                this.card?.remove();
            };
        };

        // Источник данных Shikimori (с исправленной обработкой ошибок)
        var SourceShikimori = function() {
            this.network = new Lampa.Reguest();
            this.baseUrl = 'https://shikimori.one/api/';

            this.get = function(endpoint, params, onSuccess, onError) {
                this.network.native(`${this.baseUrl}${endpoint}`, (response) => {
                    if (response && !response.error) {
                        if (onSuccess) onSuccess(response);
                    } else {
                        if (onError) onError(response?.error || 'Ошибка запроса');
                    }
                }, {
                    type: 'json',
                    headers: {
                        'User-Agent': 'Lampa Player'
                    },
                    error: (error) => {
                        if (onError) onError(error);
                    }
                });
            };

            this.main = function(params, onSuccess, onError) {
                var parts_limit = 6;
                var parts_data = [
                    // Популярные аниме
                    (call) => {
                        this.get('animes?limit=20&order=popularity', params, (json) => {
                            if (!json || json.error) {
                                call({ results: [] }); // Возвращаем пустой массив при ошибке
                                return;
                            }
                            var result = {
                                title: 'Популярные аниме (Shikimori)',
                                results: json.map(item => ({
                                    id: item.id,
                                    title: item.russian || item.name,
                                    poster_path: item.image?.original,
                                    vote_average: item.score,
                                    release_date: item.aired_on,
                                    episodes_aired: item.episodes_aired,
                                    type: 'anime'
                                }))
                            };
                            call(result);
                        }, (error) => {
                            console.error('Shikimori API error:', error);
                            call({ results: [] }); // Пустой результат при ошибке
                        });
                    },
                    // Сейчас в эфире
                    (call) => {
                        this.get('animes?limit=20&status=ongoing&order=ranked', params, (json) => {
                            if (!json || json.error) {
                                call({ results: [] });
                                return;
                            }
                            var result = {
                                title: 'Сейчас в эфире',
                                results: json.map(item => ({
                                    id: item.id,
                                    title: item.russian || item.name,
                                    poster_path: item.image?.original,
                                    vote_average: item.score,
                                    release_date: item.aired_on,
                                    type: 'anime'
                                }))
                            };
                            call(result);
                        }, (error) => {
                            console.error('Shikimori API error:', error);
                            call({ results: [] });
                        });
                    }
                ];

                // Добавляем разделы по жанрам
                myGenres.forEach(genre => {
                    parts_data.push((call) => {
                        this.get(`animes?limit=20&genre=${genre.id}&order=popularity`, params, (json) => {
                            if (!json || json.error) {
                                call({ results: [] });
                                return;
                            }
                            var result = {
                                title: `Аниме: ${Lampa.Lang.translate(genre.title)}`,
                                results: json.map(item => ({
                                    id: item.id,
                                    title: item.russian || item.name,
                                    poster_path: item.image?.original,
                                    vote_average: item.score,
                                    release_date: item.aired_on,
                                    type: 'anime'
                                }))
                            };
                            call(result);
                        }, (error) => {
                            console.error('Shikimori API error:', error);
                            call({ results: [] });
                        });
                    });
                });

                Lampa.Api.partNext(parts_data, parts_limit, onSuccess, onError || (() => {}));
            };
        };

        // Добавляем источник в Lampa
        function add() {
            var myown_anime = new SourceShikimori();
            Lampa.Api.sources.myown_anime = myown_anime;
            
            Lampa.Params.select('source', {
                ...Lampa.Params.values['source'],
                myown_anime: 'Аниме (Shikimori)'
            }, 'tmdb');

            // Добавляем кнопку в меню
            var menuItem = $('<li class="menu__item selector" data-action="anime"><div class="menu__ico">' + anime_icon + '</div><div class="menu__text">Аниме</div></li>');
            menuItem.on("hover:enter", () => {
                Lampa.Activity.push({
                    title: 'Аниме (Shikimori)',
                    component: 'main',
                    source: 'myown_anime'
                });
            });
            $(".menu .menu__list").eq(0).append(menuItem);
        }

        if (window.appready) add();
        else Lampa.Listener.follow('app', e => e.type === 'ready' && add());
    }

    if (!window.plugin_myown_anime_ready) startPlugin();
})();