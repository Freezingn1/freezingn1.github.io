(function() {
    const TARGET_TAB_NAME = "CUB";
    const CLICK_DELAY = 3000;    // Increased delay for TV navigation (was 1500)
    const INITIAL_DELAY = 5000;  // Longer initial delay for TV (was 3000)
    const FOCUS_CLASS = 'focused'; // Android TV focused element class
    
    console.log(`⌛ TV Autoclicker for "${TARGET_TAB_NAME}" started (delays: ${CLICK_DELAY}ms + ${INITIAL_DELAY}ms)`);

    function clickCubIfInactive() {
        // Try to find focused element first (TV navigation)
        const focusedTab = document.querySelector(`.${FOCUS_CLASS} .search-source__tab`);
        if (focusedTab && focusedTab.textContent.trim() === TARGET_TAB_NAME) {
            setTimeout(() => {
                focusedTab.closest('.search-source.selector').click();
                console.log(`✅ [${new Date().toLocaleTimeString()}] "${TARGET_TAB_NAME}" activated (focused)`);
            }, CLICK_DELAY);
            return;
        }

        // Fallback to original inactive tabs check
        const inactiveTabs = document.querySelectorAll('.search-source.selector:not(.active)');
        
        for (const tab of inactiveTabs) {
            const title = tab.querySelector('.search-source__tab');
            if (title && title.textContent.trim() === TARGET_TAB_NAME) {
                setTimeout(() => {
                    // Focus the element first for better TV compatibility
                    tab.focus();
                    tab.click();
                    console.log(`✅ [${new Date().toLocaleTimeString()}] "${TARGET_TAB_NAME}" activated`);
                }, CLICK_DELAY);
                return;
            }
        }
    }

    // Observer with class filter
    const observer = new MutationObserver(clickCubIfInactive);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });

    // Initial check with longer delay
    setTimeout(clickCubIfInactive, INITIAL_DELAY);
})();