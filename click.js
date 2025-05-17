(function() {
    const TARGET_TAB_NAME = "CUB";
    const CLICK_DELAY = 1500;
    const INITIAL_DELAY = 3000;

    console.log(`📺 [AndroidTV] Автопереключение на "${TARGET_TAB_NAME}"`);

    function clickCubIfInactive() {
        const inactiveTabs = document.querySelectorAll('.search-source.selector:not(.active)');

        for (const tab of inactiveTabs) {
            const title = tab.querySelector('.search-source__tab');
            if (title && title.textContent.trim() === TARGET_TAB_NAME && tab.offsetParent !== null) {
                setTimeout(() => {
                    tab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                    console.log(`✅ [${new Date().toLocaleTimeString()}] "${TARGET_TAB_NAME}" активирована`);
                }, CLICK_DELAY);
                return;
            }
        }
    }

    // Периодическая проверка
    setInterval(clickCubIfInactive, 5000);

    // Наблюдатель
    const observer = new MutationObserver(clickCubIfInactive);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });

    // Первая проверка с задержкой
    setTimeout(clickCubIfInactive, INITIAL_DELAY);
})();
