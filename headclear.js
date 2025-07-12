(function () {
    'use strict';

    function removeSursText() {
        const titleElements = document.querySelectorAll('.head__title');
        
        titleElements.forEach(element => {
            // Удаляем " - SURS" и возможные вариации с разными пробелами
            element.textContent = element.textContent
                .replace(/\s*-\s*SURS/g, '')  // Регулярное выражение на случай разных пробелов
                .trim();  // Удаляем лишние пробелы в начале/конце
        });
    }

    // Запускаем при полной загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeSursText);
    } else {
        removeSursText(); // Если DOM уже загружен, выполняем сразу
    }
})();