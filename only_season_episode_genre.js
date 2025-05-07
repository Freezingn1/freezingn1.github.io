(function() {
    // Проверяем, что Lampa уже загружена
    if (typeof Lampa === 'undefined') {
        console.error('Lampa not found!');
        return;
    }

    // Перехватываем рендеринг карточек
    Lampa.Template.add('card_parser', (data) => {
        if (data && data.item) {
            const item = data.item;

            // Формируем массив с нужными данными
            const season = item.season ? 'S' + item.season : '';
            const episode = item.episode ? 'E' + item.episode : '';
            const genre = item.genre ? item.genre.split(',')[0].trim() : '';

            const info = [season, episode, genre].filter(Boolean);

            // Если есть блок с деталями, заменяем его содержимое
            if (data.html && data.html.find) {
                data.html.find('.full-start-new__details').html(
                    info.join('<span class="full-start-new__split">●</span>')
                );
            }
        }

        return data;
    });

    console.log('Plugin "Only Season, Episode & Genre" loaded!');
})();