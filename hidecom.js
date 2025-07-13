(function () {
    'use strict';

    // Находим все элементы с классом 'items-line__title', содержащие текст "Комментарии"
    const commentSections = document.querySelectorAll('.items-line__title');
    commentSections.forEach(section => {
        if (section.textContent.trim() === 'Комментарии') {
            // Находим родительский элемент items-line и скрываем его
            const itemsLine = section.closest('.items-line');
            if (itemsLine) {
                itemsLine.style.display = 'none';
                
                // Альтернативный вариант, если нужно полностью удалить блок:
                // itemsLine.remove();
            }
        }
    });
})();