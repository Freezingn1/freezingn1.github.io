(function () {
    'use strict';

    // Общие функции для всех плагинов
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
                        if (i >= o.length) return { done: true };
                        return { done: false, value: o[i++] };
                    },
                    e: function (e) { throw e; },
                    f: F
                };
            }
            throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }
        var normalCompletion = true, didErr = false, err;
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

    function State(object) {
        this.state = object.state;
        this.start = function () { this.dispath(this.state); };
        this.dispath = function (action_name) {
            var action = object.transitions[action_name];
            if (action) {
                action.call(this, this);
            } else {
                console.log('invalid action');
            }
        };
    }

    // ==================== Dark Theme Plugin ====================
    function applyDarkStyles() {
        console.log("[Lampa Uncensored] Applying dark styles");

        // Безопасное добавление стилей (сохраняет оригинальные свойства)
        function safeAddStyle(element, styles) {
            Object.keys(styles).forEach(property => {
                element.style.setProperty(property, styles[property], 'important');
            });
        }

        // Основная функция для применения стилей
        function applyStyles() {
            // 1. Тёмный фон для элементов интерфейса (без перезаписи других стилей)
            document.querySelectorAll('.selectbox__content, .layer--height, .selector__body, .modal-layer').forEach(el => {
                safeAddStyle(el, {
                    'background-color': '#121212'
                });
            });

            // 2. Полупрозрачный фон для папки закладок
            const bookmarkFolder = document.querySelector('.bookmarks-folder__layer');
            if (bookmarkFolder) {
                safeAddStyle(bookmarkFolder, {
                    'background': 'rgba(0, 0, 0, 0.3)'
                });
            }
        }

        // Добавляем CSS для карточек (разово, через <style>)
        function addCardStyles() {
            const styleId = 'lampa-uncensored-dark-css';
            if (document.getElementById(styleId)) return;

            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                /* Красная рамка для карточек */
                .card.focus .card__view::after,
                .card.hover .card__view::after {
                    content: "";
                    position: absolute;
                    top: -0.3em;
                    left: -0.3em;
                    right: -0.3em;
                    bottom: -0.3em;
                    border: 0.3em solid #c22222;
                    border-radius: 1.4em;
                    z-index: -1;
                    pointer-events: none;
                    background-color: #c22222;
                }
                
                .settings-param.focus {
                    background-color: #c22222;
                    color: #fff;
                }
                
                .simple-button.focus {
                    background-color: #c22222;
                    color: #fff;
                }
                
                .torrent-serial.focus {
                    background-color: #c22222;
                }
                
                .torrent-file.focus {
                    background-color: #c22222;
                }
                
                .torrent-item.focus::after {
                    content: "";
                    position: absolute;
                    top: -0.5em;
                    left: -0.5em;
                    right: -0.5em;
                    bottom: -0.5em;
                    border: 0.3em solid #c22222;
                    background-color: #c22222;
                    -webkit-border-radius: 0.7em;
                    border-radius: 0.7em;
                    z-index: -1;
                }
                
                .explorer__left {
                    display: none;
                }
                
                .explorer__files {
                    width: 100%;
                }		
                
                .tag-count.focus {
                    background-color: #c22222;
                    color: #fff;
                }

                .full-person.focus {
                    background-color: #c22222;
                    color: #fff;
                }

                .full-review.focus {
                    background-color: #c22222;
                    color: #fff;
                }
                
                .menu__item.focus, .menu__item.traverse, .menu__item.hover {
                    background: #c22222;
                    color: #fff;
                }
                
                .menu__item.focus .menu__ico path[fill], .menu__item.focus .menu__ico rect[fill], .menu__item.focus .menu__ico circle[fill], .menu__item.traverse .menu__ico path[fill], .menu__item.traverse .menu__ico rect[fill], .menu__item.traverse .menu__ico circle[fill], .menu__item.hover .menu__ico path[fill], .menu__item.hover .menu__ico rect[fill], .menu__item.hover .menu__ico circle[fill] {
                    fill: #ffffff;
                }
                
                .online.focus {
                    -webkit-box-shadow: 0 0 0 0.2em #c22222;
                    -moz-box-shadow: 0 0 0 0.2em #c22222;
                    box-shadow: 0 0 0 0.2em #c22222;
                    background: #871818;
                }
                
                .menu__item.focus .menu__ico [stroke], .menu__item.traverse .menu__ico [stroke], .menu__item.hover .menu__ico [stroke] {
                    stroke: #ffffff;
                }
                
                .head__actions {
                    opacity: 0.80;
                }
                
                .head__title {
                    opacity: 0.80;
                }
                
                .noty {
                    background: #c22222;
                    color: #ffffff;
                }
                
                /* Цвет иконок правый угол */
                .head__action.focus {
                    background-color: #c22222;
                    color: #fff;
                }
                .selector:hover {
                    opacity: 0.8;
                }
                
                .online-prestige.focus::after {
                    border: solid .3em #c22222 !important;
                    background-color: #871818;
                }
                
                .full-episode.focus::after {
                    border: 0.3em solid #c22222;
                }
                
                .modal__content {
                    background-color: #1e1e1e;
                }			
                
                .card-more.focus .card-more__box::after {
                    border: 0.3em solid #c22222;
                }

                .new-interface .card.card--wide+.card-more .card-more__box {
                    background: rgba(0, 0, 0, 0.3);
                }
                
                .helper {
                    background: #c22222;
                }
                
                .extensions__item {
                    background-color: #181818;
                }

                .extensions__item.focus:after {
                    border: 0.3em solid #c22222;
                }

                .extensions__block-add {
                    background-color: #181818;
                }
                
                .settings-input--free {
                    background-color: #121212;
                }

                .settings-input__content {
                    background: #121212;
                }
                
                .extensions {
                    background-color: #121212;
                }
                
                .modal__content {
                    background-color: #121212;
                }
                
                .extensions__block-empty.focus:after, .extensions__block-add.focus:after {
                    border: 0.3em solid #c22222;
                }
                
                /* Градиентный текст для рейтинга */
                .full-start__rate > div:first-child {
                    background: -webkit-linear-gradient(66.47deg, rgb(192, 254, 207) -15.94%, rgb(30, 213, 169) 62.41%);
                    -webkit-background-clip: text;
                    color: transparent;
                    font-weight: bold;
                }         
                
                /* Стили для рейтинга на карточке */
                .card__vote {
                    position: absolute;
                    top: 0;
                    right: 0em;
                    background: #c22222;
                    color: #ffffff;
                    font-size: 1.5em;
                    font-weight: 700;
                    padding: 0.5em;
                    -webkit-border-radius: 0em 0.5em 0em 0.5em;
                    display: -webkit-box;
                    display: -webkit-flex;
                    display: -ms-flexbox;
                    display: flex;
                    -webkit-box-orient: vertical;
                    -webkit-box-direction: normal;
                    -webkit-flex-direction: column;
                    -ms-flex-direction: column;
                    flex-direction: column;
                    -webkit-box-align: center;
                    -webkit-align-items: center;
                    -ms-flex-align: center;
                    align-items: center;
                    border-radius: 0em 0.5em 0em 0.5em;
                    bottom: auto;
                }
                
                /* Анимация для кнопки в фокусе */
                @keyframes gradientAnimation {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
                
                .full-start__button.focus {
                    background: #c22222;
                    color: white;
                    background-size: 200% 200%;
                    animation: gradientAnimation 5s ease infinite;
                }
                
                /* Стиль для элемента selectbox в фокусе */
                .selectbox-item.focus {
                    background-color: #c22222;
                    color: #fff;
                }
                
                /* Стиль для папки настроек в фокусе */
                .settings-folder.focus {
                    background-color: #c22222;
                    color: #fff;
                }
            `;
            document.head.appendChild(style);
        }

        // Первое применение
        applyStyles();
        addCardStyles();

        // Более безопасный интервал проверки (реже и с проверкой видимости)
        let isApplying = false;
        const interval = setInterval(() => {
            if (!isApplying) {
                isApplying = true;
                applyStyles();
                isApplying = false;
            }
        }, 3000); // Проверяем реже (каждые 3 секунды)

        // Функция остановки
        window.stopLampaUncensoredDarkStyles = () => {
            clearInterval(interval);
            const style = document.getElementById('lampa-uncensored-dark-css');
            if (style) style.remove();
            
            // Восстанавливаем оригинальные стили
            document.querySelectorAll('.selectbox__content, .layer--height, .selector__body, .modal-layer, .bookmarks-folder__layer').forEach(el => {
                el.style.removeProperty('background-color');
                el.style.removeProperty('background');
            });
            
            console.log("[Lampa Uncensored] Dark styles stopped");
        };
    }

    // ==================== Cardify Plugin ====================
    function startCardify() {
        if (!Lampa.Platform.screen('tv')) return console.log('Cardify', 'no tv');
        
        Lampa.Template.add('full_start_new', `<div class="full-start-new cardify">
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
                            <div class="full-start__button selector button--play">
                                <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>
                                    <path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>
                                </svg>

                                <span>#{title_watch}</span>
                            </div>

                            <div class="full-start__button selector button--book">
                                <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>
                                </svg>

                                <span>#{settings_input_links}</span>
                            </div>

                            <div class="full-start__button selector button--reaction">
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

                            <div class="full-start__button selector button--options">
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
                <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 50 50" width="50px" height="50px">
                    <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/>
                </svg>

                <span>#{full_torrents}</span>
            </div>
        </div>
    </div>`);
        
        var style = `
        <style>
        .cardify{-webkit-transition:all .3s;-o-transition:all .3s;-moz-transition:all .3s;transition:all .3s} .full-start-new__rate-line .full-start__pg {font-size: 0.9em;} .full-start__background {height:109% !important;left:0em !important;top:-9.2% !important;} .full-start__background{mask-size:110%100%;} .full-start-new__title {margin-bottom:0.2em;margin-top:0.1em;-webkit-line-clamp:4;line-height:1;max-width:12em;font-weight:800;text-transform:uppercase;text-shadow:2px 3px 1px #00000040;letter-spacing:-2px; aletter-spacing:2px;word-spacing:5px;font-size:3em;} .full-start-new__title {margin-top: 0.1em;} .full-start-new__head {font-size: 1.1em;} .full-start-new__title.twolines {-webkit-line-clamp: 4; max-width: 12em; margin-top: 0.1em; text-shadow: 2px 3px 1px #00000040; margin-bottom: 0.2em; line-height: 1; font-size: 3em; word-spacing: 5px; letter-spacing: -2px; text-transform: uppercase;} body.menu--open:not(.light--version) .wrap__left {box-shadow: 20px 0px 20px 0px #121212;} .full-start__background.dim{opacity:0.2 !important;} .cardify .full-start-new__body{height:80vh} .full-start__background.loaded{opacity: 0.8;} .cardify .full-start-new__right{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:end;-webkit-align-items:flex-end;-moz-box-align:end;-ms-flex-align:end;align-items:flex-end}.cardify .full-start-new__title{text-shadow: 2px 3px 1px #00000040;} .cardify__left{-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1}.cardify__right{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:flex-end;-moz-box-align:center;-ms-flex-align:center;align-items:flex-end;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;flex-direction:column;}.cardify__details{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.cardify .full-start-new__reactions{margin:0;margin-right:-2.8em}.cardify .full-start-new__reactions:not(.focus){margin:0;} .full-start-new__details{max-width:100%;}  .cardify .full-start-new__reactions:not(.focus)>div:not(:first-child){display:none}.cardify .full-start-new__reactions:not(.focus) .reaction{position:relative;background: rgba(0, 0, 0, 0.15);-webkit-border-radius: 0.3em;-moz-border-radius: 0.3em;border-radius: 0.3em;}.cardify .full-start-new__reactions:not(.focus) .reaction__count{position:relative;top:28%;left:0%;font-size:1.1em;font-weight:500;} .reaction{position: relative;background: rgba(0, 0, 0, 0.15) !important;-webkit-border-radius: 0.3em !important;-moz-border-radius: 0.3em !important;border-radius: 0.3em !important;} .cardify .full-start-new__rate-line{margin:0;margin-left:3.5em}.cardify .full-start-new__rate-line>*:last-child{margin-right:0 !important}.cardify__background{left:0} .full-start-new__details > span:nth-of-type(6), .full-start-new__details > span:nth-of-type(7) { visibility: hidden !important; position: absolute !important; left: -9999px !important; } .cardify__background.loaded:not(.dim){opacity:0.8} .reaction__icon {font-size: 0.75em;} .cardify__background.nodisplay{opacity:0 !important}.cardify.nodisplay{-webkit-transform:translate3d(0,50%,0);-moz-transform:translate3d(0,50%,0);transform:translate3d(0,50%,0);opacity:0}body:not(.menu--open) .cardify__background{-webkit-mask-image:-webkit-gradient(linear,left top,left bottom,color-stop(50%,white),to(rgba(255,255,255,0)));-webkit-mask-image:-webkit-linear-gradient(top,white 50%,rgba(255,255,255,0) 100%);mask-image:-webkit-gradient(linear,left top,left bottom,color-stop(50%,white),to(rgba(255,255,255,0)));mask-image:linear-gradient(to bottom,white 50%,rgba(255,255,255,0) 100%)}@-webkit-keyframes animation-full-background{0%{-webkit-transform:translate3d(0,-10%,0);transform:translate3d(0,-10%,0)}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@-moz-keyframes animation-full-background{0%{-moz-transform:translate3d(0,-10%,0);transform:translate3d(0,-10%,0)}100%{-moz-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@-o-keyframes animation-full-background{0%{transform:translate3d(0,-10%,0)}100%{transform:translate3d(0,0,0)}}@keyframes animation-full-background{0%{-webkit-transform:translate3d(0,-10%,0);-moz-transform:translate3d(0,-10%,0);transform:translate3d(0,-10%,0)}100%{-webkit-transform:translate3d(0,0,0);-moz-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@-webkit-keyframes animation-full-start-hide{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0);opacity:1}100%{-webkit-transform:translate3d(0,50%,0);transform:translate3d(0,50%,0);opacity:0}}@-moz-keyframes animation-full-start-hide{0%{-moz-transform:translate3d(0,0,0);transform:translate3d(0,0,0);opacity:1}100%{-moz-transform:translate3d(0,50%,0);transform:translate3d(0,50%,0);opacity:0}}@-o-keyframes animation-full-start-hide{0%{transform:translate3d(0,0,0);opacity:1}100%{transform:translate3d(0,50%,0);opacity:0}}@keyframes animation-full-start-hide{0%{-webkit-transform:translate3d(0,0,0);-moz-transform:translate3d(0,0,0);transform:translate3d(0,0,0);opacity:1}100%{-webkit-transform:translate3d(0,50%,0);-moz-transform:translate3d(0,50%,0);transform:translate3d(0,50%,0);opacity:0}}
        </style>
    `;
        Lampa.Template.add('cardify_css', style);
        $('body').append(Lampa.Template.get('cardify_css', {}, true));
        
        var icon = `<svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1.5" y="1.5" width="33" height="25" rx="3.5" stroke="white" stroke-width="3"/>
        <rect x="5" y="14" width="17" height="4" rx="2" fill="white"/>
        <rect x="5" y="20" width="10" height="3" rx="1.5" fill="white"/>
        <rect x="25" y="20" width="6" height="3" rx="1.5" fill="white"/>
    </svg>`;
        
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complete') {
                e.object.activity.render().find('.full-start__background').addClass('cardify__background');
            }
        });
    }

    // ==================== Logo Plugin ====================
    function startLogoPlugin() {
        if (!window.logoplugin) {
            window.logoplugin = true;

            const TMDB_API_KEY = "4ef0d7355d9ffb5151e987764708ce96";
            const TMDB_API_URL = "https://api.themoviedb.org/3";
            const titleCache = new Map();

            // Настройки логотипов
            Lampa.SettingsApi.addParam({
                component: "interface",
                param: {
                    name: "logo_glav",
                    type: "select",
                    values: { 
                        "show_all": "Все логотипы", 
                        "ru_only": "Только русские", 
                        "hide": "Скрыть логотипы"
                    },
                    default: "show_all"
                },
                field: {
                    name: "Настройки логотипов в карточке",
                    description: "Управление отображением логотипов вместо названий"
                }
            });

            // Настройки русских названий
            Lampa.SettingsApi.addParam({
                component: "interface",
                param: {
                    name: "russian_titles_settings",
                    type: "select",
                    values: {
                        "show_when_no_ru_logo": "Показывать, если нет русского логотипа",
                        "show_never": "Никогда не показывать",
                        "show_always": "Показывать всегда (если доступно)"
                    },
                    default: "show_when_no_ru_logo"
                },
                field: {
                    name: "Настройки русских названий",
                    description: "Управление отображением русских названий"
                }
            });

            // Функция для выбора лучшего логотипа
            function getBestLogo(logos, setting) {
                if (!logos || !logos.length) return null;

                let filteredLogos = [...logos];
                
                if (setting === "ru_only") {
                    filteredLogos = filteredLogos.filter(l => l.iso_639_1 === 'ru');
                }

                if (!filteredLogos.length) return null;

                // Сортируем: русские -> английские -> другие, затем по рейтингу
                return filteredLogos.sort((a, b) => {
                    const langPriority = {
                        'ru': 3,
                        'en': 2,
                        'null': 1,
                        'undefined': 0
                    };
                    
                    const aPriority = langPriority[a.iso_639_1] || 0;
                    const bPriority = langPriority[b.iso_639_1] || 0;
                    
                    if (aPriority !== bPriority) return bPriority - aPriority;
                    return (b.vote_average || 0) - (a.vote_average || 0);
                })[0];
            }

            // Получение русского названия
            async function fetchRussianTitle(card) {
                try {
                    if (titleCache.has(card.id)) return titleCache.get(card.id);

                    const mediaType = card.first_air_date ? 'tv' : 'movie';
                    const url = `${TMDB_API_URL}/${mediaType}/${card.id}?language=ru-RU&api_key=${TMDB_API_KEY}`;

                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                    const data = await response.json();
                    const russianTitle = data.title || data.name;

                    if (russianTitle) {
                        titleCache.set(card.id, russianTitle);
                        return russianTitle;
                    }
                } catch (error) {
                    console.error("Ошибка при получении русского названия:", error);
                }
                return null;
            }

            // Обработка полной страницы
            Lampa.Listener.follow("full", function(event) {
                if (event.type !== "complite") return;
                if (!event.object || !event.object.activity || !event.object.activity.render) return;
                
                try {
                    const movie = event.data.movie;
                    if (!movie) return;
                    
                    const render = event.object.activity.render();
                    if (!render || !render.find) return;
                    
                    const titleElement = render.find(".full-start-new__title");
                    if (!titleElement || !titleElement.length) return;
                    
                    const originalTitle = movie.title || movie.name;
                    if (!originalTitle) return;
                    
                    const isAnime = movie.genres?.some(g => g.name.toLowerCase().includes("аниме")) 
                                    || /аниме|anime/i.test(originalTitle);
                    const logoSetting = Lampa.Storage.get("logo_glav") || "show_all";
                    const russianTitleSetting = Lampa.Storage.get("russian_titles_settings") || "show_when_no_ru_logo";

                    // Удаляем предыдущие русские названия
                    render.find('.ru-title-full').remove();

                    // Режим "Скрыть логотипы" - показываем только оригинальное название
                    if (logoSetting === "hide") {
                        showTextTitle();
                        if (russianTitleSetting === "show_always") {
                            showRussianTitle();
                        }
                        return;
                    }

                    // Очищаем заголовок перед загрузкой
                    titleElement.empty();

                    // Загружаем все логотипы
                    const tmdbUrl = Lampa.TMDB.api(movie.name ? "tv" : "movie") + `/${movie.id}/images?api_key=${Lampa.TMDB.key()}`;

                    $.get(tmdbUrl, function(data) {
                        const logos = data.logos || [];
                        const logo = getBestLogo(logos, logoSetting);

                        if (logo?.file_path) {
                            // Показываем логотип
                            const imageUrl = Lampa.TMDB.image("/t/p/w500" + logo.file_path);
                            titleElement.html(`<img style="margin-top: 0.2em; margin-bottom: 0.1em; max-width: 9em; max-height: 4em;" src="${imageUrl}" />`);
                            
                            // Показываем русское название в зависимости от настроек
                            if (russianTitleSetting === "show_always" || 
                                (russianTitleSetting === "show_when_no_ru_logo" && logo.iso_639_1 !== "ru")) {
                                showRussianTitle();
                            }
                        } else {
                            // Если логотипов нет вообще
                            showTextTitle();
                            if (russianTitleSetting === "show_always") {
                                showRussianTitle();
                            }
                        }
                    }).fail(() => {
                        console.error("Ошибка загрузки логотипов из TMDB");
                        showTextTitle();
                    });

                    function showRussianTitle() {
                        fetchRussianTitle(movie).then(title => {
                            if (title && render && render.find) {
                                const rateLine = render.find(".full-start-new__rate-line").first();
                                if (rateLine && rateLine.length) {
                                    rateLine.before(`
                                        <div class="ru-title-full" style="color: #ffffff; font-weight: 500; text-align: right; margin-bottom: 10px; opacity: 0.80; max-width: 15em;text-shadow: 1px 1px 0px #00000059;">
                                            RU: ${title}
                                        </div>
                                    `);
                                }
                            }
                        });
                    }

                    function showTextTitle() {
                        if (isAnime) {
                            titleElement.html(`<span style="font-family: 'Anime Ace', sans-serif; color: #ff6b6b;">${originalTitle}</span>`);
                        } else {
                            titleElement.text(originalTitle);
                        }
                    }
                } catch (error) {
                    console.error("Ошибка в обработчике full:", error);
                }
            });

            // Добавляем стили
            const style = document.createElement('style');
            style.textContent = `
                .ru-title-full {
                    transition: opacity 0.3s ease;
                }
                .ru-title-full:hover {
                    opacity: 1 !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ==================== New Interface Plugin ====================
    function startNewInterface() {
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

        Lampa.SettingsApi.addParam({
            component: "interface",
            param: {
                name: "logo_glav2",
                type: "select",
                values: { 
                    "show_all": "Все логотипы", 
                    "ru_only": "Только русские", 
                    "hide": "Скрыть логотипы"
                },
                default: "show_all"
            },
            field: {
                name: "Настройки логотипов на главной",
                description: "Управление отображением логотипов вместо названий"
            }
        }); 

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'new_interface_show_genres',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Показывать жанры',
                description: 'Отображать жанры фильмов/сериалов'
            }
        });

        Lampa.Template.add('new_interface_style', `
            <style>
            .new-interface .card--small.card--wide {
                width: 18.3em;
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
                margin-bottom: 0em;
                overflow: hidden;
                -o-text-overflow: ".";
                text-overflow: ".";
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
            
            .full-start__pg, .full-start__status {
                font-size: 0.9em;
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
                font-size: 1.2em;
                font-weight: 300;
                line-height: 1.5;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 4;
                line-clamp: 4;
                -webkit-box-orient: vertical;
                width: 70%;
            }
            
            .new-interface .full-start__background {
                opacity: 0.7 !important;
            }
            
            .new-interface .full-start__background {
                height:109% !important;
                left:0em !important;
                top:-9.2% !important;
            }
            
            .new-interface .full-start__rate {
                font-size: 1.3em;
                margin-right: 0;
            }
            
            /* Полное удаление card__promo */
            .new-interface .card__promo,
            .new-interface .card .card__promo {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                opacity: 0 !important;
            }
            
            .new-interface .card-more__box {
                padding-bottom: 95%;
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
            
            background_last = new_background;
            background_img.removeClass('loaded');
            
            background_img[0].onload = function () {
                background_img.addClass('loaded');
            };
            
            background_img[0].onerror = function () {
                background_img.removeClass('loaded');
            };
            
            background_img[0].src = background_last;
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

    function create() {
        var html;
        var timer;
        var network = new Lampa.Reguest();
        var loaded = {};
        var logoCache = {}; // Кэш для логотипов

        this.create = function () {
            html = $("<div class=\"new-interface-info\">\n            <div class=\"new-interface-info__body\">\n                <div class=\"new-interface-info__head\"></div>\n                <div class=\"new-interface-info__title\"></div>\n                <div class=\"new-interface-info__details\"></div>\n                <div class=\"new-interface-info__description\"></div>\n            </div>\n        </div>");
        };

        this.update = function (data) {
            // Проверяем, что html элемент существует
            if (!html) {
                console.error('HTML element is not initialized');
                return;
            }

            const logoSetting = Lampa.Storage.get('logo_glav2') || 'show_all';
            
            if (logoSetting !== 'hide') {
                const type = data.name ? 'tv' : 'movie';
                const cacheKey = `${type}_${data.id}`;
                
                // Проверяем кэш
                if (logoCache[cacheKey]) {
                    this.applyLogo(data, logoCache[cacheKey]);
                    return;
                }
                
                const url = Lampa.TMDB.api(type + '/' + data.id + '/images?api_key=' + Lampa.TMDB.key());

                network.silent(url, (images) => {
                    // Дополнительная проверка html перед использованием
                    if (!html) return;

                    let bestLogo = null;
                    
                    if (images.logos && images.logos.length > 0) {
                        let bestRussianLogo = null;
                        let bestEnglishLogo = null;
                        let bestOtherLogo = null;

                        // Ищем лучшие логотипы по приоритету: русский -> английский -> любой другой
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

                        // Выбираем логотип по приоритету
                        bestLogo = bestRussianLogo || bestEnglishLogo || bestOtherLogo;

                        // Если настройка "Только русские" и русского лого нет - не показываем ничего
                        if (logoSetting === 'ru_only' && !bestRussianLogo) {
                            bestLogo = null;
                        }
                        
                        // Сохраняем в кэш
                        if (bestLogo) {
                            logoCache[cacheKey] = bestLogo;
                        }
                    }
                    
                    this.applyLogo(data, bestLogo);
                }, () => {
                    if (html) {
                        const titleElement = html.find('.new-interface-info__title');
                        if (titleElement.length) {
                            titleElement.text(data.title);
                        }
                    }
                });
            } else if (html) {
                const titleElement = html.find('.new-interface-info__title');
                if (titleElement.length) {
                    titleElement.text(data.title);
                }
            }

            if (html) {
                Lampa.Background.change(Lampa.Api.img(data.backdrop_path, 'w200'));
                this.load(data);
            }
        };
        
        this.applyLogo = function(data, logo) {
            if (!html) return;
            
            const titleElement = html.find('.new-interface-info__title');
            if (!titleElement.length) return;
            
            if (logo && logo.file_path) {
                const imageUrl = Lampa.TMDB.image("/t/p/w500" + logo.file_path.replace(".svg", ".png"));
                titleElement.html(
                    `<img style="margin-top:0.3em; margin-bottom:0.3em; max-width: 7em; max-height:3em;" 
                     src="${imageUrl}" 
                     alt="${data.title}" />`
                );
            } else {
                titleElement.text(data.title);
            }
        };

        this.draw = function (data) {
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
            
            // Check if genres should be shown
            if (Lampa.Storage.get('new_interface_show_genres') !== false && data.genres && data.genres.length > 0) {
                details.push(data.genres.map(function (item) {
                    return Lampa.Utils.capitalizeFirstLetter(item.name);
                }).join(' | '));
            }
            
            if (data.runtime) details.push(Lampa.Utils.secondsToTime(data.runtime * 60, true));
            if (pg) details.push('<span class="full-start__pg" style="font-size: 0.9em;">' + pg + '</span>');
            
            html.find('.new-interface-info__head').empty().append(head.join(', '));
            html.find('.new-interface-info__details').html(details.join('<span class="new-interface-info__split">&#9679;</span>'));
        };

        this.load = function (data) {
            var _this = this;

            clearTimeout(timer);
            var url = Lampa.TMDB.api((data.name ? 'tv' : 'movie') + '/' + data.id + '?api_key=' + Lampa.TMDB.key() + '&append_to_response=content_ratings,release_dates&language=' + Lampa.Storage.get('language'));
            if (loaded[url]) return this.draw(loaded[url]);
            timer = setTimeout(function () {
                network.clear();
                network.timeout(5000);
                network.silent(url, function (movie) {
                    loaded[url] = movie;

                    _this.draw(movie);
                });
            }, 600);
        };

        this.render = function () {
            return html;
        };

        this.empty = function () {};

        this.destroy = function () {
            html.remove();
            loaded = {};
            logoCache = {};
            html = null;
        };
    }

    // ==================== Main Initialization ====================
    function initializePlugins() {
        console.log("[Lampa Uncensored] Initializing plugins");
        
        // Запускаем все плагины
        applyDarkStyles();
        startLogoPlugin();
        
        if (!window.plugin_interface_ready) {
            startNewInterface();
        }
        
        if (window.appready) {
            startCardify();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') startCardify();
            });
        }
    }

    // Запускаем инициализацию при загрузке
    initializePlugins();
})();