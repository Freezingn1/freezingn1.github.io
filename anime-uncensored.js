(function () {
    const testItems = [
        {
            name: 'Атака титанов',
            original_title: 'Shingeki no Kyojin',
            img: 'https://image.tmdb.org/t/p/w500/aiy35Evcofzl7hASZZvsFgltHTX.jpg'
        },
        {
            name: 'Тетрадь смерти',
            original_title: 'Death Note',
            img: 'https://image.tmdb.org/t/p/w500/4tS0iy9hzzNidHAgZ0sRzy9PI24.jpg'
        },
        {
            name: 'Клинок, рассекающий демонов',
            original_title: 'Kimetsu no Yaiba',
            img: 'https://image.tmdb.org/t/p/w500/u7IE5HU8ISGmY1Yz9UXrJjYDUfP.jpg'
        }
    ];

    Component.add('anime_uncensored', {
        render: function () {
            this.html = Template.get('items');
            this.scroll = this.html.querySelector('.scroll__content');
            return this.html;
        },

        start: function () {
            this.build();

            Controller.add('anime_uncensored', {
                toggle: () => {
                    Controller.collectionSet(this.scroll);
                    Controller.collectionFocus(false);
                },
                up: Navigator.up,
                down: Navigator.down,
                left: Navigator.left,
                right: Navigator.right,
                back: Navigator.back
            });

            Controller.toggle('anime_uncensored');
        },

        build: function () {
            this.scroll.innerHTML = ''; // очистка

            testItems.forEach(item => {
                const card = Template.get('card', {
                    title: item.name,
                    original_title: item.original_title,
                    poster: item.img
                });

                this.scroll.appendChild(card);
            });
        },

        destroy: function () {
            this.html.remove();
        }
    });

    Menu.add({
        title: 'Uncensored Anime',
        url: '',
        component: 'anime_uncensored',
        name: 'uncensored_anime'
    });
})();
