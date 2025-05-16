(function() {
    const PLUGIN_NAME = "AutoClickPlayButton";
    console.log(`[${PLUGIN_NAME}] Плагин запущен`);

    // Наблюдаем за изменениями DOM, но с задержкой
    const observer = new MutationObserver(function() {
        checkButton();
    });

    // Настройки наблюдателя
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Проверяем кнопку с задержкой и флагом
    let isClicked = false;
    function checkButton() {
        const button = document.querySelector('.button--play:not(.clicked)');
        
        if (button && !isClicked) {
            // Добавляем небольшую задержку (если кнопка появляется с анимацией)
            setTimeout(() => {
                button.click();
                button.classList.add('clicked'); // Помечаем, чтобы не кликать повторно
                isClicked = true;
                console.log(`[${PLUGIN_NAME}] Кнопка "Play" успешно нажата!`);
            }, 300); // Задержка 300 мс (можно увеличить до 500-1000, если нужно)
        }
    }

    // Первая проверка при загрузке
    setTimeout(checkButton, 1000); // Проверяем через 1 сек после загрузки
})();