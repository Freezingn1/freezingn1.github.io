(function() {
    // Проверка, что Lampa загружена
    if (typeof Lampa === 'undefined') {
        console.warn('Lampa не обнаружена');
        return;
    }

    // Безопасная функция скрытия жанров
    function safeHideGenres() {
        try {
            const detailsBlocks = document.querySelectorAll('.full-start-new__details');
            
            detailsBlocks.forEach(block => {
                // Создаем копию всех элементов
                const elements = Array.from(block.children);
                
                // Фильтруем только нужные элементы (оставляем длительность)
                const filtered = elements.filter(el => {
                    // Удаляем элементы с разделителем
                    if (el.classList.contains('full-start-new__split')) return false;
                    
                    // Удаляем элементы с перечислением жанров
                    if (el.textContent.match(/\b[А-Яа-я]+\s?\|\s?[А-Яа-я]+\b/)) return false;
                    
                    return true;
                });
                
                // Если остались элементы - обновляем блок
                if (filtered.length > 0) {
                    block.innerHTML = filtered.map(el => el.outerHTML).join('');
                }
            });
        } catch (e) {
            console.error('Ошибка в hide-genres:', e);
        }
    }

    // Запускаем с задержкой и при изменениях
    const safeObserver = new MutationObserver((mutations) => {
        safeHideGenres();
    });

    // Начинаем наблюдение
    safeObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false
    });

    // Первый запуск с задержкой
    setTimeout(safeHideGenres, 1500);
    
    // Интеграция с Lampa, если доступна
    if (Lampa.Listener) {
        Lampa.Listener.follow('full', () => {
            setTimeout(safeHideGenres, 500);
        });
    }

    console.log('Плагин hide-genres-safe успешно загружен');
})();