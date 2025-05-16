(function() {
    const PLUGIN_NAME = "AutoClickPlayButton";
    console.log(`[${PLUGIN_NAME}] Плагин запущен`);

    // Ждём загрузки страницы и появления кнопки
    function waitAndClick() {
        const button = document.querySelector('.button--play');
        
        if (button) {
            button.click();
            console.log(`[${PLUGIN_NAME}] Кнопка "Play" найдена, клик выполнен!`);
        } else {
            setTimeout(waitAndClick, 500); // Проверяем каждые 500 мс
        }
    }

    // Запускаем после полной загрузки DOM
    if (document.readyState === "complete") {
        waitAndClick();
    } else {
        window.addEventListener("load", waitAndClick);
    }
})();