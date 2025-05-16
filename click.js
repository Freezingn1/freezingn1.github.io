(function() {
    // Название плагина (можно изменить)
    const PLUGIN_NAME = "AutoClickOnline";
    
    // Основная функция плагина
    function initPlugin() {
        console.log(`[${PLUGIN_NAME}] Плагин запущен`);

        // Ждём загрузки DOM
        if (document.readyState === "complete") {
            clickOnline();
        } else {
            window.addEventListener("load", clickOnline);
        }

        // Функция для клика по элементу
        function clickOnline() {
            const onlineElements = document.querySelectorAll('.view--online');
            
            if (onlineElements.length > 0) {
                console.log(`[${PLUGIN_NAME}] Найдено элементов: ${onlineElements.length}`);
                onlineElements[0].click(); // Клик по первому элементу
                console.log(`[${PLUGIN_NAME}] Клик выполнен!`);
            } else {
                console.warn(`[${PLUGIN_NAME}] Элементы .view--online не найдены!`);
            }
        }
    }

    // Запускаем плагин
    initPlugin();
})();