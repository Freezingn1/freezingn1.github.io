(function() {
    console.log("[Lampa Safe Styles] Оптимизированная версия 1.1");

    // Кеш элементов
    const elementsCache = new Map();
    let stylesApplied = false;
    let observer;
    let mutationTimeout;

    /**
     * Добавление стилей с кешированием элементов (оптимизированная версия)
     */
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
                    el.style.setProperty(property, value, 'important');
                });
                el.dataset.lampaStyled = 'true';
            }
        });
        
        cacheEntry.styled = true;
    }

    /**
     * Оптимизированное применение базовых стилей
     */
    function applyStyles() {
        if (stylesApplied) return;
        
        // Стили для body (применяются один раз)
        if (!document.body.dataset.lampaStyled) {
            document.body.classList.add('lampa-dark-body');
            document.body.dataset.lampaStyled = 'true';
        }

        // Основные элементы интерфейса
        const elementsToStyle = {
            '.selector__body, .modal-layer': { 'background-color': '#141414' },
            '.bookmarks-folder__layer': { 'background': 'rgba(0, 0, 0, 0.3)' },
            '.head__actions, .head__title': { 'opacity': '0.80' },
            '.explorer__left': { 'display': 'none' },
            '.explorer__files': { 'width': '100%' },
            '.console': { 'background': '#141414' },
            '.navigation-bar__body': { 'background': '#1c1c1c' }
        };

        Object.entries(elementsToStyle).forEach(([selector, styles]) => {
            safeAddStyleToElements(selector, styles);
        });

        stylesApplied = true;
    }

    /**
     * Добавление CSS стилей (оптимизированная версия)
     */
    function addCardStyles() {
        const styleId = 'lampa-safe-css';
        if (document.getElementById(styleId)) return;

        const fullCSS = `
            :root {
                --dark-bg: #141414;
                --darker-bg: #1a1a1a;
                --menu-bg: #181818;
                --accent-color: #c22222;
                --accent-light: #e52d27;
                --accent-dark: #b31217;
                --accent-gradient: linear-gradient(to right, var(--accent-dark), var(--accent-light));
                --card-radius: 1.4em;
                --menu-radius: 1.2em;
            }

            .lampa-dark-body {
                background: var(--dark-bg) !important;
            }

            /* Карточки */
            .card.focus .card__view::after,
            .card.hover .card__view::after {
                content: "";
                position: absolute;
                top: -0.3em;
                left: -0.3em;
                right: -0.3em;
                bottom: -0.3em;
                border: 0.3em solid var(--accent-color);
                border-radius: var(--card-radius);
                z-index: -1;
                pointer-events: none;
                background-color: var(--accent-color);
            }
            
            /* Остальные стили остаются без изменений */
            /* ... (вставьте остальную часть вашего CSS здесь) ... */
        `;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = fullCSS; // Используем textContent вместо innerHTML
        document.head.appendChild(style);
    }

    /**
     * Оптимизированный обработчик мутаций
     */
    function handleMutations() {
        clearTimeout(mutationTimeout);
        mutationTimeout = setTimeout(() => {
            // Очищаем только несуществующие элементы из кеша
            elementsCache.forEach((value, key) => {
                if (!document.contains(value.elements[0])) {
                    elementsCache.delete(key);
                }
            });
            
            applyStyles();
        }, 100); // Задержка 100мс для группировки мутаций
    }

    // Инициализация (оптимизированная)
    function init() {
        // Применяем стили сразу
        applyStyles();
        addCardStyles();
        
        // Наблюдатель с ограниченной областью видимости
        observer = new MutationObserver(handleMutations);
        
        // Наблюдаем только за добавлением/удалением элементов и изменениями классов
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
        
        // Функция остановки
        window.stopLampaSafeStyles = () => {
            if (observer) observer.disconnect();
            clearTimeout(mutationTimeout);
            
            // Удаление стилей
            const style = document.getElementById('lampa-safe-css');
            if (style) style.remove();
            
            // Сброс атрибутов
            document.querySelectorAll('[data-lampa-styled]').forEach(el => {
                el.removeAttribute('data-lampa-styled');
            });
            
            elementsCache.clear();
            stylesApplied = false;
            
            console.log("[Lampa Safe Styles] Плагин остановлен");
        };
    }

    // Запуск
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('DOMContentLoaded', init); // Используем DOMContentLoaded вместо load
    }
})();