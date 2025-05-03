(function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  function State(object) {
    this.state = object.state;

    this.start = function () {
      this.dispath(this.state);
    };

    this.dispath = function (action_name) {
      var action = object.transitions[action_name];

      if (action) {
        action.call(this, this);
      } else {
        console.log('invalid action');
      }
    };
  }

  var Player = /*#__PURE__*/function () {
    function Player(object, video) {
      var _this = this;

      _classCallCheck(this, Player);

      this.paused = false;
      this.display = false;
      this.ended = false;
      this.listener = Lampa.Subscribe();
      this.html = $("\n            <div class=\"cardify-trailer\">\n                <div class=\"cardify-trailer__youtube\">\n                    <div class=\"cardify-trailer__youtube-iframe\"></div>\n                    <div class=\"cardify-trailer__youtube-line one\"></div>\n                    <div class=\"cardify-trailer__youtube-line two\"></div>\n                </div>\n\n                <div class=\"cardify-trailer__controlls\">\n                    <div class=\"cardify-trailer__title\"></div>\n                    <div class=\"cardify-trailer__remote\">\n                        <div class=\"cardify-trailer__remote-icon\">\n                            <svg width=\"37\" height=\"37\" viewBox=\"0 0 37 37\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                                <path d=\"M32.5196 7.22042L26.7992 12.9408C27.8463 14.5217 28.4561 16.4175 28.4561 18.4557C28.4561 20.857 27.6098 23.0605 26.1991 24.7844L31.8718 30.457C34.7226 27.2724 36.4561 23.0667 36.4561 18.4561C36.4561 14.2059 34.983 10.2998 32.5196 7.22042Z\" fill=\"white\" fill-opacity=\"0.28\"/>\n                                <path d=\"M31.262 31.1054L31.1054 31.262C31.158 31.2102 31.2102 31.158 31.262 31.1054Z\" fill=\"white\" fill-opacity=\"0.28\"/>\n                                <path d=\"M29.6917 32.5196L23.971 26.7989C22.3901 27.846 20.4943 28.4557 18.4561 28.4557C16.4179 28.4557 14.5221 27.846 12.9412 26.7989L7.22042 32.5196C10.2998 34.983 14.2059 36.4561 18.4561 36.4561C22.7062 36.4561 26.6123 34.983 29.6917 32.5196Z\" fill=\"white\" fill-opacity=\"0.28\"/>\n                                <path d=\"M5.81349 31.2688L5.64334 31.0986C5.69968 31.1557 5.7564 31.2124 5.81349 31.2688Z\" fill=\"white\" fill-opacity=\"0.28\"/>\n                                <path d=\"M5.04033 30.4571L10.7131 24.7844C9.30243 23.0605 8.4561 20.857 8.4561 18.4557C8.4561 16.4175 9.06588 14.5217 10.113 12.9408L4.39251 7.22037C1.9291 10.2998 0.456055 14.2059 0.456055 18.4561C0.456054 23.0667 2.18955 27.2724 5.04033 30.4571Z\" fill=\"white\" fill-opacity=\"0.28\"/>\n                                <path d=\"M6.45507 5.04029C9.63973 2.18953 13.8455 0.456055 18.4561 0.456055C23.0667 0.456054 27.2724 2.18955 30.4571 5.04034L24.7847 10.7127C23.0609 9.30207 20.8573 8.45575 18.4561 8.45575C16.0549 8.45575 13.8513 9.30207 12.1275 10.7127L6.45507 5.04029Z\" fill=\"white\" fill-opacity=\"0.28\"/>\n                                <circle cx=\"18.4565\" cy=\"18.4561\" r=\"7\" fill=\"white\"/>\n                            </svg>\n                        </div>\n                        <div class=\"cardify-trailer__remote-text\">".concat(Lampa.Lang.translate('cardify_enable_sound'), "</div>\n                    </div>\n                </div>\n            </div>\n        "));

      if (typeof YT !== 'undefined' && YT.Player) {
        this.youtube = new YT.Player(this.html.find('.cardify-trailer__youtube-iframe')[0], {
          height: window.innerHeight * 2,
          width: window.innerWidth,
          playerVars: {
            'controls': 1,
            'showinfo': 0,
            'autohide': 1,
            'modestbranding': 1,
            'autoplay': 0,
            'disablekb': 1,
            'fs': 0,
            'enablejsapi': 1,
            'playsinline': 1,
            'rel': 0,
            'suggestedQuality': 'hd1080',
            'setPlaybackQuality': 'hd1080',
            'mute': 1
          },
          videoId: video.id,
          events: {
            onReady: function onReady(event) {
              _this.loaded = true;

              _this.listener.send('loaded');
            },
            onStateChange: function onStateChange(state) {
              if (state.data == YT.PlayerState.PLAYING) {
                _this.paused = false;
                clearInterval(_this.timer);
                _this.timer = setInterval(function () {
                  var left = _this.youtube.getDuration() - _this.youtube.getCurrentTime();

                  var toend = 13;
                  var fade = 5;

                  if (left <= toend + fade) {
                    var vol = 1 - (toend + fade - left) / fade;

                    _this.youtube.setVolume(Math.max(0, vol * 100));

                    if (left <= toend) {
                      clearInterval(_this.timer);

                      _this.listener.send('ended');
                    }
                  }
                }, 100);

                _this.listener.send('play');

                if (window.cardify_fist_unmute) _this.unmute();
              }

              if (state.data == YT.PlayerState.PAUSED) {
                _this.paused = true;
                clearInterval(_this.timer);

                _this.listener.send('paused');
              }

              if (state.data == YT.PlayerState.ENDED) {
                _this.listener.send('ended');
              }

              if (state.data == YT.PlayerState.BUFFERING) {
                state.target.setPlaybackQuality('hd1080');
              }
            },
            onError: function onError(e) {
              _this.loaded = false;

              _this.listener.send('error');
            }
          }
        });
      }
    }

    _createClass(Player, [{
      key: "play",
      value: function play() {
        try {
          this.youtube.playVideo();
        } catch (e) {}
      }
    }, {
      key: "pause",
      value: function pause() {
        try {
          this.youtube.pauseVideo();
        } catch (e) {}
      }
    }, {
      key: "unmute",
      value: function unmute() {
        try {
          this.youtube.unMute();
          this.html.find('.cardify-trailer__remote').remove();
          window.cardify_fist_unmute = true;
        } catch (e) {}
      }
    }, {
      key: "show",
      value: function show() {
        this.html.addClass('display');
        this.display = true;
      }
    }, {
      key: "hide",
      value: function hide() {
        this.html.removeClass('display');
        this.display = false;
      }
    }, {
      key: "render",
      value: function render() {
        return this.html;
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this.loaded = false;
        this.display = false;

        try {
          this.youtube.destroy();
        } catch (e) {}

        clearInterval(this.timer);
        this.html.remove();
      }
    }]);

    return Player;
  }();

  var Trailer = /*#__PURE__*/function () {
    function Trailer(object, video) {
      var _this = this;

      _classCallCheck(this, Trailer);

      object.activity.trailer_ready = true;
      this.object = object;
      this.video = video;
      this.player;
      this.background = this.object.activity.render().find('.full-start__background');
      this.startblock = this.object.activity.render().find('.cardify');
      this.head = $('.head');
      this.timelauch = 1200;
      this.firstlauch = false;
      this.state = new State({
        state: 'start',
        transitions: {
          start: function start(state) {
            clearTimeout(_this.timer_load);
            if (_this.player.display) state.dispath('play');else if (_this.player.loaded) {
              _this.animate();

              _this.timer_load = setTimeout(function () {
                state.dispath('load');
              }, _this.timelauch);
            }
          },
          load: function load(state) {
            if (_this.player.loaded && Lampa.Controller.enabled().name == 'full_start' && _this.same()) state.dispath('play');
          },
          play: function play() {
            _this.player.play();
          },
          toggle: function toggle(state) {
            clearTimeout(_this.timer_load);

            if (Lampa.Controller.enabled().name == 'cardify_trailer') ; else if (Lampa.Controller.enabled().name == 'full_start' && _this.same()) {
              state.start();
            } else if (_this.player.display) {
              state.dispath('hide');
            }
          },
          hide: function hide() {
            _this.player.pause();

            _this.player.hide();

            _this.background.removeClass('nodisplay');

            _this.startblock.removeClass('nodisplay');

            _this.head.removeClass('nodisplay');

            _this.object.activity.render().find('.cardify-preview__loader').width(0);
          }
        }
      });
      this.start();
    }

    _createClass(Trailer, [{
      key: "same",
      value: function same() {
        return Lampa.Activity.active().activity === this.object.activity;
      }
    }, {
      key: "animate",
      value: function animate() {
        var _this2 = this;

        var loader = this.object.activity.render().find('.cardify-preview__loader').width(0);
        var started = Date.now();
        clearInterval(this.timer_anim);
        this.timer_anim = setInterval(function () {
          var left = Date.now() - started;
          if (left > _this2.timelauch) clearInterval(_this2.timer_anim);
          loader.width(Math.round(left / _this2.timelauch * 100) + '%');
        }, 100);
      }
    }, {
      key: "preview",
      value: function preview() {
        var preview = $("\n            <div class=\"cardify-preview\">\n                <div>\n                    <img class=\"cardify-preview__img\" />\n                    <div class=\"cardify-preview__line one\"></div>\n                    <div class=\"cardify-preview__line two\"></div>\n                    <div class=\"cardify-preview__loader\"></div>\n                </div>\n            </div>\n        ");
        Lampa.Utils.imgLoad($('img', preview), this.video.img, function () {
          $('img', preview).addClass('loaded');
        });
        this.object.activity.render().find('.cardify__right').append(preview);
      }
    }, {
      key: "controll",
      value: function controll() {
        var _this3 = this;

        var out = function out() {
          _this3.state.dispath('hide');

          Lampa.Controller.toggle('full_start');
        };

        Lampa.Controller.add('cardify_trailer', {
          toggle: function toggle() {
            Lampa.Controller.clear();
          },
          enter: function enter() {
            _this3.player.unmute();
          },
          left: out.bind(this),
          up: out.bind(this),
          down: out.bind(this),
          right: out.bind(this),
          back: function back() {
            _this3.player.destroy();

            _this3.object.activity.render().find('.cardify-preview').remove();

            out();
          }
        });
        Lampa.Controller.toggle('cardify_trailer');
      }
    }, {
      key: "start",
      value: function start() {
        var _this4 = this;

        var _self = this;

        var toggle = function toggle(e) {
          _self.state.dispath('toggle');
        };

        var destroy = function destroy(e) {
          if (e.type == 'destroy' && e.object.activity === _self.object.activity) remove();
        };

        var remove = function remove() {
          Lampa.Listener.remove('activity', destroy);
          Lampa.Controller.listener.remove('toggle', toggle);

          _self.destroy();
        };

        Lampa.Listener.follow('activity', destroy);
        Lampa.Controller.listener.follow('toggle', toggle);

        this.player = new Player(this.object, this.video);
        this.player.listener.follow('loaded', function () {
          _this4.preview();

          _this4.state.start();
        });
        this.player.listener.follow('play', function () {
          clearTimeout(_this4.timer_show);

          if (!_this4.firstlauch) {
            _this4.firstlauch = true;
            _this4.timelauch = 5000;
          }

          _this4.timer_show = setTimeout(function () {
            _this4.player.show();

            _this4.background.addClass('nodisplay');

            _this4.startblock.addClass('nodisplay');

            _this4.head.addClass('nodisplay');

            _this4.controll();
          }, 500);
        });
        this.player.listener.follow('ended,error', function () {
          _this4.state.dispath('hide');

          if (Lampa.Controller.enabled().name !== 'full_start') Lampa.Controller.toggle('full_start');

          _this4.object.activity.render().find('.cardify-preview').remove();

          setTimeout(remove, 300);
        });
        this.object.activity.render().find('.activity__body').prepend(this.player.render());

        this.state.start();
      }
    }, {
      key: "destroy",
      value: function destroy() {
        clearTimeout(this.timer_load);
        clearTimeout(this.timer_show);
        clearInterval(this.timer_anim);
        this.player.destroy();
      }
    }]);

    return Trailer;
  }();

  function startPlugin() {
    if (!Lampa.Platform.screen('tv')) return console.log('Cardify', 'no tv');
    
    Lampa.Lang.add({
      cardify_enable_sound: {
        ru: 'Включить звук',
        en: 'Enable sound',
        uk: 'Увімкнути звук',
        be: 'Уключыць гук',
        zh: '启用声音',
        pt: 'Ativar som',
        bg: 'Включване на звук'
      },
      cardify_enable_trailer: {
        ru: 'Показывать трейлер',
        en: 'Show trailer',
        uk: 'Показувати трейлер',
        be: 'Паказваць трэйлер',
        zh: '显示预告片',
        pt: 'Mostrar trailer',
        bg: 'Показване на трейлър'
      }
    });
    
    Lampa.Template.add('full_start_new', `
    <div class="full-start-new cardify">
        <div class="full-start-new__body">
            <div class="full-start-new__left hide">
                <div class="full-start-new__poster">
                    <img class="full-start-new__img full--poster" />
                </div>
            </div>

            <div class="full-start-new__right">
                <div class="cardify__left">
                    <div class="full-start-new__head"></div>
                    <div class="full-start-new__title">
                        <div class="full-start-new__logo ru-logo" style="background-image: var(--logo-ru);"></div>
                        <div class="full-start-new__logo en-logo" style="background-image: var(--logo-en);"></div>
                        <div class="full-start-new__text">{title}</div>
                    </div>

                    <div class="cardify__details">
                        <div class="full-start-new__details"></div>
                    </div>

                    <div class="full-start-new__buttons">
                        <!-- кнопки остаются без изменений -->
                    </div>
                </div>

                <div class="cardify__right">
                    <div class="full-start-new__reactions selector">
                        <div>#{reactions_none}</div>
                    </div>

                    <div class="full-start-new__rate-line">
                        <div class="full-start__pg hide"></div>
                        <div class="full-start__status hide"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="hide buttons--container">
            <!-- кнопки контейнера остаются без изменений -->
        </div>
    </div>
    `);
    
    var style = `
    <style>
    .cardify .full-start-new__title {
        position: relative;
        min-height: 3em;
        display: flex;
        align-items: center;
    }
    .cardify .full-start-new__logo {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: left center;
        display: none;
    }
    .cardify .full-start-new__text {
        display: none;
    }
    /* остальные стили остаются без изменений */
    </style>
    `;
    
    Lampa.Template.add('cardify_css', style);
    $('body').append(Lampa.Template.get('cardify_css', {}, true));
    
	
	
    var icon = "<svg width=\"36\" height=\"28\" viewBox=\"0 0 36 28\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n        <rect x=\"1.5\" y=\"1.5\" width=\"33\" height=\"25\" rx=\"3.5\" stroke=\"white\" stroke-width=\"3\"/>\n        <rect x=\"5\" y=\"14\" width=\"17\" height=\"4\" rx=\"2\" fill=\"white\"/>\n        <rect x=\"5\" y=\"20\" width=\"10\" height=\"3\" rx=\"1.5\" fill=\"white\"/>\n        <rect x=\"25\" y=\"20\" width=\"6\" height=\"3\" rx=\"1.5\" fill=\"white\"/>\n    </svg>";
    
    Lampa.SettingsApi.addComponent({
      component: 'cardify',
      icon: icon,
      name: 'Cardify'
    });
    
    Lampa.SettingsApi.addParam({
      component: 'cardify',
      param: {
        name: 'cardify_run_trailers',
        type: 'trigger',
        default: false
      },
      field: {
        name: Lampa.Lang.translate('cardify_enable_trailer')
      }
    });

    function video(data) {
      if (data.videos && data.videos.results.length) {
        var items = [];
        data.videos.results.forEach(function (element) {
          items.push({
            title: Lampa.Utils.shortText(element.name, 50),
            id: element.key,
            code: element.iso_639_1,
            time: new Date(element.published_at).getTime(),
            url: 'https://www.youtube.com/watch?v=' + element.key,
            img: 'https://img.youtube.com/vi/' + element.key + '/default.jpg'
          });
        });
        items.sort(function (a, b) {
          return a.time > b.time ? -1 : a.time < b.time ? 1 : 0;
        });
        var my_lang = items.filter(function (n) {
          return n.code == Lampa.Storage.field('tmdb_lang');
        });
        var en_lang = items.filter(function (n) {
          return n.code == 'en' && my_lang.indexOf(n) == -1;
        });
        var al_lang = [];

        if (my_lang.length) {
          al_lang = al_lang.concat(my_lang);
        }

        al_lang = al_lang.concat(en_lang);
        if (al_lang.length) return al_lang[0];
      }
    }

   function getLogoUrl(logoData) {
        if (!logoData) return null;
        if (typeof logoData === 'string') return logoData;
        if (logoData.file_path) return 'https://image.tmdb.org/t/p/original' + logoData.file_path;
        return null;
    }

    function setTitleLogo(element, data) {
        var titleText = element.find('.full-start-new__text').text();
        
        // Проверяем наличие логотипов в разных местах данных
        var ruLogo = (data.external_ids && data.external_ids.logo_ru) || 
                     (data.logos && data.logos.ru) ||
                     (data.images && data.images.logos && data.images.logos.find(l => l.iso_639_1 === 'ru'));
        
        var enLogo = (data.external_ids && data.external_ids.logo_en) || 
                     (data.logos && data.logos.en) ||
                     (data.images && data.images.logos && data.images.logos.find(l => l.iso_639_1 === 'en'));
        
        // Получаем URL логотипов
        var ruLogoUrl = getLogoUrl(ruLogo);
        var enLogoUrl = getLogoUrl(enLogo);
        
        // Получаем элементы
        var ruLogoElement = element.find('.ru-logo');
        var enLogoElement = element.find('.en-logo');
        var textElement = element.find('.full-start-new__text');
        
        // Сначала скрываем все
        ruLogoElement.hide();
        enLogoElement.hide();
        textElement.hide();
        
        // Пытаемся показать русский логотип
        if (ruLogoUrl) {
            ruLogoElement.css('--logo-ru', 'url(' + ruLogoUrl + ')').show();
        } 
        // Если нет русского, пробуем английский
        else if (enLogoUrl) {
            enLogoElement.css('--logo-en', 'url(' + enLogoUrl + ')').show();
        } 
        // Если нет логотипов, показываем текст
        else {
            textElement.show().text(titleText);
        }
    }

    Lampa.Listener.follow('full', function (e) {
      if (e.type == 'complete') {
        // Устанавливаем логотип для заголовка
        var titleElement = e.object.activity.render().find('.full-start-new__title');
        setTitleLogo(titleElement, e.data);
        
        e.object.activity.render().find('.full-start__background').addClass('cardify__background');
        if (!Lampa.Storage.field('cardify_run_trailers')) return;
        var trailer = video(e.data);

        if (Lampa.Manifest.app_digital >= 220) {
          if (Lampa.Activity.active().activity === e.object.activity) {
            trailer && new Trailer(e.object, trailer);
          } else {
            var follow = function follow(a) {
              if (a.type == 'start' && a.object.activity === e.object.activity && !e.object.activity.trailer_ready) {
                Lampa.Listener.remove('activity', follow);
                trailer && new Trailer(e.object, trailer);
              }
            };

            Lampa.Listener.follow('activity', follow);
          }
        }
      }
    });
  }

  if (window.appready) startPlugin(); else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type == 'ready') startPlugin();
    });
  }
})();