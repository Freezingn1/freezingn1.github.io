(function () {
    'use strict'

    function start() {
        if (window.lampac_src_filter_plugin) {
            return;
        }

        window.lampac_src_filter_plugin = true;

        Lampa.Controller.listener.follow('toggle', function (event) {
            if (event.name !== 'select') {
                return;
            }

            var active = Lampa.Activity.active();
            var componentName = active.component.toLowerCase();

            if (componentName !== 'cinema_online_plugin' && componentName !== 'lampac' && componentName.indexOf('reyohoho_mod') !== 0) {
                return;
            }

            var $filterTitle = $('.selectbox__title');

            if ($filterTitle.length !== 1 || $filterTitle.text() !== Lampa.Lang.translate('title_filter')) {
                return;
            }

            var $sourceBtn = $('.simple-button--filter.filter--sort');

            if ($sourceBtn.length !== 1 || $sourceBtn.hasClass('hide')) {
                return;
            }

            var $selectBoxItem = Lampa.Template.get('selectbox_item', {
                title: Lampa.Lang.translate('settings_rest_source'),
                subtitle: $('div', $sourceBtn).text()
            });

            $selectBoxItem.on('hover:enter', function () {
                $sourceBtn.trigger('hover:enter');
            });

            $('.selectbox-item').first().after($selectBoxItem);
            Lampa.Controller.collectionSet($('body > .selectbox').find('.scroll__body'));
        });
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                start();
            }
        });
    }
})();