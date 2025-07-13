(function () {
    'use strict';
    Lampa.Platform.tv();
    
    // Константы
    const SETTINGS_KEY = 'reload_button_enabled';
    const DEFAULT_VALUE = true;

    function add() {
        // Создаем меню для настроек
        Lampa.SettingsApi.addComponent({
            component: 'Multi_Menu_Component',
            name: 'Tweaks & Tricks',
            icon: '<svg viewBox="0 0 1024 1024"><path fill="#ffffff" d="M527.58 186.66a120 120 0 1 1-67.95 0V47.54a33.94 33.94 0 0 1 67.95 0v139.12z"/></svg>'
        });

        // Добавляем параметр настройки
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: SETTINGS_KEY,
                type: 'trigger',
                default: DEFAULT_VALUE
            },
            field: {
                name: 'Кнопка перезагрузки',
                description: 'Показать/скрыть иконку перезагрузки'
            },
            onChange: function(value) {
                Lampa.Storage.set('settings', SETTINGS_KEY, value);
                toggleReloadButton(value);
            }
        });

        // Создаем кнопку
        function createReloadButton() {
            const isEnabled = Lampa.Storage.get('settings', SETTINGS_KEY, DEFAULT_VALUE);
            const buttonHTML = `
                <div id="RELOAD" class="head__action selector reload-screen ${isEnabled ? '' : 'hide'}">
                    <svg viewBox="0 0 24 24" fill="#ffffff">
                        <path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z"/>
                    </svg>
                </div>
            `;
            
            $('div.head__actions').append(buttonHTML);
            
            $('#RELOAD').on('hover:enter hover:click hover:touch', function() {
                location.reload();
            });
        }

        // Управление видимостью кнопки
        function toggleReloadButton(show) {
            if (show) {
                $('#RELOAD').removeClass('hide');
            } else {
                $('#RELOAD').addClass('hide');
            }
        }

        // Инициализация кнопки
        createReloadButton();
    }

    // Запуск после готовности приложения
    if (window.appready) {
        add();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') add();
        });
    }
})();