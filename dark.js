(function() {
    if (!window.plugin_api) {
        console.error("Плагины не поддерживаются в этой версии Lampa!");
        return;
    }

    window.plugin_api.add({
        name: "Dark SelectBox Background",
        version: "1.0",
        description: "Меняет фон selectbox__content и layer--height на #121212",
        author: "Your Name",
        
        // Запуск плагина
        run: function() {
            console.log("[DarkBG] Плагин запущен");
            
            const applyStyles = () => {
                document.querySelectorAll('.selectbox__content, .layer--height').forEach(el => {
                    el.style.backgroundColor = '#121212';
                });
            };

            applyStyles();
            setInterval(applyStyles, 1000); // Проверка каждую секунду
        },
        
        // Остановка
        destroy: function() {
            console.log("[DarkBG] Плагин остановлен");
        }
    });
})();