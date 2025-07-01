(function () {
    'use strict';

    function startPlugin() {
      window.fix_size_plugin = true;

      function addPlugin() {
        // Проверяем, активированы ли вертикальные карточки
        var isVerticalCards = Lampa.Storage.get('card_orientation') === 'vertical';
        
        if (!isVerticalCards) return;

        var css = $('style#fix_size_css');

        if (!css.length) {
          css = $('<style type="text/css" id="fix_size_css"></style>');
          css.appendTo('head');
        }

        css.html('.card--category { width: 16em !important }');
        var platform_screen = Lampa.Platform.screen;

        Lampa.Platform.screen = function (need) {
          if (need === 'tv') {
            try {
              var stack = new Error().stack.split('\n');
              var offset = stack[0] === 'Error' ? 1 : 0;

              if (/^( *at +new +)?create\$i/.test(stack[1 + offset]) && /^( *at +)?component(\/this)?\.append/.test(stack[2 + offset])) {
                return false;
              }
            } catch (e) {}
          }

          return platform_screen(need);
        };

        var layer_update = Lampa.Layer.update;

        var timer;
        $(window).on('resize', function () {
          clearTimeout(timer);
          timer = setTimeout(function () {
            Lampa.Layer.update();
          }, 150);
        });
        Lampa.Layer.update();

        // Следим за изменением настроек ориентации карточек
        Lampa.Storage.listener.follow('change', function(e) {
          if (e.name === 'card_orientation') {
            var newOrientation = Lampa.Storage.get('card_orientation');
            if (newOrientation === 'vertical') {
              // Перезапускаем плагин при включении вертикальных карточек
              if (!window.fix_size_plugin) startPlugin();
            } else {
              // Удаляем стили при выключении вертикальных карточек
              $('style#fix_size_css').remove();
              window.fix_size_plugin = false;
            }
          }
        });
      }

      if (window.appready) addPlugin();
      else {
        Lampa.Listener.follow('app', function (e) {
          if (e.type == 'ready') addPlugin();
        });
      }
    }

    if (!window.fix_size_plugin) startPlugin();
})();