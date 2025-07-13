(function () {
    'use strict';
    
    const commentSections = document.querySelectorAll('.items-line__title');
    commentSections.forEach(section => {
        if (section.textContent.trim() === 'Комментарии') {
            const itemsLine = section.closest('.items-line');
            if (itemsLine) {
                itemsLine.remove(); // Полное удаление из DOM
            }
        }
    });
})();