(function() {
    const TARGET_TAB = "CUB"; // Можно поменять на точное название
    const DELAY = 2000; // Интервал проверки
    const MAX_ATTEMPTS = 15;
    let attempts = 0;

    console.log(`🔧 Автокликер v4 запущен (ищем "${TARGET_TAB}")`);

    function findAndActivate() {
        attempts++;
        if (attempts > MAX_ATTEMPTS) {
            console.warn("❌ Превышено максимальное число попыток");
            return;
        }

        // 1. Альтернативные названия для поиска
        const targetVariants = [
            TARGET_TAB,
            TARGET_TAB.toUpperCase(),
            TARGET_TAB.toLowerCase()
        ];

        // 2. Все возможные селекторы вкладок
        const tabSelectors = [
            '[class*="tab"]',
            '[role="tab"]',
            '[class*="source"]',
            '[class*="selector"]',
            '[data-testid*="tab"]',
            '[aria-label*="tab"]',
            'button, div, a, li' // Крайний случай
        ].join(',');

        // 3. Поиск элемента
        const tabs = document.querySelectorAll(tabSelectors);
        
        tabs.forEach(tab => {
            // 4. Проверка текста разными способами
            const textSources = [
                tab.textContent,
                tab.innerText,
                tab.getAttribute('aria-label'),
                tab.getAttribute('title'),
                tab.getAttribute('data-name')
            ].filter(Boolean);

            const isTargetTab = textSources.some(text => 
                targetVariants.some(variant => 
                    String(text).trim().toUpperCase().includes(variant.toUpperCase())
                )
            );

            // 5. Активация при нахождении
            if (isTargetTab) {
                console.log("🎯 Найден подходящий элемент:", tab);
                
                // Основные методы активации
                const activationMethods = [
                    () => tab.click(), // 1. Стандартный клик
                    () => { // 2. Фокус + Enter
                        tab.focus();
                        tab.dispatchEvent(new KeyboardEvent('keydown', {
                            key: 'Enter',
                            code: 'Enter',
                            keyCode: 13,
                            bubbles: true
                        }));
                    },
                    () => { // 3. Событие мыши
                        tab.dispatchEvent(new MouseEvent('click', {
                            bubbles: true,
                            view: window
                        }));
                    }
                ];

                // Пробуем все методы
                activationMethods.forEach((method, i) => {
                    setTimeout(() => {
                        try {
                            method();
                            console.log(`⚡ Метод ${i+1} применён`);
                        } catch (e) {
                            console.warn(`⚠️ Метод ${i+1} не сработал:`, e.message);
                        }
                    }, i * 1000); // Растягиваем попытки по времени
                });

                return;
            }
        });

        // Повторная проверка
        setTimeout(findAndActivate, DELAY);
    }

    // Запуск
    findAndActivate();

    // Наблюдатель для динамического контента
    new MutationObserver(findAndActivate)
        .observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style', 'aria-selected']
        });
})();