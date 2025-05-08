(function() {
    // Проверяем, что Lampa существует
    if (typeof Lampa === 'undefined') {
        console.error('Lampa не найдена! Плагин hide-genres не может работать.');
        return;
    }

    // Основная функция скрытия жанров
    function hideGenres() {
        const detailsContainer = document.querySelector('.full-start-new__details');
        if (!detailsContainer) return;

        // Ищем второй блок (обычно там жанры)
        const genreBlock = detailsContainer.querySelector('.full-start-new__details-item:nth-child(2)');
        if (genreBlock) genreBlock.style.display = 'none';
    }

    // Запускаем при загрузке страницы и при изменениях (SPA)
    document.addEventListener('DOMContentLoaded', hideGenres);
    Lampa.Listener.follow('full', hideGenres);

    console.log('Плагин hide-genres: жанры скрыты!');
})();