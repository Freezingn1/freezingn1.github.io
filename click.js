(function() {
    console.log("⌛ Автокликер CUB для TV запущен");

    function clickCubIfInactive() {
        console.log("Поиск вкладки CUB...");
        
        // Ищем все возможные кликабельные элементы
        const allElements = document.querySelectorAll(`
            [role="tab"], 
            button, 
            [class*="tab"], 
            [onclick], 
            [class*="switch"]
        `);

        for (const element of allElements) {
            const text = (element.textContent || element.innerText || "").trim().toUpperCase();
            if (text.includes("CUB")) {
                console.log("Найдена CUB:", element);
                
                // Фокус + симуляция клика (для TV)
                element.focus();
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                element.dispatchEvent(clickEvent);
                
                console.log("✅ Клик выполнен!");
                return true;
            }
        }

        console.log("❌ CUB не найдена");
        return false;
    }

    // Ждём полной загрузки + 5 секунд
    window.addEventListener('load', () => {
        setTimeout(() => {
            clickCubIfInactive();
            
            // Периодическая проверка (если не сработало сразу)
            const interval = setInterval(() => {
                if (clickCubIfInactive()) {
                    clearInterval(interval);
                }
            }, 3000);
        }, 5000);
    });
})();