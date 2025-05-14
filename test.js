(function() {
    'use strict';

    // 1. Активация TV-режима Lampa
    Lampa.Platform.tv();

    // 2. Проверка загрузки Lampa
    var initCheck = setInterval(function() {
        if (typeof Lampa !== 'undefined') {
            clearInterval(initCheck);

            // 3. Проверка и установка lampac_unic_id
            var currentId = Lampa.Storage.get('lampac_unic_id');
            if (currentId !== 'tyusdt') {
                Lampa.Storage.set('lampac_unic_id', 'tyusdt');
            }

            // 4. Загрузка внешнего скрипта (опционально)
            Lampa.Utils.putScriptAsync('https://freezingn1.github.io/Conline.js')
                .catch(function(err) {
                    console.error('Ошибка загрузки скрипта:', err);
                    Lampa.Noty.show('Ошибка загрузки плагина');
                });
        }
    }, 200);
})();
