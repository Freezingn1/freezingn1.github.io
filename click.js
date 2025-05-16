(function() {
    const PLUGIN_NAME = "AutoClickSearchSource";
    console.log(`[${PLUGIN_NAME}] Плагин запущен`);

    // Наблюдатель за изменениями DOM
    const observer = new MutationObserver(function() {
        clickSearchSource();
    });

    // Настройки наблюдателя
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true, // На случай, если меняется класс active
    });

    // Функция для клика по элементу
    function clickSearchSource() {
        const targetElement = document.querySelector('.search-source.selector.active');
        
        if (targetElement) {
            setTimeout(() => {
                targetElement.click();
                console.log(`[${PLUGIN_NAME}] Элемент "CUB" нажат!`);
            }, 300); // Задержка для стабильности
        }
    }

    // Первая проверка через 1 секунду
    setTimeout(clickSearchSource, 1000);
})();