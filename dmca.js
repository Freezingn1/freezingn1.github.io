(function() {
    'use strict';

    // 1. Инициализация TV-режима (если нужно)
    Lampa.Platform.tv();

    // 2. Отключаем DMCA-блокировку
    function disableDCMA() {
        if (window.lampa_settings) {
            // Если есть настройки, принудительно отключаем DMCA
            window.lampa_settings.dcma = false;
            window.lampa_settings.fixdcma = true;
        } else {
            // Если настроек нет, создаем их
            window.lampa_settings = {
                dcma: false,
                fixdcma: true
            };
        }
    }

    // 3. Основная логика (запуск после готовности приложения)
    function initLampa() {
        disableDCMA(); // Применяем настройки DMCA

        // Дополнительные действия (если нужны)
        Lampa.Listener.follow('request_success', function(data) {
            if (data.params.success) {
                console.log("DMCA обойден, плеер работает!");
            }
        });
    }

    // Запуск
    if (window.appready) {
        initLampa();
    } else {
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'ready') initLampa();
        });
    }
})();