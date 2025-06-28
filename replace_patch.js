(function() {
    if (window.lampa_settings && window.lampa_settings.appReplace === undefined) {
        window.lampa_settings.appReplace = {};
    }

    // Добавляем или изменяем правило замены
    window.lampa_settings.appReplace["7 : 6 : 12"] = "? 20 : 20 : 20";

    console.log("Lampa appReplace patch applied:", window.lampa_settings.appReplace);
})();