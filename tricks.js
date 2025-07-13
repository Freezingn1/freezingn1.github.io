(function () {
    'use strict';
    Lampa.Platform.tv(); 
    
    function add() {
        // Создаем меню для настроек
        Lampa.SettingsApi.addComponent({
            component: 'Multi_Menu_Component',
            name: 'Tweaks &amp; Tricks',
            icon: '<svg viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M527.579429 186.660571a119.954286 119.954286 0 1 1-67.949715 0V47.542857a33.938286 33.938286 0 0 1 67.949715 0v139.190857z m281.380571 604.598858a119.954286 119.954286 0 1 1 67.949714 0v139.190857a33.938286 33.938286 0 1 1-67.949714 0v-139.190857z m-698.441143 0a119.954286 119.954286 0 1 1 67.949714 0v139.190857a33.938286 33.938286 0 0 1-67.949714 0v-139.190857zM144.457143 13.531429c18.797714 0 34.011429 15.213714 34.011428 33.938285v410.038857a33.938286 33.938286 0 0 1-67.949714 0V47.542857c0-18.724571 15.213714-33.938286 33.938286-33.938286z m0 722.139428a60.269714 60.269714 0 1 0 0-120.466286 60.269714 60.269714 0 0 0 0 120.466286z m698.514286-722.139428c18.724571 0 33.938286 15.213714 33.938285 33.938285v410.038857a33.938286 33.938286 0 1 1-67.949714 0V47.542857c0-18.724571 15.213714-33.938286 34.011429-33.938286z m0 722.139428a60.269714 60.269714 0 1 0 0-120.466286 60.269714 60.269714 0 0 0 0 120.466286z m-349.403429 228.717714a33.938286 33.938286 0 0 1-33.938286-33.938285V520.411429a33.938286 33.938286 0 0 1 67.949715 0v410.038857a33.938286 33.938286 0 0 1-34.011429 33.938285z m0-722.139428a60.269714 60.269714 0 1 0 0 120.539428 60.269714 60.269714 0 0 0 0-120.539428z" fill="#ffffff"></path></g></svg>'
        });

        // Имя параметра для удобства
        var paramName = 'Reloadbutton';
        
        // Добавляем настройку для кнопки перезагрузки
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: paramName,
                type: 'trigger',
                default: true // По умолчанию включено
            },
            field: {
                name: 'Кнопка перезагрузки',
                description: 'Иконка рядом с часами'
            },
            onChange: function(value) {
                if(value) {
                    $('#RELOAD').removeClass('hide');
                } else {
                    $('#RELOAD').addClass('hide');
                }
            }
        });

        // Получаем текущее значение настройки
        var currentValue = Lampa.Storage.get('settings', paramName, true);
        
        // Создаем и добавляем кнопку перезагрузки
        var my_reload = '<div id="RELOAD" class="head__action selector reload-screen' + (currentValue ? '' : ' hide') + '"><svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="0.4800000000000001"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path></g></svg></div>';
        $('#app > div.head > div > div.head__actions').append(my_reload);
        
        // Обработчик клика для кнопки
        $('#RELOAD').on('hover:enter hover:click hover:touch', function() {
            location.reload();
        });
    }

    // Запуск после готовности приложения
    if(window.appready) {
        add();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if(e.type == 'ready') add();
        });
    }
})();