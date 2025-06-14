(function() {
  'use strict';

  Lampa.Listener.follow('request_before', function(e) {
    var proxy_url = 'http://lampa.byskaz.ru/cub/tmdb./';
    var need_proxy = Lampa.Manifest.cub_mirrors.find(function(mirror) {
      return e.params.url.indexOf(mirror) > -1;
    });

    if (need_proxy && e.params.url.indexOf('tmdb.cub.red/') == -1) {
      e.params.url = proxy_url + e.params.url.replace(/^https?:\/\//, '');
    }
  });

})();