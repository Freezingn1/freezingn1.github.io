(function () {
    'use strict';

    // Глобальный кэш для изображений
    var imageCache = {};
    var MAX_CACHE_SIZE = 100;

    function addToCache(cache, key, value) {
        if (Object.keys(cache).length >= MAX_CACHE_SIZE) {
            delete cache[Object.keys(cache)[0]];
        }
        cache[key] = value;
    }

    function create() {
      var html;
      var timer;
      var network = new Lampa.Reguest();
      var loaded = {};
      var isDestroyed = false;
      var logo_timer;

      this.create = function () {
        if (isDestroyed) return;
        html = $("<div class=\"new-interface-info\">\n            <div class=\"new-interface-info__body\">\n                <div class=\"new-interface-info__head\"></div>\n                <div class=\"new-interface-info__title\"></div>\n                <div class=\"new-interface-info__details\"></div>\n                <div class=\"new-interface-info__description\"></div>\n            </div>\n        </div>");
      };

      this.update = function (data) {
        if (isDestroyed || !html) return;

        const logoSetting = Lampa.Storage.get('logo_glav2') || 'show_all';
        
        if (logoSetting !== 'hide') {
            const type = data.name ? 'tv' : 'movie';
            const url = Lampa.TMDB.api(type + '/' + data.id + '/images?api_key=' + Lampa.TMDB.key());

            network.silent(url, (images) => {
                if (isDestroyed || !html) return;

                let bestLogo = null;
                
                if (images.logos && images.logos.length > 0) {
                    let bestRussianLogo = null;
                    let bestEnglishLogo = null;
                    let bestOtherLogo = null;

                    images.logos.forEach(logo => {
                        if (logo.iso_639_1 === 'ru') {
                            if (!bestRussianLogo || logo.vote_average > bestRussianLogo.vote_average) {
                                bestRussianLogo = logo;
                            }
                        }
                        else if (logo.iso_639_1 === 'en') {
                            if (!bestEnglishLogo || logo.vote_average > bestEnglishLogo.vote_average) {
                                bestEnglishLogo = logo;
                            }
                        }
                        else if (!bestOtherLogo || logo.vote_average > bestOtherLogo.vote_average) {
                            bestOtherLogo = logo;
                        }
                    });

                    bestLogo = bestRussianLogo || bestEnglishLogo || bestOtherLogo;

                    if (logoSetting === 'ru_only' && !bestRussianLogo) {
                        bestLogo = null;
                    }
                }
                
                this.applyLogo(data, bestLogo);
            }, () => {
                if (!isDestroyed && html) {
                    const titleElement = html.find('.new-interface-info__title');
                    if (titleElement.length) {
                        titleElement.text(data.title);
                    }
                }
            });
        } else if (!isDestroyed && html) {
            const titleElement = html.find('.new-interface-info__title');
            if (titleElement.length) {
                titleElement.text(data.title);
            }
        }

        if (!isDestroyed && html) {
            html.find('.new-interface-info__description').text(data.overview || Lampa.Lang.translate('full_notext'));
            Lampa.Background.change(Lampa.Api.img(data.backdrop_path, 'w200'));
            this.load(data);
        }
      };

      this.applyLogo = function(data, logo) {
        if (isDestroyed || !html) return;

        const titleElement = html.find('.new-interface-info__title');
        if (!titleElement.length) return;

        clearTimeout(logo_timer);

        if (!logo || !logo.file_path) {
            logo_timer = setTimeout(() => {
                if (isDestroyed || !html) return;
                titleElement.text(data.title);
            }, 1000);
            return;
        }

        const imageUrl = Lampa.TMDB.image("/t/p/w400" + logo.file_path);

        if (imageCache[imageUrl]) {
            logo_timer = setTimeout(() => {
                if (isDestroyed || !html) return;
                titleElement.html(imageCache[imageUrl]);
                setTimeout(() => {
                    titleElement.find('.new-interface-logo').css('opacity', 1);
                }, 10);
            }, 1000);
            return;
        }

        if (titleElement.data('current-logo') === imageUrl) return;
        titleElement.data('current-logo', imageUrl);

        logo_timer = setTimeout(() => {
            if (isDestroyed || !html) return;

            const tempImg = new Image();
            tempImg.src = imageUrl;

            tempImg.onload = () => {
                if (isDestroyed || !html) return;
                
                const logoHtml = `
                    <img class="new-interface-logo" 
                         src="${imageUrl}" 
                         alt="${data.title}"
                         loading="eager"
                         style="opacity: 0;"
                         onerror="this.remove(); this.parentElement.textContent='${data.title.replace(/"/g, '&quot;')}'" />
                `;
                
                addToCache(imageCache, imageUrl, logoHtml);
                titleElement.html(logoHtml);

                setTimeout(() => {
                    const logoImg = titleElement.find('.new-interface-logo');
                    if (logoImg.length) {
                        logoImg.css('opacity', 1);
                    }
                }, 10);
            };

            tempImg.onerror = () => {
                if (isDestroyed || !html) return;
                titleElement.text(data.title);
            };
        }, 500);
      };

      this.draw = function (data) {
        if (isDestroyed || !html) return;

        var create = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
        var vote = parseFloat((data.vote_average || 0) + '').toFixed(1);
        var head = [];
        var details = [];
        var countries = Lampa.Api.sources.tmdb.parseCountries(data);
        var pg = Lampa.Api.sources.tmdb.parsePG(data);
        
        if (create !== '0000') head.push('<span>' + create + '</span>');
        if (countries.length > 0) head.push(countries.join(', '));
        if (vote > 0) details.push('<div class="full-start__rate"><div>' + vote + '</div><div>TMDB</div></div>');
        if (data.number_of_episodes && data.number_of_episodes > 0) {
            details.push('<span class="full-start__pg">Эпизодов ' + data.number_of_episodes + '</span>');
        }
        
        if (data.runtime) details.push(Lampa.Utils.secondsToTime(data.runtime * 60, true));
        if (pg) details.push('<span class="full-start__pg" style="font-size: 0.9em;">' + pg + '</span>');
        
        html.find('.new-interface-info__head').empty().append(head.join(', '));
        html.find('.new-interface-info__details').html(details.join('<span class="new-interface-info__split">&#9679;</span>'));
      };

      this.load = function (data) {
        if (isDestroyed) return;
        var _this = this;

        clearTimeout(timer);
        var url = Lampa.TMDB.api((data.name ? 'tv' : 'movie') + '/' + data.id + '?api_key=' + Lampa.TMDB.key() + '&append_to_response=content_ratings,release_dates&language=' + Lampa.Storage.get('language'));
        if (loaded[url]) return this.draw(loaded[url]);
        timer = setTimeout(function () {
          if (isDestroyed) return;
          network.clear();
          network.timeout(5000);
          network.silent(url, function (movie) {
            if (isDestroyed) return;
            loaded[url] = movie;
            _this.draw(movie);
          });
        }, 1000);
      };

      this.render = function () {
        return isDestroyed ? null : html;
      };

      this.empty = function () {};

      this.destroy = function () {
        isDestroyed = true;
        clearTimeout(logo_timer);
        if (html) {
            html.remove();
            html = null;
        }
        loaded = {};
        if (network) {
            network.clear();
        }
        clearTimeout(timer);
      };
    }

    function component(object) {
      var network = new Lampa.Reguest();
      var scroll = new Lampa.Scroll({
        mask: true,
        over: true,
        scroll_by_item: true
      });
      var items = [];
      var html = $('<div class="new-interface"><img class="full-start__background"></div>');
      var active = 0;
      var newlampa = Lampa.Manifest.app_digital >= 166;
      var info;
      var lezydata;
      var viewall = Lampa.Storage.field('card_views_type') == 'view' || Lampa.Storage.field('navigation_type') == 'mouse';
      var background_img = html.find('.full-start__background');
      var background_last = '';
      var background_timer;

      this.create = function () {};

      this.empty = function () {
        var button;

        if (object.source == 'tmdb') {
          button = $('<div class="empty__footer"><div class="simple-button selector">' + Lampa.Lang.translate('change_source_on_cub') + '</div></div>');
          button.find('.selector').on('hover:enter', function () {
            Lampa.Storage.set('source', 'cub');
            Lampa.Activity.replace({
              source: 'cub'
            });
          });
        }

        var empty = new Lampa.Empty();
        html.append(empty.render(button));
        this.start = empty.start;
        this.activity.loader(false);
        this.activity.toggle();
      };

      this.loadNext = function () {
        var _this = this;

        if (this.next && !this.next_wait && items.length) {
          this.next_wait = true;
          this.next(function (new_data) {
            _this.next_wait = false;
            new_data.forEach(_this.append.bind(_this));
            Lampa.Layer.visible(items[active + 1].render(true));
          }, function () {
            _this.next_wait = false;
          });
        }
      };

      this.push = function () {};

      this.build = function (data) {
        var _this2 = this;

        lezydata = data;
        info = new create(object);
        info.create();
        scroll.minus(info.render());
        data.slice(0, viewall ? data.length : 2).forEach(this.append.bind(this));
        html.append(info.render());
        html.append(scroll.render());

        if (newlampa) {
          Lampa.Layer.update(html);
          Lampa.Layer.visible(scroll.render(true));
          scroll.onEnd = this.loadNext.bind(this);

          scroll.onWheel = function (step) {
            if (!Lampa.Controller.own(_this2)) _this2.start();
            if (step > 0) _this2.down();else if (active > 0) _this2.up();
          };
        }

        this.activity.loader(false);
        this.activity.toggle();
      };

      this.background = function (elem) {
        var new_background = Lampa.Api.img(elem.backdrop_path, 'w1280');
        clearTimeout(background_timer);
        if (new_background == background_last) return;
        background_timer = setTimeout(function () {
          background_img.removeClass('loaded');

          background_img[0].onload = function () {
            background_img.addClass('loaded');
          };

          background_img[0].onerror = function () {
            background_img.removeClass('loaded');
          };

          background_last = new_background;
          setTimeout(function () {
            background_img[0].src = background_last;
          }, 300);
        }, 500);
      };

      this.append = function (element) {
        var _this3 = this;

        if (element.ready) return;
        element.ready = true;
        var item = new Lampa.InteractionLine(element, {
          url: element.url,
          card_small: true,
          cardClass: element.cardClass,
          genres: object.genres,
          object: object,
          card_wide: true,
          nomore: element.nomore
        });
        item.create();
        item.onDown = this.down.bind(this);
        item.onUp = this.up.bind(this);
        item.onBack = this.back.bind(this);

        item.onToggle = function () {
          active = items.indexOf(item);
        };

        if (this.onMore) item.onMore = this.onMore.bind(this);

        item.onFocus = function (elem) {
          info.update(elem);
          _this3.background(elem);
        };

        item.onHover = function (elem) {
          info.update(elem);
          _this3.background(elem);
        };

        item.onFocusMore = info.empty.bind(info);
        scroll.append(item.render());
        items.push(item);
      };

      this.back = function () {
        Lampa.Activity.backward();
      };

      this.down = function () {
        active++;
        active = Math.min(active, items.length - 1);
        if (!viewall) lezydata.slice(0, active + 2).forEach(this.append.bind(this));
        items[active].toggle();
        scroll.update(items[active].render());
      };

      this.up = function () {
        active--;

        if (active < 0) {
          active = 0;
          Lampa.Controller.toggle('head');
        } else {
          items[active].toggle();
          scroll.update(items[active].render());
        }
      };

      this.start = function () {
        var _this4 = this;

        Lampa.Controller.add('content', {
          link: this,
          toggle: function toggle() {
            if (_this4.activity.canRefresh()) return false;

            if (items.length) {
              items[active].toggle();
            }
          },
          update: function update() {},
          left: function left() {
            if (Navigator.canmove('left')) Navigator.move('left');else Lampa.Controller.toggle('menu');
          },
          right: function right() {
            Navigator.move('right');
          },
          up: function up() {
            if (Navigator.canmove('up')) Navigator.move('up');else Lampa.Controller.toggle('head');
          },
          down: function down() {
            if (Navigator.canmove('down')) Navigator.move('down');
          },
          back: this.back
        });
        Lampa.Controller.toggle('content');
      };

      this.refresh = function () {
        this.activity.loader(true);
        this.activity.need_refresh = true;
      };

      this.pause = function () {};

      this.stop = function () {};

      this.render = function () {
        return html;
      };

      this.destroy = function () {
        network.clear();
        Lampa.Arrays.destroy(items);
        scroll.destroy();
        if (info) info.destroy();
        html.remove();
        items = null;
        network = null;
        lezydata = null;
      };
    }

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

      Lampa.Template.add('new_interface_style', `
        <style>
        .new-interface .card--small.card--wide {
            width: 18.3em;
        }
		
		.full-start__pg, .full-start__status {
			font-size: 0.9em;
		}
		
		.full-start-new__rate-line .full-start__pg {
			font-size: 0.9em;
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
            -o-text-overflow: ".";
            text-overflow: ".";
            margin-bottom: 0em;
            overflow: hidden;
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
        
        .new-interface-logo {
            margin-top: 0.3em;
            margin-bottom: 0.3em;
            max-width: 7em;
            max-height: 3em;
            object-fit: contain;
            width: auto;
            height: auto;
            min-height: 1em;
            filter: drop-shadow(0 0 0.6px rgba(255, 255, 255, 0.4));
            opacity: 0;
            transition: opacity 0.5s ease;
        }
        
        .new-interface-logo.loaded {
            opacity: 1;
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
            display: none;
            font-size: 1.2em;
            font-weight: 300;
            line-height: 1.5;
            overflow: hidden;
            -o-text-overflow: ".";
            text-overflow: ".";
            -webkit-line-clamp: 4;
            line-clamp: 4;
            -webkit-box-orient: vertical;
            width: 70%;
        }
        
        .new-interface .card-more__box {
            padding-bottom: 95%;
        }
        
        .new-interface .full-start__background {
            height: 108%;
            top: -6em;
        }
        
        .new-interface .full-start__rate {
            font-size: 1.3em;
            margin-right: 0;
        }
        
        .new-interface .card__promo {
            display: none;
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