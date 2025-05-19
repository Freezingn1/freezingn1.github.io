(function() {
    'use strict';

    function checkAndLoad() {
        if (typeof Lampa === 'undefined') {
            console.error("Lampa не загружена!");
            return;
        }

        const storedId = Lampa.Storage.get("lampac_unic_id");
        if (storedId !== "tyusdt") {
            Lampa.Storage.set("lampac_unic_id", "tyusdt");
        }

        Lampa.Utils.putScriptAsync("https://freezingn1.github.io/Conline.js")
            .then(() => console.log("Скрипт загружен"))
            .catch((err) => console.error("Ошибка загрузки:", err));
    }

    const checkInterval = setInterval(() => {
        if (typeof Lampa !== 'undefined') {
            clearInterval(checkInterval);
            checkAndLoad();
        }
    }, 200);
})();