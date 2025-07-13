(function () {
    'use strict';
    
    const commentSections = document.querySelectorAll('.items-line__title');
    commentSections.forEach(section => {
        if (section.textContent.trim() === 'Комментарии') {
            const itemsLine = section.closest('.items-line');
            if (itemsLine) {
                itemsLine.style.display = 'none';
                itemsLine.setAttribute('tabindex', '-1'); // Блокировка фокуса
            }
        }
    });
})();