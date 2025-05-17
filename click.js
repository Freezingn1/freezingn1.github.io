(function () {
    const TARGET_SOURCE_KEY = 'cub'; // ключ, не текст
    const INITIAL_DELAY = 3000;

    function switchSourceDirectly() {
        try {
            if (typeof Lampa !== 'undefined' && Lampa.Activity && Lampa.Activity.loader) {
                const loader = Lampa.Activity.loader();
                if (loader && typeof loader.source === 'function') {
                    loader.source(TARGET_SOURCE_KEY);
                    console.log(`✅ Источник переключён напрямую на "${TARGET_SOURCE_KEY}"`);
                } else {
                    console.warn('⚠️ Lampa.Activity.loader().source недоступен');
                }
            } else {
                console.warn('⚠️ Lampa или Activity недоступны');
            }
        } catch (err) {
            console.error('❌ Ошибка при попытке переключить источник:', err);
        }
    }

    setTimeout(switchSourceDirectly, INITIAL_DELAY);
})();
