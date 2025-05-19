(function() {
    'use strict';

    function checkAndLoad() {
        // Проверяем, что Lampa загружена
        if (typeof Lampa === 'undefined') {
            console.error('Lampa не загружена!');
            return;
        }

        // Проверяем, что Lampa.Storage существует
        if (!Lampa.Storage) {
            console.error('Lampa.Storage не доступен!');
            return;
        }

        // Получаем или устанавливаем ID
        const storedId = Lampa.Storage.get("lampac_unic_id");
        if (storedId !== "tyusdt") {
            Lampa.Storage.set("lampac_unic_id", "tyusdt");
        }

        // Проверяем, что Lampa.Utils.putScriptAsync существует
        if (!Lampa.Utils || !Lampa.Utils.putScriptAsync) {
            console.error('Lampa.Utils.putScriptAsync не доступен!');
            return;
        }

        // Загружаем скрипт (без .then, если метод не поддерживает Promise)
        try {
            Lampa.Utils.putScriptAsync("https://freezingn1.github.io/conline.js", function() {
                console.log("Скрипт загружен");
            });
        } catch (err) {
            console.error("Ошибка загрузки скрипта:", err);
        }
    }

    // Проверяем загрузку Lampa с интервалом
    const checkInterval = setInterval(function() {
        if (typeof Lampa !== 'undefined') {
            clearInterval(checkInterval);
            checkAndLoad();
        }
    }, 200);
})();
