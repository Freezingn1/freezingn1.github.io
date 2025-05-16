(function() {
    const TARGET_TAB_NAME = "CUB";
    const CLICK_DELAY = 1500;
    const INITIAL_DELAY = 3000;
    const MAX_ATTEMPTS = 10;
    let attempts = 0;
    
    console.log(`⌛ Автокликер "${TARGET_TAB_NAME}" (TV-версия) запущен`);

    function clickCubIfInactive() {
        // Увеличиваем количество попыток
        attempts++;
        if (attempts > MAX_ATTEMPTS) {
            console.log("❌ Достигнуто максимальное количество попыток");
            observer.disconnect();
            return;
        }

        // Ищем все неактивные табы
        const inactiveTabs = document.querySelectorAll('.search-source.selector:not(.active), [class*="tab"]:not([class*="active"])');
        
        for (const tab of inactiveTabs) {
            // Более гибкое определение названия таба
            const title = tab.querySelector('.search-source__tab, [class*="title"], [class*="label"]');
            if (title && title.textContent.trim().toUpperCase().includes(TARGET_TAB_NAME)) {
                setTimeout(() => {
                    try {
                        // Пытаемся использовать разные методы активации
                        if (typeof tab.click === 'function') {
                            tab.click();
                        } else if (typeof tab.focus === 'function') {
                            tab.focus();
                            // Эмуляция нажатия Enter для TV
                            const enterEvent = new KeyboardEvent('keydown', {
                                key: 'Enter',
                                code: 'Enter',
                                keyCode: 13,
                                which: 13,
                                bubbles: true
                            });
                            tab.dispatchEvent(enterEvent);
                        }
                        console.log(`✅ [${new Date().toLocaleTimeString()}] "${TARGET_TAB_NAME}" активирована`);
                    } catch (e) {
                        console.log(`❌ Ошибка активации: ${e.message}`);
                    }
                }, CLICK_DELAY);
                return;
            }
        }
        
        // Если не нашли, пробуем еще раз через 1 секунду
        if (attempts < MAX_ATTEMPTS) {
            setTimeout(clickCubIfInactive, 1000);
        }
    }

    const observer = new MutationObserver(() => {
        clearTimeout(observer.timeout);
        observer.timeout = setTimeout(clickCubIfInactive, 200);
    });
    
    observer.timeout = null;

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
    });

    // Первая проверка
    setTimeout(clickCubIfInactive, INITIAL_DELAY);
})();