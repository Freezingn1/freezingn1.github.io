(function() {
    'use strict';

    // 1. Создаем или модифицируем lampa_settings
    if (!window.lampa_settings) window.lampa_settings = {};
    if (!window.lampa_settings.disable_features) {
        window.lampa_settings.disable_features = {};
    }

    // 2. Принудительно отключаем все возможные блокировки
    Object.assign(window.lampa_settings.disable_features, {
        dmca: true,           // Основной DMCA-флаг
        copyright: false,     // Доп. защита
        geo_block: false,     // Геоблокировка
        adult_block: false    // Блокировка 18+
    });

    // 3. Патчим системные проверки
    const originalCheck = Lampa.API?.checkRestrictions;
    if (originalCheck) {
        Lampa.API.checkRestrictions = function() {
            return { 
                blocked: false,
                reason: null
            };
        };
    }

    // 4. Мониторинг в реальном времени
    const observer = new MutationObserver(() => {
        // Удаляем DMCA-затемнения
        document.querySelectorAll('.blocked-overlay, [dmca-block]').forEach(el => {
            el.remove();
        });
        
        // Разблокируем скрытые карточки
        document.querySelectorAll('[style*="display: none" i]').forEach(el => {
            if (el.getAttribute('dmca-hidden')) {
                el.style.display = '';
                el.removeAttribute('dmca-hidden');
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
    });

    console.log('[DMCA Bypass] Все ограничения отключены');
})();