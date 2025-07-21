document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, активен ли плагин Cardify
    if (document.querySelector('.cardify')) {
        let isFirstScroll = true;
        
        window.addEventListener('wheel', function(e) {
            if (isFirstScroll && e.deltaY > 0) {
                isFirstScroll = false;
                const targetElement = document.querySelector('.items-line__title');
                
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
        
        // Сброс при закрытии/открытии карточки
        document.addEventListener('cardify:close', function() {
            isFirstScroll = true;
        });
        
        document.addEventListener('cardify:open', function() {
            isFirstScroll = true;
        });
    }
});