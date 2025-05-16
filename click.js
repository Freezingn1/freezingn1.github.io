(function() {
    // Проверяем, работает ли скрипт в TV-режиме
    const isTV = typeof Lampa !== 'undefined' && Lampa.Platform.tv();
    const TARGET_TAB_NAME = "CUB";
    const DELAY = {
        INITIAL: isTV ? 3000 : 1000, // На TV ждём дольше
        CLICK: isTV ? 1000 : 300,
        INTERVAL: 2000
    };

    console.log(`📺 [${isTV ? 'TV' : 'Web'}] Автокликер для "${TARGET_TAB_NAME}" запущен`);

    // TV-совместимый клик
    function tvSafeClick(element) {
        if (!element) return;

        // 1. Фокусировка (обязательно для TV)
        element.focus();
        
        // 2. Имитация нажатия OK на пульте
        const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            bubbles: true
        });
        element.dispatchEvent(enterEvent);

        // 3. Обычный клик (для совместимости)
        setTimeout(() => element.click(), 200);
    }

    // Поиск нужной вкладки
    function findTab() {
        const tabs = document.querySelectorAll('.search-source.selector:not(.active)');
        for (const tab of tabs) {
            const title = tab.querySelector('.search-source__tab');
            if (title?.textContent?.trim() === TARGET_TAB_NAME) {
                return tab;
            }
        }
        return null;
    }

    // Основная функция
    function checkAndClick() {
        const tab = findTab();
        if (tab) {
            console.log(`🔍 Найдена вкладка "${TARGET_TAB_NAME}", кликаем...`);
            tvSafeClick(tab);
        }
    }

    // Запуск
    setTimeout(checkAndClick, DELAY.INITIAL);
    setInterval(checkAndClick, DELAY.INTERVAL);

    // Инициализация Lampa TV API (если доступно)
    if (isTV) {
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') checkAndClick(); // Повторная проверка при запуске
        });
    }
})();