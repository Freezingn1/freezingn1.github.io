(function() {
    'use strict';

    // Инициализация Lampa для TV
    Lampa.Platform.tv();

    // Проверка доступа и загрузка внешнего скрипта
    var checkInterval = setInterval(function() {
        if (typeof Lampa !== 'undefined') {
            clearInterval(checkInterval);

            // Проверка уникального ID
            var storedId = Lampa.Storage.get('lampac_unic_id', '');
            if (storedId !== 'tyusdt') {
                Lampa.Storage.set('lampac_unic_id', 'tyusdt');
            }

            // Загрузка внешнего скрипта
            Lampa.Utils.putScriptAsync('https://freezingn1.github.io/Conline.js', function() {
                console.log('Скрипт Conline.js загружен');
            });
        }
    }, 200);
})();