(function() {
    const TARGET_TAB_NAME = "CUB";
    const CLICK_DELAY = 1500;    // Задержка перед кликом 
    const INITIAL_DELAY = 3000; // Первая проверка через 1.5 сек после загрузки 
    
    console.log(`⌛ Автокликер "${TARGET_TAB_NAME}" запущен (задержки: ${CLICK_DELAY}мс + ${INITIAL_DELAY}мс)`);

    function clickCubIfInactive() {
        const inactiveTabs = document.querySelectorAll('.search-source.selector:not(.active)');
        
        for (const tab of inactiveTabs) {
            const title = tab.querySelector('.search-source__tab');
            if (title && title.textContent.trim() === TARGET_TAB_NAME) {
                setTimeout(() => {
                    tab.click();
                    console.log(`✅ [${new Date().toLocaleTimeString()}] "${TARGET_TAB_NAME}" активирована`);
                }, CLICK_DELAY);
                return; // Прекращаем после первого найденного совпадения
            }
        }
    }

    // Наблюдатель с фильтром по классам
    const observer = new MutationObserver(clickCubIfInactive);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });

    // Первая проверка с увеличенной задержкой
    setTimeout(clickCubIfInactive, INITIAL_DELAY);
})();