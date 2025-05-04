(function() {
    console.log("[Lampa Ultimate Styles] Плагин запущен");

    // Проверяем, находится ли пользователь в исключённом разделе
    function isExcludedSection() {
        const path = window.location.pathname.toLowerCase();
        const excludedSections = [
            '/history', 
            '/favorites', 
            '/releases', 
            '/torrents',
            // Дополнительные алиасы (если есть)
            '/istoriya', 
            '/izbrannoe',
            '/relizy'
        ];
        
        return excludedSections.some(section => path.includes(section));
    }

    // Основная функция для применения стилей
    function applyStyles() {
        // 1. Тёмный фон для элементов интерфейса
        const darkBackgroundElements = document.querySelectorAll(`
            .selectbox__content, 
            .layer--height,
            .selector__body,
            .modal-layer,
            .bookmarks-folder__layer
        `);
        
        darkBackgroundElements.forEach(el => {
            if (el.classList.contains('bookmarks-folder__layer')) {
                el.style.cssText = 'background: rgba(0, 0, 0, 0.3) !important;';
            } else {
                el.style.cssText = 'background-color: #121212 !important;';
            }
        });

        // 2. Стили для рейтинга (если не в исключённом разделе)
        if (!isExcludedSection()) {
            const voteElements = document.querySelectorAll('.card__vote');
            voteElements.forEach(el => {
                el.style.cssText = `
                    bottom: 4.8em !important;
                    top: 0 !important;
                    right: 0em !important;
                    background: #c22222 !important;
                    color: #ffffff !important;
                    font-size: 1.5em !important;
                    font-weight: 700 !important;
                    padding: 0.5em !important;
                    border-radius: 0em 0.5em 0em 0.5em !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                `;
            });
        }
    }

    // Добавляем CSS для карточек (разово)
    function addStaticStyles() {
        const styleId = 'lampa-ultimate-styles';
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
        `;
        document.head.appendChild(style);
    }

    // Первое применение
    addStaticStyles();
    applyStyles();

    // Автообновление (с проверкой раздела)
    let lastPath = window.location.pathname;
    const interval = setInterval(() => {
        if (window.location.pathname !== lastPath) {
            lastPath = window.location.pathname;
            console.log("[Lampa] Раздел изменён, перепроверяем стили");
        }
        applyStyles();
    }, 1000);

    // Функция остановки
    window.stopLampaUltimateStyles = () => {
        clearInterval(interval);
        const style = document.getElementById('lampa-ultimate-styles');
        if (style) style.remove();
        console.log("[Lampa Ultimate Styles] Плагин остановлен");
    };
})();