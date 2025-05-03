(function() {
    console.log("[Lampa Styler] Плагин запущен");

    // Применяем тёмный фон для selectbox и layer
    function applyDarkStyles() {
        const elements = document.querySelectorAll(`
            .selectbox__content, 
            .layer--height,
            .selector__body,
            .modal-layer
        `);

        elements.forEach(el => {
            el.style.cssText = 'background-color: #121212 !important;';
        });
    }

    // Добавляем стили для карточек (рамка при фокусе/наведении)
    function applyCardStyles() {
        const style = document.createElement('style');
        style.id = 'lampa-custom-styles';
        style.innerHTML = `
            .card.focus .card__view::after,
            .card.hover .card__view::after {
                content: "";
                position: absolute;
                top: -0.3em;
                left: -0.3em;
                right: -0.3em;
                bottom: -0.3em;
                border: 0.3em solid #c22222;
                border-radius: 1.4em;
                z-index: -1;
                pointer-events: none;
                background-color: #c22222;
            }
        `;
        document.head.appendChild(style);
    }

    // Запускаем стили сразу
    applyDarkStyles();
    applyCardStyles();

    // Проверяем каждую секунду (на случай динамической загрузки)
    const interval = setInterval(() => {
        applyDarkStyles();
    }, 1000);

    // Остановка плагина (если нужно)
    window.stopLampaStyler = () => {
        clearInterval(interval);
        const style = document.getElementById('lampa-custom-styles');
        if (style) style.remove();
        console.log("[Lampa Styler] Плагин остановлен");
    };
})();