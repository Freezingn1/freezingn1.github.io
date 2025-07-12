(function () {
    'use strict';
    
    // Находим все элементы с классом head__title
    const titleElements = document.querySelectorAll('.head__title');
    
    // Проходим по каждому элементу
    titleElements.forEach(element => {
        // Заменяем текст, удаляя " - SURS"
        element.textContent = element.textContent.replace(' - SURS', '');
    });
})();