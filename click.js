(function() {
    console.log("⌛ TV Autoclicker for CUB started");

    // 1. Функция для эмуляции нажатия центральной кнопки пульта
    function simulateTVClick(element) {
        if (!element) return false;
        
        try {
            // Сначала фокусируем элемент (как при навигации пультом)
            element.focus();
            
            // Создаём событие для KEYCODE_DPAD_CENTER
            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                keyCode: 23, // KEYCODE_DPAD_CENTER
                code: 'Enter',
                which: 23,
                bubbles: true,
                cancelable: true
            });
            
            element.dispatchEvent(enterEvent);
            console.log("✅ TV click (DPAD_CENTER) simulated on:", element);
            return true;
        } catch (e) {
            console.log("❌ TV click error:", e);
            return false;
        }
    }

    // 2. Поиск и активация вкладки CUB
    function activateCubTab() {
        const tabs = document.querySelectorAll('.search-source.selector');
        if (!tabs.length) {
            console.log("No tabs found");
            return false;
        }

        for (const tab of tabs) {
            const title = tab.querySelector('.search-source__tab');
            if (title && title.textContent.trim() === "CUB") {
                if (tab.classList.contains('active')) {
                    console.log("CUB is already active");
                    return true;
                }
                
                // Используем TV-совместимый клик
                return simulateTVClick(tab);
            }
        }
        
        console.log("CUB tab not found");
        return false;
    }

    // 3. Стратегия запуска
    function startWithRetries() {
        let attempts = 0;
        const maxAttempts = 5;
        const interval = 2000; // 2 сек между попытками

        const tryActivate = () => {
            attempts++;
            if (activateCubTab() || attempts >= maxAttempts) {
                clearInterval(retryInterval);
            }
        };

        // Первая попытка
        setTimeout(tryActivate, 1000);
        
        // Последующие попытки
        const retryInterval = setInterval(tryActivate, interval);
    }

    // Запуск
    if (document.readyState === 'complete') {
        startWithRetries();
    } else {
        window.addEventListener('load', startWithRetries);
    }

    // Наблюдатель для динамического контента
    new MutationObserver(activateCubTab).observe(document.body, {
        childList: true,
        subtree: true
    });
})();