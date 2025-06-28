(function() {
    function applyPatch() {
        // Проверяем, существует ли объект lampa_settings
        if (typeof window.lampa_settings === "undefined") {
            window.lampa_settings = {};
        }
        
        // Если appReplace нет — создаём
        if (typeof window.lampa_settings.appReplace === "undefined") {
            window.lampa_settings.appReplace = {};
        }

        // Добавляем замену
        window.lampa_settings.appReplace["\\? 7 : 6 : 12"] = "? 7 : 12 : 12";
        
        console.log("[Lampa Patch] appReplace applied:", window.lampa_settings.appReplace);
    }

    // Пробуем применить сразу
    applyPatch();

    // Если Lampa загружается позже, проверяем каждые 500 мс (макс. 10 попыток)
    let attempts = 0;
    const interval = setInterval(() => {
        if (window.lampa_settings?.appReplace !== undefined || attempts >= 10) {
            clearInterval(interval);
            if (attempts < 10) applyPatch();
            else console.warn("[Lampa Patch] Не удалось найти lampa_settings.appReplace");
        }
        attempts++;
    }, 500);
})();