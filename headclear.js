(function () {
    'use strict';

    // Функция для удаления " - SURS" из текста
    function cleanTitleText(element) {
        if (!element) return;
        element.textContent = element.textContent.replace(/\s*-\s*SURS/gi, '').trim();
    }

    // Обрабатываем все существующие элементы
    function processTitles() {
        document.querySelectorAll('.head__title').forEach(cleanTitleText);
    }

    // Наблюдатель за изменениями DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('head__title')) {
                        cleanTitleText(node);
                    }
                    if (node.nodeType === 1 && node.querySelectorAll) {
                        node.querySelectorAll('.head__title').forEach(cleanTitleText);
                    }
                });
            }
        });
    });

    // Начинаем наблюдение за изменениями в body
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Обработаем заголовки, которые уже есть на странице
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', processTitles);
    } else {
        processTitles();
    }
})();