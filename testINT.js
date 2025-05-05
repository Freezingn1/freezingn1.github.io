(function () {
    'use strict';

    // ... (весь предыдущий код остается без изменений до функции startPlugin)

    function startPlugin() {
        window.plugin_interface_ready = true;
        var old_interface = Lampa.InteractionMain;
        var new_interface = component;

        Lampa.InteractionMain = function (object) {
            var use = new_interface;

            if (window.innerWidth < 767) use = old_interface;
            if (Lampa.Manifest.app_digital < 153) use = old_interface;
            if (object.title === 'Избранное') {
                use = old_interface;
            }

            return new use(object);
        };

        // Добавляем новый подпункт "Стильный интерфейс" с группировкой всех настроек
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'stylish_interface',
                type: 'group',
                group: 'Стильный интерфейс'
            },
            field: {
                position: 3 // После "Размер интерфейса" (position: 2)
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'new_interface_logo',
                type: 'trigger',
                default: true,
                group: 'Стильный интерфейс'
            },
            field: {
                name: 'Логотипы вместо названий',
                description: 'Отображать логотипы (русские → английские → любые)'
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'new_interface_show_description',
                type: 'trigger',
                default: true,
                group: 'Стильный интерфейс'
            },
            field: {
                name: 'Показывать описание',
                description: 'Отображать описание фильмов/сериалов'
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'new_interface_show_genres',
                type: 'trigger',
                default: true,
                group: 'Стильный интерфейс'
            },
            field: {
                name: 'Показывать жанры',
                description: 'Отображать жанры фильмов/сериалов'
            }
        });

        Lampa.Template.add('new_interface_style', `
            <style>
            .new-interface .card--small.card--wide {
                width: 18.3em;
            }
            
            .new-interface-info {
                position: relative;
                padding: 1.5em;
                height: 26em;
            }
            
            .new-interface-info__body {
                width: 80%;
                padding-top: 1.1em;
            }
            
            .new-interface-info__head {
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 0em;
                font-size: 1.3em;
                min-height: 1em;
            }
            
            .new-interface-info__head span {
                color: #fff;
            }
            
            .new-interface-info__title {
                font-size: 4em;
                margin-top: 0.1em;
                font-weight: 800;
                margin-bottom: 0em;
                overflow: hidden;
                -o-text-overflow: ".";
                text-overflow: ".";
                display: -webkit-box;
                -webkit-line-clamp: 3;
                line-clamp: 3;
                -webkit-box-orient: vertical;
                margin-left: -0.03em;
                line-height: 1;
                text-shadow: 2px 3px 1px #00000040;
                max-width: 9em;
                text-transform: uppercase;
                letter-spacing: -2px;
                word-spacing: 5px;
            }
            
            .full-start__pg, .full-start__status {
                font-size: 0.9em;
            }
            
            .new-interface-info__details {
                margin-bottom: 1.6em;
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                min-height: 1.9em;
                font-size: 1.3em;
            }
            
            .new-interface-info__split {
                margin: 0 1em;
                font-size: 0.7em;
            }
            
            .new-interface-info__description {
                font-size: 1.2em;
                font-weight: 300;
                line-height: 1.5;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 4;
                line-clamp: 4;
                -webkit-box-orient: vertical;
                width: 70%;
            }
            
            .new-interface .full-start__background {
                opacity: 0.7 !important;
            }
            
            .new-interface .full-start__background {
                height: 108%;
                left: 30px;
                top: -4.8em;
            }
            
            .new-interface .full-start__rate {
                font-size: 1.3em;
                margin-right: 0;
            }
            
            /* Полное удаление card__promo */
            .new-interface .card__promo,
            .new-interface .card .card__promo {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                opacity: 0 !important;
            }
            
            .new-interface .card-more__box {
                padding-bottom: 95%;
            }
            
            .new-interface .card.card--wide+.card-more .card-more__box {
                padding-bottom: 95%;
            }
            
            .new-interface .card.card--wide .card-watched {
                display: none !important;
            }
            
            body.light--version .new-interface-info__body {
                width: 69%;
                padding-top: 1.5em;
            }
            
            body.light--version .new-interface-info {
                height: 25.3em;
            }

            body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.focus .card__view{
                animation: animation-card-focus 0.2s
            }
            body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.animate-trigger-enter .card__view{
                animation: animation-trigger-enter 0.2s forwards
            }
            </style>
        `);
        
        $('body').append(Lampa.Template.get('new_interface_style', {}, true));
    }

    if (!window.plugin_interface_ready) startPlugin();
})();