(function() {
    console.log("[Lampa DarkBG] Скрипт запущен");

    function applyDarkStyles() {
        const elements = document.querySelectorAll(`
            .selectbox__content, 
            .layer--height,
            .selector__body,
            .modal-layer
        `);

        if (elements.length === 0) {
            console.log("[Lampa DarkBG] Элементы не найдены, ждём...");
            return;
        }

        elements.forEach(el => {
            el.style.cssText = 'background-color: #121212 !important;';
        });
        console.log(`[Lampa DarkBG] Обработано ${elements.length} элементов`);
    }

    // Первый запуск
    applyDarkStyles();

    // Повторный проверяем каждую секунду
    const interval = setInterval(applyDarkStyles, 1000);

    // Остановка (если нужно)
    window.stopDarkBG = () => {
        clearInterval(interval);
        console.log("[Lampa DarkBG] Остановлено");
    };
})();