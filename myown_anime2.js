(function () {
    'use strict';
    
    var anime_icon = '<svg height="173" viewBox="0 0 180 173" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M126 3C126 18.464 109.435 31 89 31C68.5655 31 52 18.464 52 3C52 2.4505 52.0209 1.90466 52.0622 1.36298C21.3146 15.6761 0 46.8489 0 83C0 132.706 40.2944 173 90 173C139.706 173 180 132.706 180 83C180 46.0344 157.714 14.2739 125.845 0.421326C125.948 1.27051 126 2.13062 126 3ZM88.5 169C125.779 169 156 141.466 156 107.5C156 84.6425 142.314 64.6974 122 54.0966C116.6 51.2787 110.733 55.1047 104.529 59.1496C99.3914 62.4998 94.0231 66 88.5 66C82.9769 66 77.6086 62.4998 72.4707 59.1496C66.2673 55.1047 60.3995 51.2787 55 54.0966C34.6864 64.6974 21 84.6425 21 107.5C21 141.466 51.2208 169 88.5 169Z" fill="currentColor"></path><path d="M133 121.5C133 143.315 114.196 161 91 161C67.804 161 49 143.315 49 121.5C49 99.6848 67.804 116.5 91 116.5C114.196 116.5 133 99.6848 133 121.5Z" fill="currentColor"></path><path d="M72 81C72 89.8366 66.1797 97 59 97C51.8203 97 46 89.8366 46 81C46 72.1634 51.8203 65 59 65C66.1797 65 72 72.1634 72 81Z" fill="currentColor"></path><path d="M131 81C131 89.8366 125.18 97 118 97C110.82 97 105 89.8366 105 81C105 72.1634 110.82 65 118 65C125.18 65 131 72.1634 131 81Z" fill="currentColor"></path></svg>';

    // Жанры Shikimori
    var myGenres = [
        { id: 4,   title: 'Комедия' },
        { id: 7,   title: 'Приключения' },
        { id: 10,  title: 'Драма' },
        { id: 22,  title: 'Фэнтези' },
        { id: 27,  title: 'Детектив' },
        { id: 35,  title: 'Романтика' }
    ];

    function startPlugin() {
        window.plugin_myown_anime_ready = true;

        // Упрощенный класс для карточек
        var AnimeCard = function(data) {
            this.card = Lampa.Template.js('card');
            this.data = data;
            
            this.render = function() {
                this.card.querySelector('.card__title').textContent = this.data.title;
                this.card.querySelector('.card__age').textContent = this.data.year || '----';
                
                const img = this.card.querySelector('.card__img');
                if (this.data.poster) {
                    img.src = this.data.poster;
                    img.onerror = () => img.src = './img/img_broken.svg';
                }
                
                return this.card;
            };
        };

        // Новый класс для работы с Shikimori API
        var ShikimoriAPI = {
            baseUrl: 'https://shikimori.one/api/',
            
            fetch: function(url) {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', this.baseUrl + url);
                    xhr.setRequestHeader('User-Agent', 'Lampa-Plugin');
                    
                    xhr.onload = () => {
                        if (xhr.status === 200) {
                            try {
                                resolve(JSON.parse(xhr.responseText));
                            } catch (e) {
                                reject('Invalid JSON');
                            }
                        } else {
                            reject(`HTTP ${xhr.status}`);
                        }
                    };
                    
                    xhr.onerror = () => reject('Network error');
                    xhr.send();
                });
            },
            
            getPopular: function() {
                return this.fetch('animes?limit=20&order=popularity');
            },
            
            getByGenre: function(genreId) {
                return this.fetch(`animes?limit=20&genre=${genreId}&order=popularity`);
            }
        };

        // Источник данных для Lampa
        var SourceShikimori = function() {
            this.load = function(params, onSuccess) {
                const sections = [];
                
                // Основные разделы
                Promise.all([
                    ShikimoriAPI.getPopular().then(animes => {
                        sections.push({
                            title: 'Популярные аниме',
                            results: animes.map(a => ({
                                id: a.id,
                                title: a.russian || a.name,
                                poster: a.image?.original,
                                year: a.aired_on?.substring(0, 4),
                                type: 'anime'
                            }))
                        });
                    }).catch(console.error),
                    
                    // Разделы по жанрам
                    ...myGenres.map(genre => 
                        ShikimoriAPI.getByGenre(genre.id).then(animes => {
                            sections.push({
                                title: genre.title,
                                results: animes.map(a => ({
                                    id: a.id,
                                    title: a.russian || a.name,
                                    poster: a.image?.original,
                                    year: a.aired_on?.substring(0, 4),
                                    type: 'anime'
                                }))
                            });
                        }).catch(console.error)
                    )
                ]).then(() => {
                    onSuccess(sections);
                });
            };
        };

        // Интеграция с Lampa
        function init() {
            Lampa.Api.sources.shikimori = new SourceShikimori();
            
            // Добавляем пункт меню
            const menuItem = $(`
                <li class="menu__item selector" data-action="shikimori">
                    <div class="menu__ico">${anime_icon}</div>
                    <div class="menu__text">Аниме</div>
                </li>
            `);
            
            menuItem.on('hover:enter', () => {
                Lampa.Activity.push({
                    title: 'Аниме (Shikimori)',
                    component: 'main',
                    source: 'shikimori'
                });
            });
            
            $('.menu .menu__list').first().append(menuItem);
        }

        if (window.appready) init();
        else Lampa.Listener.follow('app', e => e.type === 'ready' && init());
    }

    if (!window.plugin_myown_anime_ready) startPlugin();
})();