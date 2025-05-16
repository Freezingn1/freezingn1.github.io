(function() {
    const TARGET_NAME = "CUB";
    const DELAY = {
        INITIAL: 5000,
        CLICK: 2000,
        INTERVAL: 3000
    };
    
    console.log(`📺 TV-кликер для "${TARGET_NAME}" запущен`);
    
    function findCubTab() {
        // Расширенные селекторы для TV
        const selectors = [
            '.search-source.selector:not(.active)',
            '.tv-source-item', // Альтернативные классы
            '[data-testid="source-tab"]'
        ];
        
        for (const selector of selectors) {
            const tabs = document.querySelectorAll(selector);
            for (const tab of tabs) {
                const title = tab.querySelector('.title, .search-source__tab');
                if (title?.textContent?.trim() === TARGET_NAME) {
                    return tab;
                }
            }
        }
        return null;
    }
    
    function tvClick(element) {
        element.focus();
        setTimeout(() => {
            element.click();
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            element.dispatchEvent(enterEvent);
        }, DELAY.CLICK);
    }
    
    function check() {
        const cubTab = findCubTab();
        if (cubTab) {
            console.log('Найдена вкладка CUB, пытаемся кликнуть...');
            tvClick(cubTab);
        }
    }
    
    // Запуск
    setTimeout(check, DELAY.INITIAL);
    setInterval(check, DELAY.INTERVAL);
})();