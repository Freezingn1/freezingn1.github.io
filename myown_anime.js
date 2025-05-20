(function (  ) {
    'use strict';
    
    var anime_icon = '<svg height="173" viewBox="0 0 180 173" fill="none" xmlns="http://www.w3.org/2000/svg">                        <path fill-rule="evenodd" clip-rule="evenodd" d="M126 3C126 18.464 109.435 31 89 31C68.5655 31 52 18.464 52 3C52 2.4505 52.0209 1.90466 52.0622 1.36298C21.3146 15.6761 0 46.8489 0 83C0 132.706 40.2944 173 90 173C139.706 173 180 132.706 180 83C180 46.0344 157.714 14.2739 125.845 0.421326C125.948 1.27051 126 2.13062 126 3ZM88.5 169C125.779 169 156 141.466 156 107.5C156 84.6425 142.314 64.6974 122 54.0966C116.6 51.2787 110.733 55.1047 104.529 59.1496C99.3914 62.4998 94.0231 66 88.5 66C82.9769 66 77.6086 62.4998 72.4707 59.1496C66.2673 55.1047 60.3995 51.2787 55 54.0966C34.6864 64.6974 21 84.6425 21 107.5C21 141.466 51.2208 169 88.5 169Z" fill="currentColor"></path>                        <path d="M133 121.5C133 143.315 114.196 161 91 161C67.804 161 49 143.315 49 121.5C49 99.6848 67.804 116.5 91 116.5C114.196 116.5 133 99.6848 133 121.5Z" fill="currentColor"></path>                        <path d="M72 81C72 89.8366 66.1797 97 59 97C51.8203 97 46 89.8366 46 81C46 72.1634 51.8203 65 59 65C66.1797 65 72 72.1634 72 81Z" fill="currentColor"></path>                        <path d="M131 81C131 89.8366 125.18 97 118 97C110.82 97 105 89.8366 105 81C105 72.1634 110.82 65 118 65C125.18 65 131 72.1634 131 81Z" fill="currentColor"></path>                    </svg>';

    // Жанры
    var myGenres = [
        { id: 35, title: 'filter_genre_cm' },
        { id: 80, title: 'filter_genre_cr' },
        { id: 18, title: 'filter_genre_dr' },
        { id: 10751, title: 'filter_genre_fm' },
        { id: 9648, title: 'filter_genre_de' },
        { id: 10749, title: 'filter_genre_md' }
    ];

    function startPlugin() {
      window.plugin_myown_anime_ready = true;

      var Episode = function(data) {
        var card = data.card || data;
        var episode = data.next_episode_to_air || data.episode || {};
        if (card.source == undefined) card.source = 'tmdb';
        Lampa.Arrays.extend(card, {
          title: card.name,
          original_title: card.original_name,
          release_date: card.first_air_date
        });
        card.release_year = ((card.release_date || '0000') + '').slice(0, 4);

        function remove(elem) {
          if (elem) elem.remove();
        }

        this.build = function () {
          this.card = Lampa.Template.js('card_episode');
          this.img_poster = this.card.querySelector('.card__img') || {};
          this.img_episode = this.card.querySelector('.full-episode__img img') || {};
          this.card.querySelector('.card__title').innerText = card.title;
          this.card.querySelector('.full-episode__num').innerText = card.unwatched || '';
          if (episode & episode.air_date) {
            this.card.querySelector('.full-episode__name').innerText = ('s' + (episode.season_number || '?') + 'e' + (episode.episode_number || '?') + '. ') + (episode.name || Lampa.Lang.translate('noname'));
            this.card.querySelector('.full-episode__date').innerText = episode.air_date ? Lampa.Utils.parseTime(episode.air_date).full : '----';
          }

          if (card.release_year == '0000') {
            remove(this.card.querySelector('.card__age'));
          } else {
            this.card.querySelector('.card__age').innerText = card.release_year;
          }

          this.card.addEventListener('visible', this.visible.bind(this));
        };

        this.image = function () {
          var _this = this;
          this.img_poster.onload = function () {
          };
          this.img_poster.onerror = function () {
            _this.img_poster.src = './img/img_broken.svg';
          };
          this.img_episode.onload = function () {
            _this.card.querySelector('.full-episode__img').classList.add('full-episode__img--loaded');
          };
          this.img_episode.onerror = function () {
            _this.img_episode.src = './img/img_broken.svg';
          };
        };

        this.create = function () {
          var _this2 = this;
          this.build();
          this.card.addEventListener('hover:focus', function () {
            if (_this2.onFocus) _this2.onFocus(_this2.card, card);
          });
          this.card.addEventListener('hover:hover', function () {
            if (_this2.onHover) _this2.onHover(_this2.card, card);
          });
          this.card.addEventListener('hover:enter', function () {
            if (_this2.onEnter) _this2.onEnter(_this2.card, card);
          });
          this.image();
        };

        this.visible = function () {
          if (card.poster_path) this.img_poster.src = Lampa.Api.img(card.poster_path);
            else if (card.profile_path) this.img_poster.src = Lampa.Api.img(card.profile_path);
            else if (card.poster) this.img_poster.src = card.poster;
            else if (card.img) this.img_poster.src = card.img;
            else this.img_poster.src = './img/img_broken.svg';
          if (card.still_path) this.img_episode.src = Lampa.Api.img(episode.still_path, 'w300');
            else if (card.backdrop_path)  this.img_episode.src = Lampa.Api.img(card.backdrop_path, 'w300');
            else if (episode.img) this.img_episode.src = episode.img;
            else if (card.img) this.img_episode.src = card.img;
            else this.img_episode.src = './img/img_broken.svg';
          if (this.onVisible) this.onVisible(this.card, card);
        };

        this.destroy = function () {
          this.img_poster.onerror = function () {};
          this.img_poster.onload = function () {};
          this.img_episode.onerror = function () {};
          this.img_episode.onload = function () {};
          this.img_poster.src = '';
          this.img_episode.src = '';
          remove(this.card);
          this.card = null;
          this.img_poster = null;
          this.img_episode = null;
        };

        this.render = function (js) {
          return js ? this.card : $(this.card);
        };
      }

      var SourceTMDB = function (parrent) {
        this.network = new Lampa.Reguest();
        this.discovery = false;

        this.main = function () {
          var owner = this;
          var params = arguments.length > 0 & arguments[0] !== undefined ? arguments[0] : {};
          var oncomplite = arguments.length > 1 ? arguments[1] : undefined;
          var onerror = arguments.length > 2 ? arguments[2] : undefined;
          var parts_limit = 6;
          var current_year = new Date().getFullYear();
          var parts_data = [
		  // Популярные аниме 2020–2026 с высоким рейтингом
            function (call) {
              owner.get('discover/tv?with_original_language=ja|zh|ko&with_genres=16&without_genres=10762&first_air_date.gte=2020-01-01&first_air_date.lte=2026-12-31&sort_by=popularity.desc&vote_average.gte=7.0&vote_count.gte=25', params, function (json) {
                json.title = 'Популярные сериалы с высоким рейтингом';

                call(json);
              }, call);
            },  
           // Новинки
            function (call) {
              owner.get('discover/movie?with_genres=16&without_genres=10762&with_keywords=210024|287501&with_origin_country=JP&sort_by=primary_release_date.desc&vote_average.gte=5&vote_count.gte=5', params, function (json) {
                json.title = 'Полнометражное - новинки';

                call(json);
              }, call);
            },  
            // Новинки Сериалы
            function (call) {
              owner.get('discover/tv?with_genres=16&without_genres=10762&with_keywords=210024|287501&with_origin_country=JP&sort_by=first_air_date.desc&vote_average.gte=5&vote_count.gte=5', params, function (json) {
                json.title = 'Сериалы - новинки';
                call(json);
              }, call);
            },  
            // Популярное
            function (call) {
              owner.get('discover/movie?with_genres=16&without_genres=10762&with_keywords=210024|287501&with_origin_country=JP&sort_by=popularity.desc&vote_count.gte=20', params, function (json) {
                json.title = 'Полнометражное - популярное';
                //json.small = true;
                //json.wide = true;
                //json.results.forEach(function (card) {
                //   card.promo = card.overview;
                //   card.promo_title = card.title || card.name;
                //});
                call(json);
              }, call);
            },       
            // Популярное Сериалы
            function (call) {
              owner.get('discover/tv?with_genres=16&without_genres=10762&with_keywords=210024|287501&with_origin_country=JP&sort_by=popularity.desc&vote_count.gte=20', params, function (json) {
                json.title = 'Сериалы - популярное';
                //json.small = true;
                //json.wide = true;
                //json.results.forEach(function (card) {
                //   card.promo = card.overview;
                //   card.promo_title = card.title || card.name;
                //});
                call(json);
              }, call);
            },    
            // В топе
            function (call) {
              owner.get('discover/movie?with_genres=16&without_genres=10762&with_keywords=210024|287501&with_origin_country=JP&sort_by=vote_average.desc&vote_count.gte=100', params, function (json) {
                json.title = 'Полнометражное - в топе';
                //json.line_type = 'top';
                call(json);
              }, call);
            },   
            // В топе Сериалы
            function (call) {
              owner.get('discover/tv?with_genres=16&without_genres=10762&with_keywords=210024|287501&with_origin_country=JP&sort_by=vote_average.desc&vote_count.gte=100', params, function (json) {
                json.title = 'Сериалы - в топе';
                //json.line_type = 'top';
                call(json);
              }, call);
            }, 
            // Стоит пересмотреть (рейтинг выше 8)
            function (call) {
              owner.get('discover/movie?with_genres=16&without_genres=10762&with_keywords=210024|287501&with_origin_country=JP&vote_average.gte=8&vote_count.gte=100', params, function (json) {
                json.title = 'Полнометражное - стоит пересмотреть';
                call(json);
              }, call);
            },   
            // Стоит пересмотреть (рейтинг выше 8) Сериалы
            function (call) {
              owner.get('discover/tv?with_genres=16&without_genres=10762&with_keywords=210024|287501&with_origin_country=JP&vote_average.gte=8&vote_count.gte=100', params, function (json) {
                json.title = 'Сериалы - стоит пересмотреть';
                call(json);
              }, call);
            },    
          ];
          
          myGenres.forEach(function (myGenres) {
            var event = function event(call) {
              owner.get('discover/movie?without_genres=10762&with_keywords=210024|287501&with_origin_country=JP&sort_by=primary_release_date.desc&vote_average.gte=5&vote_count.gte=5&with_genres=16,' + myGenres.id, params, function (json) {
                json.title = 'Полнометражное - ' + Lampa.Lang.translate(myGenres.title.replace(/[^a-z_]/g, ''));
                call(json);
              }, call);
            };
            parts_data.push(event);
            event = function event(call) {
              owner.get('discover/tv?without_genres=10762&with_keywords=210024|287501&with_origin_country=JP&sort_by=first_air_date.desc&vote_average.gte=5&vote_count.gte=5&with_genres=16,' + myGenres.id, params, function (json) {
                json.title = 'Сериалы - ' + Lampa.Lang.translate(myGenres.title.replace(/[^a-z_]/g, ''));
                call(json);
              }, call);
            };
            parts_data.push(event);
          });

          function loadPart(partLoaded, partEmpty) {
            Lampa.Api.partNext(parts_data, parts_limit, partLoaded, partEmpty);
          }

          loadPart(oncomplite, onerror);
          return loadPart;
        }
      }

      function add() {
        var myown_anime = Object.assign({}, Lampa.Api.sources.tmdb, new SourceTMDB(Lampa.Api.sources.tmdb));
        Lampa.Api.sources.myown_anime = myown_anime;
        Object.defineProperty(Lampa.Api.sources, 'myown_anime', {
          get: function get() {
            return myown_anime;
          }
        });
        Lampa.Params.select('source', Object.assign({}, Lampa.Params.values['source'], {'myown_anime': 'myown_anime'}), 'tmdb');


        var e = $('<li class="menu__item selector" data-action="rus"><div class="menu__ico">' + anime_icon + '</div><div class="menu__text">Аниме</div></li>');
        e.on("hover:enter", function() {
            Lampa.Activity.push({
        title: 'Аниме',
        component: 'main',
        source: 'myown_anime'
            }); 
        }), 
        $(".menu .menu__list").eq(0).append(e);
     
      }

      if (window.appready) add(); else {
        Lampa.Listener.follow('app', function (e) {
          if (e.type == 'ready') { add(); }
        });
      }
    }

    if (!window.plugin_myown_anime_ready) startPlugin();

})( );
