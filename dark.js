(function() {
    console.log("[Lampa Final Styles] Плагин запущен");

    // Список URL разделов, где НЕ нужно применять стиль card__vote
    const excludedSections = [
        '/history', '/istoriya',
        '/favorites', '/izbrannoe',
        '/releases', '/relizy',
        '/torrents', '/torrenty'
    ];

    // Проверяем текущий раздел
    function isExcludedSection() {
        const path = window.location.pathname.toLowerCase();
        return excludedSections.some(section => path.includes(section));
    }

    // Основные стили
    function applyStyles() {
        // 1. Всегда применяемые стили (меню, закладки)
        document.querySelectorAll(`
            .selectbox__content, 
            .layer--height,
            .selector__body,
            .modal-layer
        `).forEach(el => {
            el.style.cssText = 'background-color: #121212 !important;';
        });

        // 2. Специальный стиль для закладок (всегда)
        const bookmarkLayer = document.querySelector('.bookmarks-folder__layer');
        if (bookmarkLayer) {
            bookmarkLayer.style.cssText = 'background: rgba(0, 0, 0, 0.3) !important;';
        }

        // 3. Стиль для рейтинга (ТОЛЬКО если НЕ в исключённом разделе)
        if (!isExcludedSection()) {
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

    // Статические стили (рамка карточек)
    function addStaticStyles() {
        const styleId = 'lampa-final-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
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
    }

    // Запуск
    addStaticStyles();
    applyStyles();

    // Следим за сменой раздела
    let lastPath = window.location.pathname;
    const observer = new MutationObserver(() => {
        if (window.location.pathname !== lastPath) {
            lastPath = window.location.pathname;
            console.log(`[Lampa] Раздел изменён: ${lastPath}`);
            applyStyles();
        }
    });

    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });

    // Остановка плагина
    window.stopLampaFinalStyles = () => {
        observer.disconnect();
        const style = document.getElementById('lampa-final-styles');
        if (style) style.remove();
        console.log("[Lampa Final Styles] Плагин остановлен");
    };
})();