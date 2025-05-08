(function() {
    // Проверка загрузки Lampa
    if (typeof Lampa === 'undefined') {
        console.warn('Lampa не обнаружена');
        return;
    }

    // Основная функция скрытия жанров
    function hideGenres() {
        const detailsBlock = document.querySelector('.full-start-new__details');
        if (!detailsBlock) return;

        // Создаем клон без жанров
        const newContent = Array.from(detailsBlock.children)
            .filter(el => !el.textContent.includes('●') && !el.textContent.match(/[А-Яа-я]+\s?\|\s?[А-Яа-я]+/))
            .map(el => el.outerHTML)
            .join('');

        // Обновляем блок
        detailsBlock.innerHTML = newContent;
    }

    // Запускаем при изменениях
    const observer = new MutationObserver(hideGenres);
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });

    // Дополнительный вызов для надежности
    if (Lampa.Listener) {
        Lampa.Listener.follow('full', hideGenres);
    }

    // Первый запуск
    setTimeout(hideGenres, 1000);
    console.log('Плагин hide-genres успешно загружен');
})();