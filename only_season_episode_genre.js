(function() {
    if (typeof Lampa === 'undefined') {
        console.error("Lampa не найдена!");
        return;
    }

    // Перехватываем рендер карточки
    Lampa.Template.add('card:after', (html, item) => {
        if (!html || !html.find || !item) return;

        // Достаём данные (проверяем разные варианты)
        const season = item.season || item.s || item.info?.season;
        const episode = item.episode || item.e || item.info?.episode;
        const genre = (item.genre || item.genres || '').split(',')[0].trim();

        // Формируем строку
        let info = [];
        if (season) info.push('S' + season);
        if (episode) info.push('E' + episode);
        if (genre) info.push(genre);

        // Пробуем разные классы для вставки
        const detailsBlock = html.find('.full-start-new__details, .card__meta, .meta');
        if (detailsBlock.length) {
            detailsBlock.html(info.join(' • '));
        } else {
            console.log("Не найден блок для вставки информации");
        }
    });

    console.log("Плагин успешно загружен!");
})();