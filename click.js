(function() {
    const PLUGIN_NAME = "AutoClickPlayButton";
    console.log(`[${PLUGIN_NAME}] Плагин запущен`);

    // Отслеживаем только добавление элементов, избегая рекурсии
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
                const button = document.querySelector('.button--play:not(.clicked)');
                if (button) {
                    button.click();
                    button.classList.add('clicked'); // Помечаем кнопку как обработанную
                    console.log(`[${PLUGIN_NAME}] Кнопка "Play" нажата!`);
                }
            }
        });
    });

    // Наблюдаем только за body и его дочерними элементами
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Первая проверка при загрузке
    const initialButton = document.querySelector('.button--play');
    if (initialButton) {
        initialButton.click();
        initialButton.classList.add('clicked');
        console.log(`[${PLUGIN_NAME}] Кнопка найдена при загрузке!`);
    }
})();