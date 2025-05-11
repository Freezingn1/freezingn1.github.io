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

    function AnimeUncensored() {
        let scroll, html, body;

        this.create = function () {
            html = document.createElement('div');
            html.classList.add('layer');

            body = document.createElement('div');
            body.classList.add('layer__body');

            scroll = document.createElement('div');
            scroll.classList.add('scroll__content');

            html.appendChild(body);
            body.appendChild(scroll);

            this.build();
        };

        this.build = function () {
            testItems.forEach(item => {
                let card = document.createElement('div');
                card.classList.add('card', 'card--collection');
                card.innerHTML = `
                    <div class="card__img" style="background-image: url('${item.img}')"></div>
                    <div class="card__title">${item.name}</div>
                    <div class="card__descr">${item.original_title}</div>
                `;
                scroll.appendChild(card);
            });

            this.start();
        };

        this.start = function () {
            document.body.appendChild(html);
        };
    }

    Lampa.Launcher.add({
        title: 'Uncensored Anime',
        category: 'uncensored',
        name: 'anime_uncensored',
        component: AnimeUncensored
    });
})();
