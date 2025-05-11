(function () {
    const API_KEY = 'f83446fde4dacae2924b41ff789d2bb0';
    const LIST_ID = '8202504'; // Публичный список с аниме

    function AnimeUncensored() {
        let html;
        let items = [];

        this.create = function () {
            this.activity.loader(true);
            this.activity.backdrop = true;

            Lampa.Api.request(`list/${LIST_ID}`, {
                api_key: API_KEY,
                language: 'ru-RU'
            }, (result) => {
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
                        page: 1
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
            empty.querySelector('.empty__descr').textContent = 'Не удалось загрузить список.';
            this.activity.render(empty);
        };

        this.render = function () {
            return html;
        };

        this.pause = function () {};
        this.stop = function () {};
        this.destroy = function () {};
    }

    // Новый безопасный способ добавить в меню
    function addToMenu() {
        let added = false;

        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready' && !added) {
                const menu = Lampa.Menu.get();
                const exists = menu.find(i => i.action === 'anime_uncensored');

                if (!exists) {
                    menu.push({
                        title: 'Аниме (Uncensored)',
                        action: 'anime_uncensored',
                        component: 'anime_uncensored',
                        type: 'category'
                    });

                    Lampa.Menu.update();
                    added = true;
                }
            }
        });
    }

    Lampa.Component.add('anime_uncensored', AnimeUncensored);
    addToMenu();
})();
