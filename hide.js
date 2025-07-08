(function () {
    'use strict';

    // Функция для скрытия элементов
    function hideElements() {
        const elements = document.querySelectorAll(`
            .settings-folder.selector[data-component="player"],
            .settings-folder.selector[data-component="parental_control"],
            .settings-folder.selector[data-component="filmix"]
        `);
        
        if (elements.length) {
            elements.forEach(el => el.style.display = 'none');
            return true; // Элементы найдены и скрыты
        }
        return false; // Элементы не найдены
    }

    // Пытаемся скрыть сразу
    if (!hideElements()) {
        // Если не получилось, ждём появления элементов через MutationObserver
        const observer = new MutationObserver(() => {
            if (hideElements()) {
                observer.disconnect(); // Останавливаем, если элементы скрыты
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }
})();