(function() {
    const TARGET_TAB_NAME = "CUB";
    const CLICK_DELAY = 1500;    // Увеличиваем задержки для TV
    const INITIAL_DELAY = 2500;  // Увеличиваем начальную задержку
    const MAX_ATTEMPTS = 10;     // Максимальное количество попыток
    let attempts = 0;
    
    console.log(`⌛ Автокликер "${TARGET_TAB_NAME}" запущен (TV версия)`);

    function clickCubIfInactive() {
        // Универсальный поиск по тексту, если не найдены элементы по классу
        const allTabs = document.querySelectorAll('[role="tab"], .search-source, .selector, [class*="tab"]');
        
        for (const tab of allTabs) {
            const title = tab.querySelector('.search-source__tab, [class*="title"], [class*="label"]') || tab;
            if (title && (title.textContent || title.innerText).trim().toUpperCase() === TARGET_TAB_NAME) {
                if (!tab.classList.contains('active') && !tab.getAttribute('aria-selected')) {
                    setTimeout(() => {
                        tab.click();
                        console.log(`✅ [${new Date().toLocaleTimeString()}] "${TARGET_TAB_NAME}" активирована`);
                    }, CLICK_DELAY);
                    return true;
                }
            }
        }
        
        attempts++;
        if (attempts < MAX_ATTEMPTS) {
            setTimeout(clickCubIfInactive, CLICK_DELAY);
        } else {
            console.log(`❌ Не удалось найти вкладку "${TARGET_TAB_NAME}" после ${MAX_ATTEMPTS} попыток`);
        }
        return false;
    }

    // Альтернатива MutationObserver для TV
    function startObserver() {
        try {
            const observer = new MutationObserver(clickCubIfInactive);
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'aria-selected']
            });
            return true;
        } catch (e) {
            console.log("MutationObserver не поддерживается, используется fallback");
            return false;
        }
    }

    // Пробуем разные методы
    if (!startObserver()) {
        // Если MutationObserver не работает, используем интервалы
        const intervalId = setInterval(() => {
            if (clickCubIfInactive() || attempts >= MAX_ATTEMPTS) {
                clearInterval(intervalId);
            }
        }, CLICK_DELAY);
    }

    // Первая проверка с увеличенной задержкой
    setTimeout(clickCubIfInactive, INITIAL_DELAY);
})();