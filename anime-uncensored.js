(function () {
    const API_KEY = 'f83446fde4dacae2924b41ff789d2bb0'; // ваш TMDb API ключ
    const LIST_ID = '8202504'; // рабочий публичный список с аниме (пример)

    function AnimeUncensored() {
        let scroll = new Lampa.Scroll({ mask: true });
        let html = Template.get('items');
        let body = html.querySelector('.items__body');

        this.create = function () {
            this.activity.loader(true);

            network.silent(`https://api.themoviedb.org/3/list/${LIST_ID}?api_key=${API_KEY}&language=ru-RU`, (data) => {
                this.activity.loader(false);

                if (data && data.items && data.items.length) {
                    data.items.forEach(element => {
                        let card = Template.get('card', element);
                        card.addEventListener('hover:focus', () => {
                            Lampa.Controller.collectionSet(this.render());
                            Lampa.Controller.collectionFocus(card);
                        });

                        card.addEventListener('hover:enter', () => {
                            Lampa.Activity.push({
                                url: '',
                                component: 'full',
                                id: element.id,
                                method: element.media_type || 'tv',
                                card: element
                            });
                        });

                        body.appendChild(card);
                    });

                    scroll.append(html);
                    this.activity.render(scroll.render());
                    Lampa.Controller.enable('content');
                } else {
                    this.empty();
                }
            }, () => {
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
            return scroll.render();
        };

        this.destroy = function () {
            scroll.destroy();
            html.remove();
            scroll = null;
            html = null;
        };
    }

    function addToMenu() {
        Lampa.Settings.listener.follow('open', (e) => {
            if (e.name === 'main') {
                let menu = e.body.querySelector('.menu__list');
                if (!menu.querySelector('[data-action="anime_uncensored"]')) {
                    let item = document.createElement('li');
                    item.className = 'menu__item';
                    item.innerHTML = '<span>Аниме (Uncensored)</span>';
                    item.dataset.action = 'anime_uncensored';

                    item.addEventListener('click', () => {
                        Lampa.Activity.push({
                            url: '',
                            title: 'Аниме (Uncensored)',
                            component: 'anime_uncensored',
                            page: 1
                        });
                    });

                    menu.appendChild(item);
                }
            }
        });
    }

    Lampa.Component.add('anime_uncensored', AnimeUncensored);
    setTimeout(addToMenu, 1000); // задержка для корректной инициализации
})();
