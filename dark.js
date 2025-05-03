// Lampa Uncensored плагин для изменения фона selectbox и layer
lampa_plugin({
    name: "Dark SelectBox Background",
    version: "1.0",
    description: "Изменяет фон selectbox__content и layer--height на #121212",
    
    // Функция запуска плагина
    start: function() {
        // Функция для применения стилей
        function applyStyles() {
            // Находим все элементы с нужными классами
            const selectBoxes = document.querySelectorAll('.selectbox__content');
            const layers = document.querySelectorAll('.layer--height');
            
            // Применяем стили к selectbox__content
            selectBoxes.forEach(element => {
                element.style.backgroundColor = '#121212';
            });
            
            // Применяем стили к layer--height
            layers.forEach(element => {
                element.style.backgroundColor = '#121212';
            });
        }
        
        // Применяем стили сразу при загрузке
        applyStyles();
        
        // Также применяем стили при динамическом изменении DOM (на всякий случай)
        const observer = new MutationObserver(applyStyles);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Сохраняем observer для последующей очистки
        this.observer = observer;
    },
    
    // Функция остановки плагина (для восстановления оригинальных стилей)
    stop: function() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // Восстанавливаем стандартные стили
        document.querySelectorAll('.selectbox__content, .layer--height').forEach(element => {
            element.style.backgroundColor = '';
        });
    }
});