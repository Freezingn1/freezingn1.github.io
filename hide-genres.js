(function() {
    // Ждем полной загрузки Lampa
    function waitForLampa() {
        if (typeof Lampa === 'undefined') {
            setTimeout(waitForLampa, 200);
            return;
        }
        initPlugin();
    }

    function initPlugin() {
        // 1. CSS-инъекция (самый безопасный метод)
        const style = document.createElement('style');
        style.id = 'hide-genres-safe-style';
        style.textContent = `
            .full-start-new__details span:nth-child(3),
            .full-start-new__details span:has(+ .full-start-new__split),
            .full-start-new__split {
                display: none !important;
                opacity: 0 !important;
                width: 0 !important;
                height: 0 !important;
                font-size: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
            }
        `;
        document.head.appendChild(style);

        // 2. Мягкий Observer с защитой
        let observer;
        const safeObserver = () => {
            try {
                observer = new MutationObserver(() => {
                    document.querySelectorAll('.full-start-new__details').forEach(el => {
                        const spans = el.querySelectorAll('span');
                        if (spans.length >= 3) {
                            // Безопасное удаление только конкретных элементов
                            if (spans[1].textContent === '●') {
                                el.removeChild(spans[1]);
                            }
                            if (spans[2].textContent.includes('|')) {
                                spans[2].style.display = 'none';
                            }
                        }
                    });
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: false
                });
            } catch (e) {
                console.error('Safe observer error:', e);
            }
        };

        // Запускаем с задержкой
        setTimeout(safeObserver, 1000);

        // Интеграция с Lampa API если доступна
        if (Lampa.Listener) {
            Lampa.Listener.follow('full', () => {
                setTimeout(safeObserver, 500);
            });
        }
    }

    // Старт
    waitForLampa();
})();