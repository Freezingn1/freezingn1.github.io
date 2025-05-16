(function() {
    const TARGET_TAB_NAME = "CUB";
    const CLICK_DELAY = 1500; // Увеличенная задержка для TV
    const MAX_ATTEMPTS = 5;   // Максимум попыток
    let attempts = 0;

    function simulateTVClick(element) {
        // Создаем событие для TV-браузеров
        const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            // Особые параметры для TV
            clientX: element.getBoundingClientRect().left + 10,
            clientY: element.getBoundingClientRect().top + 10
        });
        
        // Дополнительно отправляем touch-событие
        const touchEvent = new TouchEvent('touchend', {
            bubbles: true,
            cancelable: true,
            touches: [new Touch({
                identifier: Date.now(),
                target: element,
                clientX: element.getBoundingClientRect().left + 10,
                clientY: element.getBoundingClientRect().top + 10
            })]
        });
        
        element.dispatchEvent(event);
        element.dispatchEvent(touchEvent);
    }

    function clickCubTab() {
        if (attempts >= MAX_ATTEMPTS) return;
        attempts++;
        
        const tabs = document.querySelectorAll('.search-source.selector:not(.active)');
        const cubTab = Array.from(tabs).find(tab => {
            const title = tab.querySelector('.search-source__tab');
            return title && title.textContent.trim() === TARGET_TAB_NAME;
        });

        if (cubTab) {
            setTimeout(() => {
                try {
                    // Пробуем три варианта клика
                    cubTab.click();                      // Стандартный клик
                    simulateTVClick(cubTab);            // Специальный для TV
                    cubTab.dispatchEvent(new Event('focus')); // Для навигации пультом
                    
                    console.log('✅ CUB активирована (TV-совместимый клик)');
                } catch (e) {
                    console.warn('Ошибка клика:', e);
                }
            }, CLICK_DELAY);
        } else {
            setTimeout(clickCubTab, 1000); // Повторная попытка через 1 сек
        }
    }

    // Запуск с учетом TV-особенностей
    if (/Android|webOS|TV|SmartTV/.test(navigator.userAgent)) {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(clickCubTab, 3000); // Большая задержка для TV
        });
    } else {
        setTimeout(clickCubTab, CLICK_DELAY);
    }
})();