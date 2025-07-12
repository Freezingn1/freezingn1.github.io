(function () {
    'use strict';

    // Функция для удаления " - SURS" из текста
    function cleanTitleText(element) {
        if (!element) return;
        element.textContent = element.textContent
            .replace(/\s*[—–−-]\s*SURS/gi, '')  // Удаляет "- SURS", "—SURS", " - SURS" и т. д.
            .trim();  // Обрезает лишние пробелы
    }

    // Обрабатываем все существующие элементы
    function processExistingTitles() {
        const titles = document.querySelectorAll('.head__title');
        titles.forEach(cleanTitleText);
        return titles.length > 0; // Возвращает true, если элементы найдены
    }

    // Если DOM ещё не загружен, ждём его загрузки
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!processExistingTitles()) {
                startObserver(); // Если элементов нет, запускаем наблюдение
            }
        });
    } else {
        if (!processExistingTitles()) {
            startObserver(); // Если элементы не найдены, включаем Observer
        }
    }

    // Наблюдатель для динамически добавленных элементов
    function startObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.matches('.head__title')) {
                        cleanTitleText(node);
                    }
                    if (node.nodeType === 1 && node.querySelector('.head__title')) {
                        node.querySelectorAll('.head__title').forEach(cleanTitleText);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();