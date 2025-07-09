(function () {
  'use strict';

  // Вспомогательные функции для работы с классами (из Babel или подобного транспайлера)
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

  // Вспомогательные функции для работы с массивами и итерируемыми объектами
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
            if (i >= o.length) return { done: true };
            return { done: false, value: o[i++] };
          },
          e: function (e) { throw e; },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () { it = it.call(o); },
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

  /**
   * Класс State для управления состояниями
   * @param {Object} object - Объект с состоянием и переходами
   */
  function State(object) {
    this.state = object.state;

    // Запуск начального состояния
    this.start = function () {
      this.dispath(this.state);
    };

    // Обработка перехода между состояниями
    this.dispath = function (action_name) {
      var action = object.transitions[action_name];
      if (action) {
        action.call(this, this);
      } else {
        console.log('invalid action');
      }
    };
  }

  /**
   * Основная функция инициализации плагина
   */
  function startPlugin() {
    // Проверка платформы (работает только на TV)
    if (!Lampa.Platform.screen('tv')) return console.log('Cardify', 'no tv');
    
    // Добавление нового шаблона для карточки
    Lampa.Template.add('full_start_new', `
      <div class="full-start-new cardify">
        <div class="full-start-new__body">
            <div class="full-start-new__left hide">
                <div class="full-start-new__poster">
                    <img class="full-start__background" />
                </div>
            </div>

            <div class="full-start-new__right">
                <div class="cardify__left">
                    <div class="full-start-new__head"></div>
                    <div class="full-start-new__title">{title}</div>

                    <div class="cardify__details">
                        <div class="full-start-new__details"></div>
                    </div>

                    <div class="full-start-new__buttons">
                        <div class="full-start__button selector view--online lampac--button">
                            <svg viewBox="4.636 0 251.364 255.006" width="50px" height="50px" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><g transform="scale(5.12,5.12)"><path d="M 7.338 0.903 C 5.314 0.903 3.953 2.364 3.953 4.538 L 3.953 45.266 C 3.953 47.441 5.314 48.903 7.338 48.903 C 8.446 48.903 9.191 48.604 9.965 48.157 L 44.723 28.264 C 45.274 27.946 46.953 26.981 46.953 24.903 C 46.953 22.823 45.275 21.858 44.723 21.54 L 9.969 1.649 C 9.191 1.201 8.446 0.903 7.338 0.903 Z" fill="currentColor"></path></g></g>
							</svg>
                            <span>#{title_online}</span>
                        </div>

                        <div class="full-start__button selector button--book">
                            <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>
                            </svg>
                            <span>#{settings_input_links}</span>
                        </div>

                        <div class="full-start__button selector button--reaction hide">
                            <svg width="38" height="34" viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M37.208 10.9742C37.1364 10.8013 37.0314 10.6441 36.899 10.5117C36.7666 10.3794 36.6095 10.2744 36.4365 10.2028L12.0658 0.108375C11.7166 -0.0361828 11.3242 -0.0361227 10.9749 0.108542C10.6257 0.253206 10.3482 0.530634 10.2034 0.879836L0.108666 25.2507C0.0369593 25.4236 3.37953e-05 25.609 2.3187e-08 25.7962C-3.37489e-05 25.9834 0.0368249 26.1688 0.108469 26.3418C0.180114 26.5147 0.28514 26.6719 0.417545 26.8042C0.54995 26.9366 0.707139 27.0416 0.880127 27.1131L17.2452 33.8917C17.5945 34.0361 17.9869 34.0361 18.3362 33.8917L29.6574 29.2017C29.8304 29.1301 29.9875 29.0251 30.1199 28.8928C30.2523 28.7604 30.3573 28.6032 30.4289 28.4303L37.2078 12.065C37.2795 11.8921 37.3164 11.7068 37.3164 11.5196C37.3165 11.3325 37.2796 11.1471 37.208 10.9742ZM20.425 29.9407L21.8784 26.4316L25.3873 27.885L20.425 29.9407ZM28.3407 26.0222L21.6524 23.252C21.3031 23.1075 20.9107 23.1076 20.5615 23.2523C20.2123 23.3969 19.9348 23.6743 19.79 24.0235L17.0194 30.7123L3.28783 25.0247L12.2918 3.28773L34.0286 12.2912L28.3407 26.0222Z" fill="currentColor"/>
                                <path d="M25.3493 16.976L24.258 14.3423L16.959 17.3666L15.7196 14.375L13.0859 15.4659L15.4161 21.0916L25.3493 16.976Z" fill="currentColor"/>
                            </svg>                
                            <span>#{title_reactions}</span>
                        </div>

                        <div class="full-start__button selector button--subscribe hide" style="display: none">
                            <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"/>
                            <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5"/>
                            </svg>
                            <span>#{title_subscribe}</span>
                        </div>

                        <div class="full-start__button selector button--options hide">
                            <svg width="38" height="10" viewBox="0 0 38 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="4.88968" cy="4.98563" r="4.75394" fill="currentColor"/>
                                <circle cx="18.9746" cy="4.98563" r="4.75394" fill="currentColor"/>
                                <circle cx="33.0596" cy="4.98563" r="4.75394" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="cardify__right">
                    <div class="full-start-new__rate-line">
                        <div class="full-start-new__reactions selector">
                            <div>#{reactions_none}</div>
                        </div>
                        <div class="full-start__rate rate--tmdb"><div>{rating}</div><div class="source--name">TMDB</div></div>
                        <div class="full-start__rate rate--imdb hide" style="display: none"><div></div><div>IMDB</div></div>
                        <div class="full-start__rate rate--kp hide" style="display: none"><div></div><div>KP</div></div>
                        <div class="full-start__pg hide"></div>
                        <div class="full-start__status hide"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="hide buttons--container">
            <div class="full-start__button view--torrent hide">
                <svg viewBox="4.636 0 251.364 255.006" width="50px" height="50px" xmlns="http://www.w3.org/2000/svg">
						<g fill="currentColor">
							<g transform="scale(5.12,5.12)">
								<path d="M 7.338 0.903 C 5.314 0.903 3.953 2.364 3.953 4.538 L 3.953 45.266 C 3.953 47.441 5.314 48.903 7.338 48.903 C 8.446 48.903 9.191 48.604 9.965 48.157 L 44.723 28.264 C 45.274 27.946 46.953 26.981 46.953 24.903 C 46.953 22.823 45.275 21.858 44.723 21.54 L 42.156 20.065 C 39.854 12.468 32.795 6.923 24.453 6.923 C 22.956 6.923 21.508 7.121 20.113 7.458 L 9.969 1.649 C 9.191 1.201 8.446 0.903 7.338 0.903 Z M 24.453 8.923 C 33.578 8.923 40.953 16.298 40.953 25.423 C 40.953 26.396 40.849 27.342 40.687 28.268 L 18.662 40.876 C 12.409 38.532 7.953 32.506 7.953 25.423 C 7.953 16.298 15.328 8.923 24.453 8.923 Z" style="fill: currentColor;"></path>
								<path d="M 24.532 13.457 C 18.013 13.457 12.708 18.838 12.708 25.452 C 12.708 32.068 18.013 37.449 24.532 37.449 C 31.053 37.449 36.358 32.068 36.358 25.452 C 36.358 18.838 31.053 13.457 24.532 13.457 Z M 32.503 28.562 C 30.91 28.562 29.982 27.312 29.982 27.312 C 29.982 27.312 29.212 30.668 25.564 30.668 C 24.84 30.668 23.711 30.231 23.711 30.231 L 25.856 35.261 C 25.423 35.321 24.982 35.363 24.532 35.363 C 23.424 35.363 22.362 35.165 21.368 34.819 L 16.428 21.199 C 16.428 21.199 16.07 20.575 16.635 20.418 C 17.199 20.266 19.408 19.792 19.408 19.792 C 19.408 19.792 20.168 19.538 20.335 20.055 C 20.592 20.734 22.422 25.85 22.422 25.85 C 22.422 25.85 23.298 27.538 25.769 27.538 C 28.183 27.538 28.799 25.748 28.698 25.484 C 28.081 23.919 26.129 19.301 26.129 19.301 C 26.129 19.301 25.824 18.725 26.541 18.57 C 27.262 18.41 28.494 18.202 28.494 18.202 C 28.494 18.202 29.064 18.119 29.318 18.622 C 29.696 19.369 31.987 24.494 31.987 24.494 C 31.987 24.494 32.553 26.007 33.683 26.007 C 33.923 26.007 34.113 25.983 34.276 25.951 C 34.236 26.806 34.098 27.631 33.856 28.414 C 33.551 28.514 33.148 28.562 32.503 28.562 Z" style="transform-box: fill-box; transform-origin: 50% 50%; fill: currentColor;" transform="matrix(1, 0.000001, -0.000001, 1, 0, 0)"></path>
							</g>
						</g>
					</svg>
                <span>#{full_torrents}</span>
            </div>
        </div>
    </div>`);
    
    // Добавление CSS стилей для карточки
    var style = `
        <style>
        .cardify{-webkit-transition:all .3s;-o-transition:all .3s;-moz-transition:all .3s;transition:all .3s} .full-start-new__rate-line .full-start__pg {font-size: 0.9em;} .full-start__background {height:109% !important;left:0em !important;top:-9.2% !important;} .full-start__pg, .full-start__status { font-size: 0.9em; } .full-start__background{mask-size:110%100%;} .full-start-new__title {margin-bottom:0.2em;margin-top:0.1em;-webkit-line-clamp:4;line-height:1;max-width:12em;font-weight:800;text-transform:uppercase;text-shadow:2px 3px 1px #00000040;letter-spacing:-2px; aletter-spacing:2px;word-spacing:5px;font-size:3em;} .full-start-new__title {margin-top: 0.1em;} .full-start-new__head {font-size: 1.1em;} .full-start-new__title.twolines {-webkit-line-clamp: 4; max-width: 12em; margin-top: 0.1em; text-shadow: 2px 3px 1px #00000040; margin-bottom: 0.2em; line-height: 1; font-size: 3em; word-spacing: 5px; letter-spacing: -2px; text-transform: uppercase;}  .full-start-new__reactions > div {padding: 0em;} .full-start__background.dim{opacity:0.2 !important;} .cardify .full-start-new__body{height:100%} .full-start__background.loaded{opacity: 0.6;} .rate--kinovod{display:none} .wrap__left {box-shadow: 15px 0px 20px 0px #1d1f20;} .cardify .full-start-new__right{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:end;-webkit-align-items:flex-end;-moz-box-align:end;-ms-flex-align:end;align-items:flex-end}.cardify .full-start-new__title{text-shadow: 2px 3px 1px #00000040;} .cardify__left{-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1}.cardify__right{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:flex-end;-moz-box-align:center;-ms-flex-align:center;align-items:flex-end;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;flex-direction:column;}.cardify__details{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.cardify .full-start-new__reactions{margin:0;margin-right:-2.8em}.cardify .full-start-new__reactions:not(.focus){margin:0;} .full-start-new__details{max-width:100%;} .full-start-new__details > span:nth-of-type(6) { visibility: hidden !important; position: absolute !important; left: -9999px !important; } .full-start-new__details > span:nth-of-type(7) { display: block; order: 2; opacity: 30%;} .full-start-new__details > span:nth-of-type(7) { margin-right: 21em; } .full-start-new__reactions {min-height: 0em;} .cardify .full-start-new__reactions:not(.focus)>div:not(:first-child){display:none}.cardify .full-start-new__reactions:not(.focus) .reaction{position:relative;background: rgba(0, 0, 0, 0.15);-webkit-border-radius: 0.3em;-moz-border-radius: 0.3em;border-radius: 0.3em;margin-left: 0.4em;} .reaction:not(.focus) {margin-left: 0.5em;padding: 0.5em !important;} .cardify .full-start-new__reactions:not(.focus) .reaction__count{padding: 0 0.1em !important;position:relative;top:28%;left:0%;font-size:1.1em;font-weight:500;} .reaction__count:not(.focus) {padding: 0 0.1em !important;font-weight: 500;} .reaction{position: relative;background: rgba(0, 0, 0, 0.15) !important;-webkit-border-radius: 0.3em !important;-moz-border-radius: 0.3em !important;border-radius: 0.3em !important;} .cardify .full-start-new__rate-line{margin:0;margin-left:0em}.cardify .full-start-new__rate-line>*:last-child{margin-right:0 !important}.cardify__background{left:0} .cardify__background.loaded:not(.dim){opacity:0.8} .reaction__icon {font-size: 0.75em;} .cardify__background.nodisplay{opacity:0 !important}.cardify.nodisplay{-webkit-transform:translate3d(0,50%,0);-moz-transform:translate3d(0,50%,0);transform:translate3d(0,50%,0);opacity:0}body:not(.menu--open) .cardify__background{-webkit-mask-image:-webkit-gradient(linear,left top,left bottom,color-stop(50%,white),to(rgba(255,255,255,0)));-webkit-mask-image:-webkit-linear-gradient(top,white 50%,rgba(255,255,255,0) 100%);mask-image:-webkit-gradient(linear,left top,left bottom,color-stop(50%,white),to(rgba(255,255,255,0)));mask-image:linear-gradient(to bottom,white 50%,rgba(255,255,255,0) 100%)}@-webkit-keyframes animation-full-background{0%{-webkit-transform:translate3d(0,-10%,0);transform:translate3d(0,-10%,0)}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@-moz-keyframes animation-full-background{0%{-moz-transform:translate3d(0,-10%,0);transform:translate3d(0,-10%,0)}100%{-moz-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@-o-keyframes animation-full-background{0%{transform:translate3d(0,-10%,0)}100%{transform:translate3d(0,0,0)}}@keyframes animation-full-background{0%{-webkit-transform:translate3d(0,0,0) !important;-moz-transform:translate3d(0,0,0) !important;transform:translate3d(0,0,0) !important}100%{-webkit-transform:translate3d(0,0,0);-moz-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@-webkit-keyframes animation-full-start-hide{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0);opacity:1}100%{-webkit-transform:translate3d(0,50%,0);transform:translate3d(0,50%,0);opacity:0}}@-moz-keyframes animation-full-start-hide{0%{-moz-transform:translate3d(0,0,0);transform:translate3d(0,0,0);opacity:1}100%{-moz-transform:translate3d(0,50%,0);transform:translate3d(0,50%,0);opacity:0}}@-o-keyframes animation-full-start-hide{0%{transform:translate3d(0,0,0);opacity:1}100%{transform:translate3d(0,50%,0);opacity:0}}@keyframes animation-full-start-hide{0%{-webkit-transform:translate3d(0,0,0);-moz-transform:translate3d(0,0,0);transform:translate3d(0,0,0);opacity:1}100%{-webkit-transform:translate3d(0,50%,0);-moz-transform:translate3d(0,50%,0);transform:translate3d(0,50%,0);opacity:0}}
        </style>
    `;
    Lampa.Template.add('cardify_css', style);
    
    // Добавление стилей в DOM
    $('body').append(Lampa.Template.get('cardify_css', {}, true));
    
    // SVG иконка (не используется в коде, но оставлена)
    var icon = `<svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1.5" y="1.5" width="33" height="25" rx="3.5" stroke="white" stroke-width="3"/>
        <rect x="5" y="14" width="17" height="4" rx="2" fill="white"/>
        <rect x="5" y="20" width="10" height="3" rx="1.5" fill="white"/>
        <rect x="25" y="20" width="6" height="3" rx="1.5" fill="white"/>
    </svg>`;
    
    // Слушатель событий для полной карточки
    Lampa.Listener.follow('full', function (e) {
      if (e.type == 'complete') {
        // Добавление класса к фону карточки
        e.object.activity.render().find('.full-start__background').addClass('cardify__background');
      }
    });
  }

  // Запуск плагина при готовности приложения
  if (window.appready) startPlugin();
  else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type == 'ready') startPlugin();
    });
  }
})();