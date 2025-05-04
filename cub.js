// ==UserScript==
// @name         Lampa Uncesored: Restore Cub
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Восстанавливает cub в Lampa Uncesored
// @author       YourName
// @match        *://*lampa-uncesored.com/*
// @match        *://*lampa.*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Ждём, пока загрузится DOM
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Cub Restorer] Searching for cub...');

        // 1. Проверяем, удалён ли cub (пример для строки)
        if (window.lampa && window.lampa.uncensored && !window.lampa.uncensored.cub) {
            console.log('[Cub Restorer] Cub missing. Restoring...');
            
            // 2. Восстанавливаем cub (пример для объекта)
            window.lampa.uncensored.cub = {
                version: '1.0',
                init: function() {
                    console.log('[Cub] Cub initialized!');
                    // Здесь может быть логика загрузки плеера или API
                }
            };

            // 3. Запускаем cub (если требуется)
            window.lampa.uncensored.cub.init();
        }

        // 4. Альтернатива: если cub удалён из DOM
        const cubElement = document.getElementById('cub');
        if (!cubElement) {
            console.log('[Cub Restorer] Cub DOM element missing. Recreating...');
            const newCub = document.createElement('div');
            newCub.id = 'cub';
            newCub.style.display = 'block';
            document.body.appendChild(newCub);
        }

        console.log('[Cub Restorer] Cub should be restored!');
    });
})();