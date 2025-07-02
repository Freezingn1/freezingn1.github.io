(function () {
    'use strict';

    // Инициализация Lampa для TV
    Lampa.Platform.tv();

    // Основная функция
    function initializeApp() {
        // Обработка успешного запроса
        Lampa.Listener.follow('request_secuses', function(data) {
            if (data.params.success) {
                var activity = Lampa.Activity.active();
                activity.name = 'tmdb';
                Lampa.Storage.set('name', 'tmdb', true);
                Lampa.Activity.update(activity);
                Lampa.Storage.set('source', 'cub', true);
            }
        });

        // Проверка настроек (без DMCA-защиты)
        var interval = setInterval(function() {
            if (typeof window.lampa_settings !== 'undefined') {
                clearInterval(interval);
            }
        }, 100);
    }

    // Запуск приложения
    if (window.appready) {
        initializeApp();
    } else {
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'ready') {
                initializeApp();
            }
        });
    }
})();