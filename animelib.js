(function () {
    // Имя твоего прокси
    const PROXY_PREFIX = 'https://wild-mode-68f9.edikgarr.workers.dev/';

    Lampa.Listener.follow('full', function (event) {
        if (event.type === 'complite' && event.data && event.data.movie) {
            let movie = event.data.movie;

            // Проверяем, есть ли постер и он от cover.imglib.info
            if (movie && movie.poster && movie.poster.startsWith('https://cover.imglib.info/')) {
                movie.poster = PROXY_PREFIX + movie.poster;
            }

            // Иногда постеры в массиве "background" или "backdrop"
            if (Array.isArray(movie.background_image)) {
                movie.background_image = movie.background_image.map(img => {
                    if (img.startsWith('https://cover.imglib.info/')) {
                        return PROXY_PREFIX + img;
                    }
                    return img;
                });
            }
        }
    });

    // Для списка карточек (главные страницы, каталоги)
    Lampa.Listener.follow('card', function (event) {
        if (event.type === 'build' && event.data && event.data.poster) {
            if (event.data.poster.startsWith('https://cover.imglib.info/')) {
                event.data.poster = PROXY_PREFIX + event.data.poster;
            }
        }
    });

    console.log('Плагин прокси постеров загружен');
})();
