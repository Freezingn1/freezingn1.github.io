(function() {
    'use strict';

    // Проверка доступа и загрузка скрипта
    function checkAndLoad() {
        if (typeof Lampa === 'undefined') return;


        // Проверка и сохранение ID
        const storedId = Lampa.Storage.get("lampac_unic_id");
        if (storedId !== "tyusdt") {
            Lampa.Storage.set("lampac_unic_id", "tyusdt");
        }

        // Загрузка внешнего скрипта
        Lampa.Utils.putScriptAsync("https://freezingn1.github.io/Conline.js", function() {
            console.log("Скрипт загружен");
        });
    }

    // Запуск проверки с интервалом (на случай, если Lampa ещё не загружена)
    const checkInterval = setInterval(function() {
        if (typeof Lampa !== 'undefined') {
            clearInterval(checkInterval);
            checkAndLoad();
        }
    }, 200);
})();