(function () {
    const TARGET_TAB_NAME = "CUB";
    const DELAY = 3000;

    function forceActivateCubTab() {
        try {
            const allTabs = document.querySelectorAll('.search-source.selector');
            let found = false;

            allTabs.forEach(tab => {
                const titleEl = tab.querySelector('.search-source__tab');
                const tabText = titleEl?.textContent?.trim();

                // Снять активность со всех
                tab.classList.remove('active');

                // Активировать CUB
                if (tabText === TARGET_TAB_NAME) {
                    tab.classList.add('active');
                    found = true;
                    console.log(`✅ Вкладка "${TARGET_TAB_NAME}" активирована вручную (через classList)`);
                }
            });

            if (!found) {
                console.warn(`❌ Вкладка "${TARGET_TAB_NAME}" не найдена`);
            } else {
                // Попробуем ещё вызвать событие, если требуется
                if (typeof Lampa !== 'undefined' && Lampa.Events && typeof Lampa.Events.emit === 'function') {
                    Lampa.Events.emit('search_source_change', TARGET_TAB_NAME.toLowerCase());
                    console.log('📢 Событие search_source_change отправлено');
                }
            }
        } catch (err) {
            console.error('❌ Ошибка при ручной активации вкладки CUB:', err);
        }
    }

    setTimeout(forceActivateCubTab, DELAY);
})();
