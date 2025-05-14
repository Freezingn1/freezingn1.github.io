(function() {
    'use strict';

    try {
        // 1. Активация TV-режима Lampa
        Lampa.Platform.tv();
    } catch (e) {
        console.error('Ошибка при инициализации TV-режима:', e);
        return; // Прекращаем выполнение, если Lampa не доступна
    }

    // 2. Проверка загрузки Lampa
    var initCheck = setInterval(function() {
        if (typeof Lampa === 'undefined') return;

        clearInterval(initCheck);

        try {
            // 3. Проверка и установка lampac_unic_id
            var currentId = Lampa.Storage.get('lampac_unic_id', ''); // Добавлено значение по умолчанию
            if (currentId !== 'tyusdt') {
                Lampa.Storage.set('lampac_unic_id', 'tyusdt');
            }

            // 4. Загрузка внешнего скрипта
            Lampa.Utils.putScriptAsync('https://freezingn1.github.io/Conline.js')
                .then(function() {
                    console.log('Скрипт Conline.js успешно загружен');
                })
                .catch(function(err) {
                    console.error('Ошибка загрузки скрипта:', err);
                    if (Lampa.Noty && typeof Lampa.Noty.show === 'function') {
                        Lampa.Noty.show('Ошибка загрузки плагина');
                    }
                });
        } catch (e) {
            console.error('Ошибка в основном блоке инициализации:', e);
        }
    }, 200);
})();
