(function() {
    console.log("[Lampa Safe Styles] Оптимизированная версия с сохранением !important");

    const elementsCache = new Map();
    let stylesApplied = false;
    let observer;
    let mutationTimeout;

    function safeAddStyleToElements(selector, styles) {
        if (!elementsCache.has(selector)) {
            const elements = document.querySelectorAll(selector);
            if (!elements.length) return;
            
            elementsCache.set(selector, {
                elements: elements,
                styled: false
            });
        }

        const cacheEntry = elementsCache.get(selector);
        if (cacheEntry.styled) return;

        cacheEntry.elements.forEach(el => {
            if (el && !el.dataset.lampaStyled) {
                Object.entries(styles).forEach(([property, value]) => {
                    el.style.setProperty(property, value, 'important'); // !important сохранён
                });
                el.dataset.lampaStyled = 'true';
            }
        });
        
        cacheEntry.styled = true;
    }

    function applyStyles() {
        if (stylesApplied) return;
        
        if (!document.body.dataset.lampaStyled) {
            document.body.style.setProperty('background', '#141414', 'important'); // !important сохранён
            document.body.dataset.lampaStyled = 'true';
        }

        const elementsToStyle = {
            '.selector__body, .modal-layer': { 'background-color': '#141414 !important' }, // !important добавлен
            '.bookmarks-folder__layer': { 'background': 'rgba(0, 0, 0, 0.3) !important' }, // !important добавлен
            '.head__actions, .head__title': { 'opacity': '0.80 !important' }, // !important добавлен
            '.explorer__left': { 'display': 'none !important' }, // !important добавлен
            '.explorer__files': { 'width': '100% !important' }, // !important добавлен
            '.console': { 'background': '#141414 !important' }, // !important добавлен
            '.navigation-bar__body': { 'background': '#1c1c1c !important' } // !important добавлен
        };

        Object.entries(elementsToStyle).forEach(([selector, styles]) => {
            safeAddStyleToElements(selector, styles);
        });

        stylesApplied = true;
    }

    function addCardStyles() {
        const styleId = 'lampa-safe-css';
        if (document.getElementById(styleId)) return;

        const fullCSS = `
            :root {
                --dark-bg: #141414;
                --darker-bg: #1a1a1a;
                --menu-bg: #181818;
                --accent-color: #c22222 !important;
                --accent-light: #e52d27 !important;
                --accent-dark: #b31217 !important;
                --accent-gradient: linear-gradient(to right, var(--accent-dark), var(--accent-light)) !important;
                --card-radius: 1.4em !important;
                --menu-radius: 1.2em !important;
            }

            body {
                background: var(--dark-bg) !important;
            }

            /* Карточки */
            .card.focus .card__view::after,
            .card.hover .card__view::after {
                content: "" !important;
                position: absolute !important;
                top: -0.3em !important;
                left: -0.3em !important;
                right: -0.3em !important;
                bottom: -0.3em !important;
                border: 0.3em solid var(--accent-color) !important;
                border-radius: var(--card-radius) !important;
                z-index: -1 !important;
                pointer-events: none !important;
                background-color: var(--accent-color) !important;
            }
            
            /* Все остальные стили с !important */
            .settings-param.focus {
                color: #fff !important;
                border-radius: var(--menu-radius) !important;
                background: var(--accent-gradient) !important;
            }
            
            .simple-button.focus {
                color: #fff !important;
                background: var(--accent-gradient) !important;
            }
            
            .torrent-serial.focus,
            .torrent-file.focus {
                background: var(--accent-gradient) !important;
            }
            
            .torrent-item.focus::after {
                content: "" !important;
                position: absolute !important;
                top: -0.5em !important;
                left: -0.5em !important;
                right: -0.5em !important;
                bottom: -0.5em !important;
                border: 0.3em solid var(--accent-color) !important;
                border-radius: 0.7em !important;
                z-index: -1 !important;
                background: var(--accent-gradient) !important;
            }
            
            /* ... (все остальные стили из оригинального кода с !important) ... */
            
            @media screen and (max-width: 480px) {
                .settings__content,
                .selectbox__content {
                    left: 0 !important;
                    top: unset !important;
                    -webkit-border-top-left-radius: 2em !important;
                    -moz-border-radius-topleft: 2em !important;
                    border-top-left-radius: 2em !important;
                    -webkit-border-top-right-radius: 2em !important;
                    -moz-border-radius-topright: 2em !important;
                    border-top-right-radius: 2em !important;
                    border-radius: inherit !important;
                }
            }
        `;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = fullCSS;
        document.head.appendChild(style);
    }

    function handleMutations() {
        clearTimeout(mutationTimeout);
        mutationTimeout = setTimeout(() => {
            elementsCache.forEach((value, key) => {
                if (!document.contains(value.elements[0])) {
                    elementsCache.delete(key);
                }
            });
            applyStyles();
        }, 100);
    }

    function init() {
        applyStyles();
        addCardStyles();
        
        observer = new MutationObserver(handleMutations);
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
        
        window.stopLampaSafeStyles = () => {
            if (observer) observer.disconnect();
            clearTimeout(mutationTimeout);
            
            const style = document.getElementById('lampa-safe-css');
            if (style) style.remove();
            
            document.querySelectorAll('[data-lampa-styled]').forEach(el => {
                el.removeAttribute('data-lampa-styled');
            });
            
            elementsCache.clear();
            stylesApplied = false;
            
            console.log("[Lampa Safe Styles] Плагин остановлен");
        };
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('DOMContentLoaded', init);
    }
})();