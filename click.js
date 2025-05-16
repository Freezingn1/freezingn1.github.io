(function() {
    const PLUGIN_NAME = "AutoClickPlayButton";
    console.log(`[${PLUGIN_NAME}] Плагин запущен`);

    // Наблюдатель за изменениями DOM (MutationObserver)
    const observer = new MutationObserver(function(mutations) {
        checkButton();
    });

    // Настройки наблюдателя: следим за добавлением элементов
    const observerConfig = {
        childList: true,
        subtree: true
    };

    // Функция проверки кнопки
    function checkButton() {
        const button = document.querySelector('.button--play');
        if (button) {
            button.click();
            console.log(`[${PLUGIN_NAME}] Кнопка "Play" нажата!`);
        }
    }

    // Запуск при полной загрузке страницы
    if (document.readyState === "complete") {
        observer.observe(document.body, observerConfig);
        checkButton(); // Первая проверка
    } else {
        window.addEventListener("load", function() {
            observer.observe(document.body, observerConfig);
            checkButton(); // Первая проверка
        });
    }
})();