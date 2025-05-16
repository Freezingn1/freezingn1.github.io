(function() {
    const TARGET_TAB_NAME = "CUB"; // Ищем эту вкладку
    const CHECK_DELAY = 300; // Задержка перед кликом (мс)
    console.log(`Автокликер для вкладки "${TARGET_TAB_NAME}" запущен`);

    // Функция для поиска и клика
    function clickCubIfInactive() {
        // Ищем все потенциальные вкладки
        const allTabs = document.querySelectorAll('.search-source.selector:not(.active)');
        
        // Фильтруем по названию
        const cubTab = Array.from(allTabs).find(tab => {
            const titleElement = tab.querySelector('.search-source__tab');
            return titleElement && titleElement.textContent.trim() === TARGET_TAB_NAME;
        });

        // Если нашли неактивную вкладку CUB - кликаем
        if (cubTab) {
            setTimeout(() => {
                cubTab.click();
                console.log(`✅ Вкладка "${TARGET_TAB_NAME}" активирована`);
            }, CHECK_DELAY);
        }
    }

    // Наблюдатель за изменениями DOM
    const observer = new MutationObserver(clickCubIfInactive);

    // Настройки наблюдателя
    observer.observe(document.body, {
        childList: true,    // Отслеживаем новые элементы
        subtree: true,      // Проверяем все уровни вложенности
        attributes: true,   // Следим за изменением атрибутов
        attributeFilter: ['class'] // Только для изменений классов
    });

    // Первичная проверка после загрузки
    setTimeout(clickCubIfInactive, 1000);
})();