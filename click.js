(function() {
    const TARGET_TAB_NAME = "CUB";
    const CLICK_DELAY = 1500;
    const INITIAL_DELAY = 3000;
    const MAX_ATTEMPTS = 15; // Больше попыток для TV
    let attempts = 0;

    console.log(`📺 [TV-Web Autoclicker] Ищу вкладку "${TARGET_TAB_NAME}"...`);

    function activateTab() {
        attempts++;
        if (attempts > MAX_ATTEMPTS) {
            console.log("❌ Превышено максимальное число попыток. Проверьте структуру DOM.");
            return;
        }

        // Ищем табы разными способами (под разные версии интерфейса)
        const tabs = document.querySelectorAll(`
            .search-source.selector:not(.active),
            [class*="tab"]:not([class*="active"]),
            [role="tab"]:not([aria-selected="true"]),
            [data-testid*="tab"]:not([aria-selected="true"])
        `);

        for (const tab of tabs) {
            const tabName = tab.textContent?.trim() || tab.getAttribute('aria-label') || '';
            if (tabName.toUpperCase().includes(TARGET_TAB_NAME)) {
                setTimeout(() => {
                    console.log(`🎯 Найдена вкладка: "${tabName}"`);

                    // Способ 1: Обычный клик (для Web)
                    if (typeof tab.click === 'function') {
                        tab.click();
                        console.log("🖱️ Клик выполнен (Web-версия)");
                        return;
                    }

                    // Способ 2: Фокус + Enter (для TV)
                    if (typeof tab.focus === 'function') {
                        tab.focus();
                        console.log("🔍 Установлен фокус (TV)");

                        // Эмулируем нажатие Enter
                        const enterEvent = new KeyboardEvent('keydown', {
                            key: 'Enter',
                            code: 'Enter',
                            keyCode: 13,
                            bubbles: true,
                        });
                        tab.dispatchEvent(enterEvent);
                        console.log("⌨️ Симуляция Enter (TV)");
                        return;
                    }

                    // Способ 3: Программный триггер события (если не сработало)
                    const event = new MouseEvent('click', { bubbles: true });
                    tab.dispatchEvent(event);
                    console.log("⚡ Использован программный клик");
                }, CLICK_DELAY);
                return;
            }
        }

        // Если не нашли, повторяем через 1 сек
        setTimeout(activateTab, 1000);
    }

    // Наблюдаем за изменениями DOM (вдруг табы подгружаются динамически)
    const observer = new MutationObserver(activateTab);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'aria-selected'],
    });

    // Первый запуск
    setTimeout(activateTab, INITIAL_DELAY);
})();