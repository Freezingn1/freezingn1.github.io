(function() {
  'use strict';

  Lampa.Listener.follow('request_before', function(e) {
    var proxy_url = 'http://lampa.byskaz.ru/cub/tmdb./'; // Прокси для tmdb.cub.red
    var original_domain = 'tmdb.cub.red/'; // Оригинальный домен, который нужно проксировать

    // Проверяем, содержит ли URL оригинальный домен и не является ли уже проксированным
    if (e.params.url.indexOf(original_domain) > -1 && e.params.url.indexOf('/cub/tmdb/') === -1) {
      // Удаляем протокол и оригинальный домен, оставляя только путь
      var path = e.params.url.replace(/^https?:\/\//, '').replace(original_domain, '');
      // Формируем новый URL с прокси
      e.params.url = proxy_url + path;
    }
  });

})();