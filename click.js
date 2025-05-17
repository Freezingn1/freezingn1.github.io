(function () {
    const TARGET_TAB_NAME = "CUB";
    const CLICK_DELAY = 1500;
    const INITIAL_DELAY = 3000;

    function simulateEnterOnCub() {
        const tabs = document.querySelectorAll('.search-source.selector:not(.active)');
        for (const tab of tabs) {
            const label = tab.querySelector('.search-source__tab');
            if (label && label.textContent.trim().toUpperCase() === TARGET_TAB_NAME) {
                setTimeout(() => {
                    tab.focus(); // Эмуляция наведения с пульта
                    const event = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true,
                    });
                    tab.dispatchEvent(event);
                    console.log(`✅ Фокус + Enter отправлены на "${TARGET_TAB_NAME}"`);
                }, CLICK_DELAY);
                return;
            }
        }
    }

    // Старая логика + фокус
    setTimeout(simulateEnterOnCub, INITIAL_DELAY);
})();
