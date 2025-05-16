(function() {
    const PLUGIN_NAME = "AutoClickPlayButton";
    console.log(`[${PLUGIN_NAME}] Плагин запущен`);

    // Наблюдатель за изменениями DOM
    const observer = new MutationObserver(function() {
        checkButton();
    });

    // Начинаем наблюдение
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Функция для проверки и клика
    function checkButton() {
        const button = document.querySelector('.button--play:not(.clicked)');
        
        if (button) {
            setTimeout(() => {
                button.click();
                console.log(`[${PLUGIN_NAME}] Кнопка "Play" нажата!`);
                
                // Сбрасываем метку через 1 секунду (чтобы можно было кликнуть снова)
                button.classList.add('clicked');
                setTimeout(() => {
                    button.classList.remove('clicked');
                }, 1000);
            }, 300); // Задержка для надёжности
        }
    }

    // Первая проверка через 1 сек после загрузки
    setTimeout(checkButton, 1000);
})();