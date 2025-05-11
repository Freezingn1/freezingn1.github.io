(() => {
    const API_KEY = 'f83446fde4dacae2924b41ff789d2bb0';
    const LIST_ID = '146567';
    const SECTION_TITLE = 'Аниме (Uncensored)';

    function loadAnimeList(callback) {
        const url = `https://api.themoviedb.org/3/list/${LIST_ID}?api_key=${API_KEY}&language=ru-RU`;
        fetch(url)
            .then(res => res.json())
            .then(json => {
                const results = json.items || [];
                callback(results);
            })
            .catch(err => {
                console.error('Ошибка при загрузке аниме:', err);
                callback([]);
            });
    }

    function renderAnimePage() {
        let scroll = new Scroll({ mask: true });
        let html = Template.js();

        loadAnimeList(items => {
            let body = html.find('.content__body > .scroll__content');

            items.forEach(item => {
                let card = Template.get('card', {
                    title: item.title || item.name,
                    original_title: item.original_title || item.original_name,
                    release_date: item.release_date || item.first_air_date,
                    vote_average: item.vote_average,
                    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : ''
                });

                card.on('hover:focus', () => {
                    Background.change(item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : '');
                });

                card.on('hover:enter', () => {
                    if (item.media_type === 'tv') {
                        Lampa.Activity.push({
                            url: '',
                            title: item.name,
                            component: 'full',
                            id: item.id,
                            method: 'tv'
                        });
                    } else {
                        Lampa.Activity.push({
                            url: '',
                            title: item.title,
                            component: 'full',
                            id: item.id,
                            method: 'movie'
                        });
                    }
                });

                body.append(card);
            });

            scroll.append(body);
            Lampa.Controller.enable('content');
        });

        return html;
    }

    function addToMenu() {
        Lampa.Menu.add({
            title: SECTION_TITLE,
            component: 'anime_uncensored',
            position: 10,
            onRender: renderAnimePage
        });
    }

    Lampa.Listener.follow('app', (e) => {
        if (e.type === 'ready') {
            addToMenu();
        }
    });
})();
