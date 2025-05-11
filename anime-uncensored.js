(() => {
    const API_KEY = 'f83446fde4dacae2924b41ff789d2bb0';
    const LIST_ID = '146567';
    const SECTION_TITLE = 'Аниме (Uncensored)';

    function AnimeComponent() {
        let html = Template.js();
        let scroll = new Scroll({ mask: true });
        let body = $('<div class="scroll__content"></div>');

        scroll.body().append(body);
        html.find('.content__body').append(scroll.render());

        this.create = () => {
            this.activity.loader(true);

            Lampa.Api.request('list/' + LIST_ID, {
                api_key: API_KEY,
                language: 'ru-RU'
            }, (json) => {
                let items = json.items || [];

                console.log('Загружено через Lampa.Api:', items);

                if (!items.length) {
                    body.append(`<div class="empty">Список пуст</div>`);
                    this.activity.loader(false);
                    return;
                }

                items.forEach(item => {
                    let method = item.name ? 'tv' : 'movie';

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
                            method: method
                        });
                    });

                    body.append(card);
                });

                this.activity.loader(false);
                this.activity.toggle();
                scroll.render();
                scroll.update();
                Controller.enable('content');
            }, () => {
                body.append(`<div class="empty">Ошибка загрузки</div>`);
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

    function waitForMenuAndAdd(callback, retries = 10) {
        const menu = $('.menu__list').eq(0);
        if (menu.length) {
            callback(menu);
        } else if (retries > 0) {
            setTimeout(() => waitForMenuAndAdd(callback, retries - 1), 500);
        } else {
            console.warn('Не удалось найти .menu__list');
        }
    }

    function addToMenuList() {
        waitForMenuAndAdd(menu => {
            const button = $(`
                <li class="menu__item selector">
                    <div class="menu__ico">
                        <svg><use xlink:href="#icon-folder"></use></svg>
                    </div>
                    <div class="menu__text">${SECTION_TITLE}</div>
                </li>
            `);

            button.on('hover:enter', () => {
                Lampa.Activity.push({
                    url: '',
                    title: SECTION_TITLE,
                    component: 'anime_uncensored'
                });
            });

            menu.append(button);
        });
    }

    Lampa.Component.add('anime_uncensored', AnimeComponent);

    Lampa.Listener.follow('app', e => {
        if (e.type === 'ready') {
            setTimeout(addToMenuList, 1000);
        }
    });
})();
