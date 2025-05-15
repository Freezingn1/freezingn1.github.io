(function() {
    'use strict';

    // Устанавливает платформу как TV (вероятно, для Smart TV)
    Lampa.Platform.tv();

    // Проверяет и загружает внешний скрипт, если выполняется в Lampa
    (function() {
        'use strict';

        // Anti-debugging: перехватывает console.log и другие методы
        var debugProtection = (function() {
            var isActive = true;
            return function(callback, handler) {
                return isActive ? function() {
                    if (handler) {
                        var result = handler.apply(callback, arguments);
                        handler = null;
                        return result;
                    }
                } : function() {};
            };
        })();

        // Защита от анализа через console
        var consoleProtection = (function() {
            var isActive = true;
            return function(callback, handler) {
                return isActive ? function() {
                    var globalObj = (function() {
                        try {
                            return Function('return this')();
                        } catch (e) {
                            return window;
                        }
                    })();

                    var console = globalObj.console = globalObj.console || {};
                    var methods = ['log', 'debug', 'info', 'error', 'exception', 'table', 'trace'];

                    for (var i = 0; i < methods.length; i++) {
                        var originalMethod = console[methods[i]] || Function.prototype.bind.call(Function);
                        var modifiedMethod = debugProtection.constructor.prototype.bind.call(debugProtection);
                        modifiedMethod.toString = originalMethod.toString.bind(originalMethod);
                        console[methods[i]] = modifiedMethod;
                    }
                } : function() {};
            };
        })();

        consoleProtection();

        // Основная логика: проверяет Lampa и загружает скрипт
        var checkLampaInterval = setInterval(function() {
            if (typeof Lampa !== 'undefined') {
                clearInterval(checkLampaInterval);

                // Если версия Lampa не 'bylampa', показывает ошибку доступа
                if (Lampa.Manifest.get('origin') !== 'bylampa') {
                    Lampa.Noty.show('Ошибка доступа');
                    return;
                } 
                // Иначе проверяет/устанавливает ID и загружает внешний скрипт
                else {
                    var storedId = Lampa.Storage.get('lampac_unic_id', '');
                    if (storedId !== 'tyusdt') {
                        Lampa.Storage.set('lampac_unic_id', 'tyusdt');
                    }
                    Lampa.Utils.putScriptAsync(['https://freezingn1.github.io/Conline.js'], function() {});
                }
            }
        }, 200); // Проверяет каждые 200 мс
    })();
})();