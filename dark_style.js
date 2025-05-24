(function() {
    console.log("[Lampa Safe Styles] Плагин запущен");

    /**
     * Безопасное добавление стилей с сохранением оригинальных свойств
     * @param {HTMLElement} element - DOM элемент для применения стилей
     * @param {Object} styles - Объект со стилями (ключ: значение)
     */
    function safeAddStyle(element, styles) {
        Object.keys(styles).forEach(property => {
            element.style.setProperty(property, styles[property], 'important');
        });
    }

    /**
     * Основная функция применения стилей к элементам интерфейса
     */
    function applyStyles() {
        // Устанавливаем тёмный фон для body
        safeAddStyle(document.body, {
            'background': '#141414'
        });

        // 1. Тёмный фон для элементов интерфейса (без перезаписи других стилей)
        document.querySelectorAll('.selectbox__content, .layer--height, .selector__body, .modal-layer').forEach(el => {
            safeAddStyle(el, {
                'background-color': '#141414'
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

    /**
     * Добавляет CSS стили для карточек через тег <style>
     * Стили добавляются только один раз
     */
    function addCardStyles() {
        const styleId = 'lampa-safe-css';
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
            
			.wrap__left {
				box-shadow: 15px 0px 20px 0px #141414 !important;
			}
			
            .modal__content {
                background-color: #141414 !important;
            }			
            
            .card-more.focus .card-more__box::after {
                border: 0.3em solid #c22222;
            }
			
			.card__type {
				background: #c22222 !important;
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
			
			.console {
				background: #141414;
			}

            .extensions__block-add {
                background-color: #181818;
            }
            
            .settings-input--free {
                background-color: #141414;
            }

            .settings-input__content {
                background: #141414;
            }
            
            .extensions {
                background-color: #141414;
            }
            
            .modal__content {
                background-color: #141414;
                box-shadow: 0px 0px 20px 0px rgb(0 0 0);
                max-height: 90vh;
                overflow: hidden;
            }
                        

            .extensions__block-empty.focus:after, .extensions__block-add.focus:after {
                border: 0.3em solid #c22222;
            }
            
            
            
            .modal__title {
                background: linear-gradient(rgb(221 204 204), rgb(194 34 34)) text !important;
            }
            
            .notification-item {
                border: 2px solid #c22222 !important;
            }
            
            .notification-date {
                background: #c22222 !important;
            }
            
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                align-items: center;
            }
            
            .noty__body {
                box-shadow: 0 -4px 10px rgb(22 22 22 / 50%);
            }
            
            
            body {
                background: #141414;
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

    // Первое применение стилей
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

    /**
     * Функция остановки плагина и восстановления оригинальных стилей
     */
    window.stopLampaSafeStyles = () => {
        clearInterval(interval);
        const style = document.getElementById('lampa-safe-css');
        if (style) style.remove();
        
        // Восстанавливаем оригинальные стили
        document.body.style.removeProperty('background');
        document.querySelectorAll('.selectbox__content, .layer--height, .selector__body, .modal-layer, .bookmarks-folder__layer').forEach(el => {
            el.style.removeProperty('background-color');
            el.style.removeProperty('background');
        });
        
        console.log("[Lampa Safe Styles] Плагин остановлен");
    };
})();