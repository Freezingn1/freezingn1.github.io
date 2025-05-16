(function() {
    const TARGET_NAME = "CUB"; // Ищем именно эту вкладку
    console.log(`Поиск кнопки "${TARGET_NAME}"...`);

    // Основная функция поиска и клика
    function clickCubTab() {
        // Находим все элементы с нужным классом
        const tabs = document.querySelectorAll('.search-source.selector');
        
        // Ищем нужную вкладку по названию
        const cubTab = Array.from(tabs).find(tab => {
            const tabName = tab.querySelector('.search-source__tab');
            return tabName && tabName.textContent.trim() === TARGET_NAME;
        });

        // Если нашли и она не активна - кликаем
        if (cubTab && !cubTab.classList.contains('active')) {
            cubTab.click();
            console.log(`✅ Вкладка "${TARGET_NAME}" успешно нажата!`);
        }
    }

    // Наблюдатель за изменениями DOM
    const observer = new MutationObserver(function() {
        clickCubTab();
    });

    // Начинаем наблюдение
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true, // На случай изменения класса active
        attributeFilter: ['class']
    });

    // Первая проверка с задержкой
    setTimeout(clickCubTab, 1000);
})();