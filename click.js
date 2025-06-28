(function() {
    console.log("⌛ Автокликер CUB запущен");

    // Основная функция для активации вкладки CUB
    function activateCubTab() {
        // 1. Находим все вкладки
        const tabs = document.querySelectorAll('.search-source.selector');
        if (!tabs || tabs.length === 0) {
            console.log("❌ Вкладки не найдены");
            return false;
        }

        // 2. Ищем вкладку CUB (без класса 'active')
        let cubTab = null;
        for (const tab of tabs) {
            const titleElement = tab.querySelector('.search-source__tab');
            if (titleElement && titleElement.textContent.trim() === "CUB") {
                if (!tab.classList.contains('active')) {
                    cubTab = tab;
                    break;
                } else {
                    console.log("ℹ️ Вкладка CUB уже активна");
                    return true;
                }
            }
        }

        if (!cubTab) {
            console.log("❌ Неактивная вкладка CUB не найдена");
            return false;
        }

        // 3. Кликаем по вкладке
        try {
            console.log("🟡 Пытаемся активировать CUB...");
            cubTab.click();
            console.log("✅ Вкладка CUB успешно активирована");
            return true;
        } catch (e) {
            console.log("❌ Ошибка при клике:", e);
            return false;
        }
    }

    // Пытаемся активировать несколько раз с задержками
    function tryActivateWithRetry() {
        if (activateCubTab()) return;

        // Если не получилось, пробуем ещё раз через 1 и 3 секунды
        setTimeout(() => {
            if (!activateCubTab()) {
                setTimeout(activateCubTab, 3000);
            }
        }, 1000);
    }

    // Запускаем после загрузки страницы
    if (document.readyState === 'complete') {
        setTimeout(tryActivateWithRetry, 500);
    } else {
        window.addEventListener('load', () => {
            setTimeout(tryActivateWithRetry, 1000);
        });
    }

    // Следим за изменениями в DOM (на случай динамической загрузки)
    const observer = new MutationObserver(() => {
        activateCubTab();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();