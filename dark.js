(function() {
    console.log("[Lampa Corrected Styles] Плагин запущен");

    // Разделы, где НЕ нужно применять стиль
    const excludedSections = [
        'history', 'istoriya',
        'favorites', 'izbrannoe',
        'releases', 'relizy',
        'torrents', 'torrenty'
    ];

    // Проверка текущего раздела
    function shouldSkipStyles() {
        const path = window.location.href.toLowerCase();
        return excludedSections.some(section => path.includes(section));
    }

    // Основная функция стилей
    function applyStyles() {
        // 1. Всегда применяемые стили (меню, закладки)
        document.querySelectorAll(`
            .selectbox__content, 
            .layer--height,
            .selector__body,
            .modal-layer
        `).forEach(el => {
            el.style.backgroundColor = '#121212';
        });

        // 2. Стиль для закладок
        const bookmarkLayer = document.querySelector('.bookmarks-folder__layer');
        if (bookmarkLayer) {
            bookmarkLayer.style.background = 'rgba(0, 0, 0, 0.3)';
        }

        // 3. Стиль рейтинга (если не в исключённом разделе)
        if (!shouldSkipStyles()) {
            document.querySelectorAll('.card__vote').forEach(el => {
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

    // CSS для рамки карточек (всегда)
    const styleElement = document.createElement('style');
    styleElement.id = 'lampa-custom-css';
    styleElement.innerHTML = `
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
    document.head.appendChild(styleElement);

    // Первое применение
    applyStyles();

    // Автообновление при навигации
    let currentPath = window.location.pathname;
    const observer = new MutationObserver(() => {
        if (window.location.pathname !== currentPath) {
            currentPath = window.location.pathname;
            console.log(`[Lampa] Переход в раздел: ${currentPath}`);
            applyStyles();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Остановка плагина
    window.stopLampaStyles = () => {
        observer.disconnect();
        document.getElementById('lampa-custom-css')?.remove();
        console.log("[Lampa Corrected Styles] Плагин остановлен");
    };
})();