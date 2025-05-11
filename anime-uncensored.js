(() => {
    const API_KEY = 'f83446fde4dacae2924b41ff789d2bb0';
    const LIST_ID = '146567';
    const SECTION_TITLE = 'Аниме (Uncensored)';

    function createComponent() {
        let html = Template.js();
        let scroll = new Scroll({ mask: true });
        let body = $('<div class="scroll__content"></div>');

        scroll.body().append(body);
        html.find('.content__body').append(scroll.render());

        this.create = () => {
            this.activity.loader(true);

            fetch(`https://api.themoviedb.org/3/list/${LIST_ID}?api_key=${API_KEY}&language=ru-RU`)
                .then(res => res.json())
                .then(json => {
                    let items = json.items || [];

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
                            Lampa.Activity.push({
                                url: '',
                                title: item.title || item.name,
                                component: 'full',
                                id: item.id,
                                method: item.media_type === 'tv' ? 'tv' : 'movie'
                            });
                        });

                        body.append(card);
                    });

                    this.activity.loader(false);
                    this.activity.toggle();
                    scroll.render();
                    scroll.update();
                    Controller.enable('content');
                })
                .catch(e => {
                    console.error('Ошибка загрузки:', e);
                    this.activity.loader(false);
                });
        };

        this.pause = () => {};
        this.stop = () => {};
        this.destroy = () => {
            scroll.destroy();
            html.remove();
            body.remove();
        };

        this.render = () => html;
    }

    // Добавляем пункт в главное меню через "Категории"
    function addToMainMenu() {
        Lampa.Settings.main().update([
            {
                title: SECTION_TITLE,
                onClick: () => {
                    Lampa.Activity.push({
                        url: '',
                        title: SECTION_TITLE,
                        component: 'anime_uncensored'
                    });
                }
            }
        ]);
    }

    // Регистрируем компонент
    Lampa.Component.add('anime_uncensored', createComponent);

    // Ждём, пока приложение будет готово
    Lampa.Listener.follow('app', e => {
        if (e.type === 'ready') {
            addToMainMenu();
        }
    });
})();
