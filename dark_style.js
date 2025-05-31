(function() {
    console.log("[Lampa Safe Styles] Оптимизированный плагин запущен");

    // Кеш элементов и флаги стилей
    const elementsCache = new Map();
    let stylesApplied = false;

    /**
     * Безопасное добавление стилей с кешированием и проверкой
     * @param {string} selector - CSS селектор
     * @param {Object} styles - Объект стилей
     */
    function safeAddStyleToElements(selector, styles) {
        if (!elementsCache.has(selector)) {
            elementsCache.set(selector, {
                elements: document.querySelectorAll(selector),
                styled: false
            });
        }

        const cacheEntry = elementsCache.get(selector);
        if (cacheEntry.styled) return;

        cacheEntry.elements.forEach(el => {
            if (el && !el.dataset.styled) {
                Object.entries(styles).forEach(([property, value]) => {
                    el.style.setProperty(property, value, 'important');
                });
                el.dataset.styled = 'true';
            }
        });
        
        cacheEntry.styled = true;
    }

    /**
     * Основная функция применения стилей
     */
    function applyStyles() {
        if (stylesApplied) return;
        
        // Базовые стили body
        if (!document.body.dataset.styled) {
            document.body.style.setProperty('background', '#141414', 'important');
            document.body.dataset.styled = 'true';
        }

        // Группы элементов и их стили
        const elementsToStyle = {
            '.selector__body, .modal-layer': { 'background-color': '#141414' },
            '.bookmarks-folder__layer': { 'background': 'rgba(0, 0, 0, 0.3)' },
            '.head__actions, .head__title': { 'opacity': '0.80' }
        };

        Object.entries(elementsToStyle).forEach(([selector, styles]) => {
            safeAddStyleToElements(selector, styles);
        });

        stylesApplied = true;
    }

    /**
     * Добавляет CSS стили с оптимизацией
     */
    function addCardStyles() {
        const styleId = 'lampa-safe-css';
        if (document.getElementById(styleId)) return;

        // CSS переменные для часто используемых значений
        const cssVariables = `
            :root {
                --dark-bg: #141414;
                --darker-bg: #1a1a1a;
                --accent-color: #c22222;
                --accent-gradient: linear-gradient(to right, #b31217, #e52d27);
                --card-radius: 1.4em;
            }
        `;

        // Основные стили
        const mainCSS = `
            ${cssVariables}

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
            
            /* Элементы в фокусе */
            .settings-param.focus,
            .simple-button.focus,
            .torrent-serial.focus,
            .torrent-file.focus,
            .tag-count.focus,
            .full-person.focus,
            .full-review.focus,
            .menu__item.focus, 
            .menu__item.traverse, 
            .menu__item.hover,
            .head__action.focus,
            .selectbox-item.focus,
            .settings-folder.focus {
                color: #fff !important;
                background: var(--accent-gradient) !important;
            }
            
            /* Меню */
            .menu__item {
                border-radius: 0em 15em 14em 0em;
            }
            
            .menu__list {
                padding-left: 0;
            }
            
            /* Модальные окна */
            .modal__content {
                background-color: var(--darker-bg) !important;
                max-height: 90vh;
                overflow: hidden;
            }
            
            /* Адаптивные стили */
            @media screen and (max-width: 480px) {
                .settings__content, 
                .selectbox__content {
                    left: 0 !important;
                    top: unset !important;
                }
                
                .ru-title-full,
                .ru-title-full:hover {
                    max-width: none !important;
                    text-align: center !important;
                }
            }
            
            /* Отключение ненужных анимаций */
            body.advanced--animation .head .head__action.focus,
            body.advanced--animation .menu .menu__item.focus {
                animation: none !important;
            }
            
            /* Оптимизированные градиенты */
            .card__type {
                background: var(--accent-gradient) !important; 
            }
            
            .noty__body {
                background: var(--accent-gradient);
                box-shadow: 0 -4px 10px rgb(22 22 22 / 50%);
            }
        `;

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = mainCSS;
        
        // Добавляем стили после полной загрузки страницы
        if (document.readyState === 'complete') {
            document.head.appendChild(style);
        } else {
            window.addEventListener('load', () => {
                document.head.appendChild(style);
            });
        }
    }

    // Оптимизированный наблюдатель за DOM
    const observer = new MutationObserver((mutations) => {
        let needsUpdate = mutations.some(mutation => 
            mutation.addedNodes.length > 0 || 
            mutation.type === 'attributes'
        );
        
        if (needsUpdate) {
            requestAnimationFrame(() => {
                applyStyles();
                elementsCache.clear(); // Сброс кеша при изменениях DOM
                stylesApplied = false;
            });
        }
    });

    // Настройка наблюдателя
    const observerConfig = {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    };

    // Инициализация
    function init() {
        // Первое применение стилей
        applyStyles();
        addCardStyles();
        
        // Начинаем наблюдение
        observer.observe(document.body, observerConfig);
        
        // Периодическая проверка (резервный механизм)
        const backupCheck = setInterval(() => {
            if (!stylesApplied) {
                applyStyles();
            }
        }, 10000);
        
        // Очистка при остановке
        window.stopLampaSafeStyles = () => {
            clearInterval(backupCheck);
            observer.disconnect();
            
            // Удаление стилей
            const style = document.getElementById('lampa-safe-css');
            if (style) style.remove();
            
            // Сброс флагов
            document.querySelectorAll('[data-styled]').forEach(el => {
                el.removeAttribute('data-styled');
            });
            
            elementsCache.clear();
            stylesApplied = false;
            
            console.log("[Lampa Safe Styles] Плагин остановлен");
        };
    }

    // Запуск после полной загрузки DOM
    if (document.readyState !== 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();