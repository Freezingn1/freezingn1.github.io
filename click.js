(function () {
    const TARGET = "cub"; // ключ источника, не текст (возможно, 'cub', 'CUB' — нужно проверить в DOM)
    const DELAY = 3000;

    function switchToCub() {
        if (window.Search) {
            let sources = Lampa.Storage.get('search_source');
            if (sources && sources !== TARGET) {
                Lampa.Storage.set('search_source', TARGET);
                Lampa.Events.emit('search_source_change', TARGET);
                console.log('✅ Источник поиска переключён на CUB');
            }
        } else {
            console.log('⌛ Ожидание инициализации Search...');
        }
    }

    setTimeout(switchToCub, DELAY);
})();
