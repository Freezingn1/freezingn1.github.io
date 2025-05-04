(function() {
    console.log("[Lampa Custom Styles] Плагин запущен");

    // Основная функция для применения стилей
    function applyStyles() {
        // 1. Тёмный фон для элементов интерфейса
        const darkBackgroundElements = document.querySelectorAll(`
            .selectbox__content, 
            .layer--height,
            .selector__body,
            .modal-layer
        `);
        
        darkBackgroundElements.forEach(el => {
            el.style.cssText = 'background-color: rgb(0 0 0 / 25%) !important;';
        });

        // 2. Полупрозрачный фон для папки закладок
        const bookmarkFolder = document.querySelector('.bookmarks-folder__layer');
        if (bookmarkFolder) {
            bookmarkFolder.style.cssText = 'background: rgba(0, 0, 0, 0.3) !important;';
        }
    }

    // Добавляем CSS для карточек (разово, через <style>)
    function addCardStyles() {
        const styleId = 'lampa-custom-css';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            /* Красная рамка для карточек */
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

            /* Полупрозрачный фон для папки закладок */
            .bookmarks-folder__layer {
                background: rgba(0, 0, 0, 0.3) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Первое применение
    applyStyles();
    addCardStyles();

    // Автообновление стилей (каждую секунду)
    const interval = setInterval(applyStyles, 1000);

    // Функция остановки
    window.stopLampaCustomStyles = () => {
        clearInterval(interval);
        const style = document.getElementById('lampa-custom-css');
        if (style) style.remove();
        console.log("[Lampa Custom Styles] Плагин остановлен");
    };
})();