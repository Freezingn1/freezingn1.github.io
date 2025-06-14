(function () {
    'use strict';

    Lampa.TMDB.image = function (url) {
        var base = Lampa.Utils.protocol() + 'image.tmdb.org/' + url;
        return Lampa.Storage.field('proxy_tmdb') ? 'http://lampa.byskaz.ru/tmdb/img/' + url : base;
    };
	

    Lampa.TMDB.api = function (url) {
        var base = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + url;
        return Lampa.Storage.field('proxy_tmdb') ? 'http://lampa.byskaz.ru/tmdb/api/3/' + url : base;
    };
	
    Lampa.TMDB.api = function (url) {
        var base = Lampa.Utils.protocol() + 'tmdb.cub.red/' + url;
        return Lampa.Storage.field('proxy_tmdb') ? 'http://lampa.byskaz.ru/cub/tmdb./' + url : base;
    };	

    Lampa.Settings.listener.follow('open', function (e) {
        if (e.name == 'tmdb') {
            e.body.find('[data-parent="proxy"]').remove();
        }
    });
})();