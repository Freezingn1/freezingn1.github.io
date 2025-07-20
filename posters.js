(function () {
    'use strict';

    function startPlugin() {
      window.fix_size_plugin = true;

      function addPlugin() {
        var css = $('style#fix_size_css');

        if (!css.length) {
          css = $('<style type="text/css" id="fix_size_css"></style>');
          css.appendTo('head');
        }

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