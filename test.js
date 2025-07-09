(function () {
    'use strict';

    // Функция для переключения источника поиска на cub
    function switchToCub() {
        // Находим все кнопки источников поиска
        const sourceButtons = document.querySelectorAll('.search-source__selector .selector button');

        if (!sourceButtons.length) return;

        // Ищем кнопку cub
        const cubButton = Array.from(sourceButtons).find(btn => btn.textContent.trim().toLowerCase() === 'cub');

        if (!cubButton) return;

        // Если кнопка уже активна, ничего не делаем
        if (cubButton.classList.contains('active')) return;

        // Пробуем кликнуть по кнопке
        cubButton.click();

        // Проверим, сработал ли клик через небольшой таймаут
        setTimeout(() => {
            if (!cubButton.classList.contains('active')) {
                // Если не сработало, убираем active с других и добавляем на cub
                sourceButtons.forEach(btn => btn.classList.remove('active'));
                cubButton.classList.add('active');

                // Вызываем событие смены источника, если нужно
                const changeEvent = new CustomEvent('change', { bubbles: true });
                cubButton.dispatchEvent(changeEvent);
            }
        }, 300);
    }

    // Ожидаем появления нужных элементов DOM
    const observer = new MutationObserver(() => {
        const container = document.querySelector('.search-source__selector .selector');
        if (container) {
            switchToCub();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
