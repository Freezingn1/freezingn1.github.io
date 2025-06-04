(function() {
    'use strict';

    // Конфигурация
    var config = {
        name: "Anilibria",
        icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M10,17l-5-5l1.41-1.41L10,14.17l7.59-7.59L19,8L10,17z"/></svg>',
        menuTitle: "Anilibria",
        componentName: "anilibria"
    };

    // Парсер
    var parser = {
        name: config.name,
        baseUrl: "https://anilib.me",

        search: async function(query) {
            try {
                let res = await fetch(`https://anilib.me/api/v2/searchTitle?search=${encodeURIComponent(query)}`);
                let data = await res.json();
                return data.list.map(item => ({
                    id: item.id,
                    name: item.names.ru,
                    year: item.season.year,
                    poster: `https://anilib.me${item.posters.medium}`,
                    url: `https://anilib.me/ru/anime/${item.id}`
                }));
            } catch (e) {
                return [];
            }
        },

        getEpisodes: async function(id) {
            try {
                let res = await fetch(`https://anilib.me/api/v2/title?id=${id}`);
                let data = await res.json();
                return data.episodes.list.map(ep => ({
                    id: ep.episode_id,
                    name: `Серия ${ep.episode}`,
                    url: `https://anilib.me/ru/anime/${id}/watch?episode=${ep.episode_id}`
                }));
            } catch (e) {
                return [];
            }
        },

        getVideoUrl: async function(url) {
            try {
                let episode_id = url.match(/episode=(\d+)/)[1];
                let res = await fetch(`https://anilib.me/api/v2/player?episode_id=${episode_id}`);
                let data = await res.json();
                return {
                    url: `https://video1.anilib.me${data.url}`,
                    headers: {
                        "Referer": "https://anilib.me/",
                        "Origin": "https://anilib.me"
                    }
                };
            } catch (e) {
                return null;
            }
        }
    };

    // Компонент для отображения
    function component(object) {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var files = new Lampa.Explorer(object);

        this.initialize = function() {
            this.loading(true);
            scroll.body().addClass('torrent-list');
            files.appendFiles(scroll.render());
            scroll.body().append(Lampa.Template.get('lampac_content_loading'));
            Lampa.Controller.enable('content');
            this.loading(false);
            
            this.loadEpisodes();
        };

        this.loadEpisodes = function() {
            var _this = this;
            parser.getEpisodes(object.movie.id)
                .then(function(episodes) {
                    if (episodes.length) {
                        _this.display(episodes);
                    } else {
                        _this.empty();
                    }
                })
                .catch(function() {
                    _this.empty();
                });
        };

        this.display = function(episodes) {
            var _this = this;
            scroll.clear();
            
            episodes.forEach(function(episode) {
                var html = Lampa.Template.get('lampac_prestige_full', {
                    title: episode.name,
                    info: config.name,
                    time: "",
                    quality: "1080p"
                });
                
                html.on('hover:enter', function() {
                    _this.playEpisode(episode);
                });
                
                scroll.append(html);
            });
            
            Lampa.Controller.enable('content');
        };

        this.playEpisode = function(episode) {
            var _this = this;
            this.loading(true);
            
            parser.getVideoUrl(episode.url)
                .then(function(result) {
                    _this.loading(false);
                    if (result) {
                        Lampa.Player.play({
                            title: episode.name,
                            url: result.url,
                            headers: result.headers
                        });
                    } else {
                        Lampa.Noty.show("Не удалось загрузить видео");
                    }
                })
                .catch(function() {
                    _this.loading(false);
                    Lampa.Noty.show("Ошибка загрузки видео");
                });
        };

        this.empty = function() {
            scroll.clear();
            scroll.append(Lampa.Template.get('lampac_does_not_answer', {
                title: "Нет данных",
                text: "Не удалось загрузить список серий"
            }));
        };

        this.loading = function(status) {
            if (status) Lampa.Loading.start();
            else Lampa.Loading.stop();
        };

        // Остальные необходимые методы
        this.create = function() { return this.render(); };
        this.render = function() { return files.render(); };
        this.back = function() { Lampa.Activity.backward(); };
        this.pause = function() {};
        this.stop = function() {};
        this.destroy = function() {
            network.clear();
            files.destroy();
            scroll.destroy();
        };
    }

    // Регистрация плагина
    if (!window.anilibria_plugin && typeof Lampa !== 'undefined') {
        window.anilibria_plugin = true;

        // 1. Добавляем кнопку в главное меню
        Lampa.Menu.main.add({
            icon: config.icon,
            name: config.menuTitle,
            component: config.componentName,
            onSelect: function() {
                Lampa.Activity.push({
                    url: '',
                    title: config.menuTitle,
                    component: config.componentName,
                    search: '',
                    movie: {id: '', title: config.menuTitle}
                });
            }
        });

        // 2. Добавляем компонент
        Lampa.Component.add(config.componentName, component);

        // 3. Добавляем кнопку на страницу аниме
        Lampa.Listener.follow('full', function(e) {
            if (e.type == 'complite') {
                // Проверяем, есть ли это аниме в Anilibria
                parser.search(e.data.movie.title).then(function(results) {
                    if (results.length > 0) {
                        var match = results.find(function(item) {
                            return item.name.toLowerCase() === e.data.movie.title.toLowerCase();
                        });

                        if (match) {
                            var button = $(`
                                <div class="full-start__button selector view--anilibria">
                                    ${config.icon}
                                    <span>${config.name}</span>
                                </div>
                            `);

                            button.on('hover:enter', function() {
                                Lampa.Activity.push({
                                    url: match.url,
                                    title: match.name,
                                    component: config.componentName,
                                    movie: match
                                });
                            });

                            e.object.activity.render().find('.full-start__buttons').append(button);
                        }
                    }
                });
            }
        });

        // 4. Добавляем переводы
        Lampa.Lang.add({
            anilibria_watch: {
                ru: 'Смотреть на Anilibria',
                en: 'Watch on Anilibria',
                uk: 'Дивитися на Anilibria'
            }
        });
    }

})();