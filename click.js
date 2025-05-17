(function () {
    const TARGET_TAB_NAME = "CUB";
    const CLICK_DELAY = 1500;
    const INITIAL_DELAY = 3000;

    console.log(`📺 Автокликер Android TV запущен для "${TARGET_TAB_NAME}"`);

    function simulateEnterOnCub() {
        const tabs = document.querySelectorAll('.search-source.selector:not(.active)');
        for (const tab of tabs) {
            const label = tab.querySelector('.search-source__tab');
            if (label && label.textContent.trim().toUpperCase() === TARGET_TAB_NAME) {
                setTimeout(() => {
                    try {
                        tab.focus(); // Фокусируем как будто пультом
                        console.log(`🎯 Фокус на "${TARGET_TAB_NAME}"`);

                        const enterEvent = new KeyboardEvent('keydown', {
                            key: 'Enter',
                            code: 'Enter',
                            keyCode: 13,
                            which: 13,
                            bubbles: true
                        });

                        tab.dispatchEvent(enterEvent); // Имитация нажатия "ОК"
                        console.log(`✅ Enter отправлен на "${TARGET_TAB_NAME}"`);
                    } catch (e) {
                        console.warn('⚠️ Ошибка при попытке активировать CUB:', e);
                    }
                }, CLICK_DELAY);
                return;
            }
        }
        console.log('❌ Вкладка CUB не найдена среди неактивных источников');
    }

    // Периодический автофокус каждые 5 секунд
    setInterval(simulateEnterOnCub, 5000);

    // Начальная задержка
    setTimeout(simulateEnterOnCub, INITIAL_DELAY);
})();
