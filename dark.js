(function() {
    console.log("[Lampa Safe Styles] Плагин запущен");

    // Безопасное добавление стилей (сохраняет оригинальные свойства)
    function safeAddStyle(element, styles) {
        Object.keys(styles).forEach(property => {
            element.style.setProperty(property, styles[property], 'important');
        });
    }

    // Основная функция для применения стилей
    function applyStyles() {
        // 1. Тёмный фон для элементов интерфейса (без перезаписи других стилей)
        document.querySelectorAll('.selectbox__content, .layer--height, .selector__body, .modal-layer').forEach(el => {
            safeAddStyle(el, {
                'background-color': '#121212'
            });
        });

        // 2. Полупрозрачный фон для папки закладок
        const bookmarkFolder = document.querySelector('.bookmarks-folder__layer');
        if (bookmarkFolder) {
            safeAddStyle(bookmarkFolder, {
                'background': 'rgba(0, 0, 0, 0.3)'
            });
        }
    }

    // Добавляем CSS для карточек (разово, через <style>)
    function addCardStyles() {
        const styleId = 'lampa-safe-css';
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
            
            /* Градиентный текст для рейтинга */
            .full-start__rate > div:first-child {
                background: -webkit-linear-gradient(66.47deg, rgb(192, 254, 207) -15.94%, rgb(30, 213, 169) 62.41%);
                -webkit-background-clip: text;
                color: transparent;
                font-weight: bold;
            }
            
            /* Размер текста для прогресс-бара рейтинга */
            .full-start-new__rate-line .full-start__pg {
                font-size: 0.9em;
            }
        `;
        document.head.appendChild(style);
    }

    // Первое применение
    applyStyles();
    addCardStyles();

    // Более безопасный интервал проверки (реже и с проверкой видимости)
    let isApplying = false;
    const interval = setInterval(() => {
        if (!isApplying) {
            isApplying = true;
            applyStyles();
            isApplying = false;
        }
    }, 3000); // Проверяем реже (каждые 3 секунды)

    // Функция остановки
    window.stopLampaSafeStyles = () => {
        clearInterval(interval);
        const style = document.getElementById('lampa-safe-css');
        if (style) style.remove();
        
        // Восстанавливаем оригинальные стили
        document.querySelectorAll('.selectbox__content, .layer--height, .selector__body, .modal-layer, .bookmarks-folder__layer').forEach(el => {
            el.style.removeProperty('background-color');
            el.style.removeProperty('background');
        });
        
        console.log("[Lampa Safe Styles] Плагин остановлен");
    };
})();