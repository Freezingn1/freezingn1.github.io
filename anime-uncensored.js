(function () {
    const API_KEY = 'f83446fde4dacae2924b41ff789d2bb0';
    const LIST_ID = '146567'; // ID публичного списка аниме на TMDb

    function AnimeUncensored() {
        let html;
        let items = [];

        this.create = function () {
            this.activity.loader(true);
            this.activity.backdrop = true;

            fetch(`https://api.themoviedb.org/3/list/${LIST_ID}?api_key=${API_KEY}&language=ru-RU`)
                .then(response => response.json())
                .then(result => {
                    this.activity.loader(false);

                    if (result && result.items && result.items.length) {
                        items = result.items.map(item => {
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
                })
                .catch(() => {
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
        this.start = function () {
            this.create();
        };
    }

    function injectMenuItem() {
        const checkMenu = setInterval(() => {
            const menuList = document.querySelector('.menu__list');

            if (menuList && !menuList.querySelector('[data-action="anime_uncensored"]')) {
                const item = document.createElement('li');
                item.className = 'menu__item selector';
                item.setAttribute('data-action', 'anime_uncensored');
                item.textContent = 'Аниме (Uncensored)';

                item.addEventListener('click', () => {
                    Lampa.Activity.push({
                        url: '',
                        title: 'Аниме (Uncensored)',
                        component: 'anime_uncensored',
                        page: 1
                    });
                });

                menuList.appendChild(item);
                clearInterval(checkMenu);
            }
        }, 500);
    }

    Lampa.Component.add('anime_uncensored', AnimeUncensored);
    injectMenuItem();
})();
