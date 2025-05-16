(function() {
    const TARGET_TAB_NAME = "CUB";
    const DELAY_BETWEEN_ATTEMPTS = 2000; // 2 сек
    const MAX_ATTEMPTS = 10;
    let found = false;

    console.log(`🔍 Ищем вкладку "${TARGET_TAB_NAME}"...`);

    function tryActivateTab(attempt = 1) {
        if (found || attempt > MAX_ATTEMPTS) return;

        // 1. Ищем все возможные элементы, похожие на вкладки
        const potentialTabs = document.querySelectorAll(`
            [class*="tab"], 
            [role="tab"], 
            [class*="source"],
            [class*="selector"],
            [data-testid*="tab"]
        `);

        // 2. Перебираем все найденные элементы
        for (const tab of potentialTabs) {
            const tabText = (
                tab.textContent?.trim() || 
                tab.getAttribute('aria-label') || 
                tab.getAttribute('title') || 
                ''
            ).toUpperCase();

            if (tabText.includes(TARGET_TAB_NAME)) {
                // 3. Пытаемся активировать разными способами
                const activate = () => {
                    console.log(`✅ Найдена вкладка: "${tabText.trim()}"`);
                    
                    // Способ 1: Стандартный клик
                    if (typeof tab.click === 'function') {
                        tab.click();
                        console.log("→ Использован .click()");
                        return true;
                    }

                    // Способ 2: Фокус + эмуляция Enter (для TV)
                    tab.focus?.();
                    const keyboardEvent = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        bubbles: true
                    });
                    tab.dispatchEvent(keyboardEvent);
                    console.log("→ Использован Enter через фокус");

                    // Способ 3: Программное событие
                    const mouseEvent = new MouseEvent('click', {
                        bubbles: true,
                        view: window
                    });
                    tab.dispatchEvent(mouseEvent);
                    return true;
                };

                if (activate()) {
                    found = true;
                    return;
                }
            }
        }

        // 4. Если не нашли - повторяем через время
        console.log(`🔄 Попытка ${attempt}/${MAX_ATTEMPTS}`);
        setTimeout(() => tryActivateTab(attempt + 1), DELAY_BETWEEN_ATTEMPTS);
    }

    // Запускаем первый раз сразу, затем при изменениях DOM
    tryActivateTab();
    
    const observer = new MutationObserver(tryActivateTab);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
    });
})();