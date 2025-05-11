(function () {
    const API_KEY = 'f83446fde4dacae2924b41ff789d2bb0';
    const LIST_ID = '8202504'; // Публичный список аниме

    function AnimeUncensored() {
        let html;
        let items = [];

        this.create = function () {
            this.activity.loader(true);
            this.activity.backdrop = true;

            Api.list(LIST_ID, (result) => {
                this.activity.loader(false);

                if (result && result.items && result.items.length) {
                    items = result.items.map((item) => {
                        item.name = item.title || item.name;
                        item.original_name = item.original_title || item.original_name;
                        return item;
                    });

                    let view = new Lampa.CardCollection({
                        title: 'Аниме (Uncensored)',
                        items: items,
                        url: '',
                        page: 1,
                        card_render: {
                            url: (item) => item.poster_path
                        },
                        card_type: 'card'
                    });

                    view.visible();

                    html = view.render();
                    this.activity.render(html);
                } else {
                    this.empty();
                }
            }, () => {
                this.activity.loader(false);
                this.empty();
            });
        };

        this.empty = function () {
            let empty = Template.get('empty');
            empty.querySelector('.empty__title').textContent = 'Здесь пусто';
            empty.querySelector('.empty__descr').textContent = 'Список не содержит элементов.';
            this.activity.render(empty);
        };

        this.pause = function () {}
        this.stop = function () {}
        this.render = function () {
            return html;
        };
        this.destroy = function () {}
    }

    function addToMenu() {
        let added = false;

        Lampa.Settings.listener.follow('open', (e) => {
            if (e.name === 'main' && !added) {
                let menu = e.body.querySelector('.menu__list');
                if (menu && !menu.querySelector('[data-action="anime_uncensored"]')) {
                    let item = document.createElement('li');
                    item.className = 'menu__item';
                    item.dataset.action = 'anime_uncensored';
                    item.innerHTML = '<span>Аниме (Uncensored)</span>';

                    item.addEventListener('click', () => {
                        Lampa.Activity.push({
                            url: '',
                            title: 'Аниме (Uncensored)',
                            component: 'anime_uncensored',
                            page: 1
                        });
                    });

                    menu.appendChild(item);
                    added = true;
                }
            }
        });
    }

    Lampa.Component.add('anime_uncensored', AnimeUncensored);

    setTimeout(addToMenu, 1000);
})();
