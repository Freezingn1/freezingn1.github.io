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
            'background': '#0a0a0a'
        });

        // 1. Тёмный фон для элементов интерфейса (без перезаписи других стилей)
        document.querySelectorAll('.selector__body, .modal-layer').forEach(el => {
            safeAddStyle(el, {
                'background-color': '#0a0a0a'
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
                color: #fff;
				border-radius: 1.2em;
				background: #e52d27;  
				background: -webkit-linear-gradient(to right, #b31217, #e52d27); 
				background: linear-gradient(to right, #b31217, #e52d27); 
            }
            
            .simple-button.focus {
                color: #fff;
				background: #e52d27;  
				background: -webkit-linear-gradient(to right, #b31217, #e52d27); 
				background: linear-gradient(to right, #b31217, #e52d27); 
            }
            
            .torrent-serial.focus {
                background: #e52d27;  
				background: -webkit-linear-gradient(to right, #b31217, #e52d27); 
				background: linear-gradient(to right, #b31217, #e52d27); 
            }
            
            .torrent-file.focus {
                background: #e52d27;  
				background: -webkit-linear-gradient(to right, #b31217, #e52d27); 
				background: linear-gradient(to right, #b31217, #e52d27);
            }
            
            .torrent-item.focus::after {
                content: "";
                position: absolute;
                top: -0.5em;
                left: -0.5em;
                right: -0.5em;
                bottom: -0.5em;
                border: 0.3em solid #c22222;
                -webkit-border-radius: 0.7em;
                border-radius: 0.7em;
                z-index: -1;
				background: #e52d27;  
				background: -webkit-linear-gradient(to right, #b31217, #e52d27); 
				background: linear-gradient(to right, #b31217, #e52d27); 
            }
                    
            .explorer__left {
                display: none;
            }
                    
            .explorer__files {
                width: 100%;
            }		
            
            .tag-count.focus {
                color: #fff;
				background: #e52d27;  
				background: -webkit-linear-gradient(to right, #b31217, #e52d27); 
				background: linear-gradient(to right, #b31217, #e52d27); 
            }

            .full-person.focus {
                color: #fff;
				background: #e52d27;  
				background: -webkit-linear-gradient(to right, #b31217, #e52d27); 
				background: linear-gradient(to right, #b31217, #e52d27); 
            }

            .full-review.focus {
                color: #fff;
				background: #e52d27;  
				background: -webkit-linear-gradient(to right, #b31217, #e52d27); 
				background: linear-gradient(to right, #b31217, #e52d27); 
            }
            
            
            .menu__item.focus, .menu__item.traverse, .menu__item.hover {
                color: #fff;
				background: #e52d27;  
				background: -webkit-linear-gradient(to right, #b31217, #e52d27); 
				background: linear-gradient(to right, #b31217, #e52d27); 
            }
			
			.card__marker > span {
				max-width: 11em
			}
			
			.bookmarks-folder__layer {
				background-color: rgba(0, 0, 0, 0.3) !important;
			}
            
            .menu__item.focus .menu__ico path[fill], .menu__item.focus .menu__ico rect[fill], .menu__item.focus .menu__ico circle[fill], .menu__item.traverse .menu__ico path[fill], .menu__item.traverse .menu__ico rect[fill], .menu__item.traverse .menu__ico circle[fill], .menu__item.hover .menu__ico path[fill], .menu__item.hover .menu__ico rect[fill], .menu__item.hover .menu__ico circle[fill] {
                fill: #ffffff;
            }
            
            
            .online.focus {
                -webkit-box-shadow: 0 0 0 0.2em #c22222;
                -moz-box-shadow: 0 0 0 0.2em #c22222;
                box-shadow: 0 0 0 0.2em #c22222;
				background: #e52d27;  
				background: -webkit-linear-gradient(to right, #b31217, #e52d27); 
				background: linear-gradient(to right, #b31217, #e52d27); 
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
                color: #ffffff;
            }
            
            /* Цвет иконок правый угол */
            .head__action.focus {
                background: #e52d27;  
				background: -webkit-linear-gradient(to right, #b31217, #e52d27); 
				background: linear-gradient(to right, #b31217, #e52d27);
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
				box-shadow: 15px 0px 20px 0px #0a0a0a !important;
			}
						
            
            .card-more.focus .card-more__box::after {
                border: 0.3em solid #c22222;
            }
			
			.card__type {
				background: #e52d27;  
				background: -webkit-linear-gradient(to right, #b31217, #e52d27); 
				background: linear-gradient(to right, #b31217, #e52d27) !important; 
			}
			
            .new-interface .card.card--wide+.card-more .card-more__box {
                background: rgba(0, 0, 0, 0.3);
            }
            
            .helper {
                background: #e52d27;  
				background: -webkit-linear-gradient(to right, #b31217, #e52d27); 
				background: linear-gradient(to right, #b31217, #e52d27);
            }
            
            .extensions__item {
                background-color: #181818;
            }
			
            .extensions__item.focus:after {
                border: 0.3em solid #c22222;
            }			
			
			.console {
				background: #0a0a0a;
			}

            .extensions__block-add {
                background-color: #181818;
            }
            
            .settings-input--free {
                background-color: #0a0a0a;
            }

            .settings-input__content {
                background: #0a0a0a;
            }
            
            .extensions {
                background-color: #0a0a0a;
            }
            
            .modal__content {
                background-color: #0a0a0a !important;
                box-shadow: 0px 0px 20px 0px rgb(0 0 0 / 50%);
                max-height: 90vh;
                overflow: hidden;
            }
            
            .settings__content, .selectbox__content {
				position: fixed;
				right: -100%;
				display: flex;
				background: #1a1a1a;
				top: 1em;
				left: 98%;
				max-height: calc(100vh - 2em);
				border-radius: 1.2em;
				box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8);
				padding: 0.5em;
				transform: translateX(100%);
				transition: transform 0.3s ease;
				overflow-y: auto;
			}

			.settings__title, .selectbox__title {
				font-size: 2.5em;
				font-weight: 300;
				text-align: center;
			} 
			
			.scroll--mask {
				-webkit-mask-image: -webkit-gradient(linear, left top, left bottom, from(rgba(255, 255, 255, 0)), color-stop(8%, rgb(255, 255, 255)), color-stop(92%, rgb(255, 255, 255)), to(rgba(255, 255, 255, 0)));
				-webkit-mask-image: -webkit-linear-gradient(top, rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 8%, rgb(255, 255, 255) 92%, rgba(255, 255, 255, 0) 100%);
				mask-image: -webkit-gradient(linear, left top, left bottom, from(rgba(255, 255, 255, 0)), color-stop(8%, rgb(255, 255, 255)), color-stop(92%, rgb(255, 255, 255)), to(rgba(255, 255, 255, 0)));
				mask-image: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 8%, rgb(255, 255, 255) 92%, rgba(255, 255, 255, 0) 100%);
			}						
			
			.menu__item {
				border-radius: 0em 15em 14em 0em;
			}
			
			.menu__list {
				padding-left: 0;
			}
			
			body.advanced--animation .head .head__action.focus,
			body.advanced--animation .head .head__action.hover,
			body.advanced--animation .menu .menu__item.focus,
			body.advanced--animation .menu .menu__item.hover,
			body.advanced--animation .full-start__button.focus,
			body.advanced--animation .full-start__button.hover,
			body.advanced--animation .simple-button.focus,
			body.advanced--animation .simple-button.hover,
			body.advanced--animation .full-descr__tag.focus,
			body.advanced--animation .full-descr__tag.hover,
			body.advanced--animation .tag-count.focus,
			body.advanced--animation .tag-count.hover,
			body.advanced--animation .full-review.focus,
			body.advanced--animation .full-review.hover,
			body.advanced--animation .full-review-add.focus,
			body.advanced--animation .full-review-add.hover {
				animation: none !important;
				-webkit-animation: none !important;
				-moz-animation: none !important;
				-o-animation: none !important;
			}

            .extensions__block-empty.focus:after, .extensions__block-add.focus:after {
                border: 0.3em solid #c22222;
            }
            
            .full-review-add.focus::after {
				border: 0.3em solid #c22222;
			}			
            
            .modal__title {
                background: linear-gradient(rgb(221 204 204), rgb(194 34 34)) text !important;
            }
            
            .notification-item {
                border: 2px solid #c22222 !important;
            }
            
            .notification-date {
				background: #e52d27;  
				background: -webkit-linear-gradient(to right, #b31217, #e52d27); 
				background: linear-gradient(to right, #b31217, #e52d27) !important;
            }
            
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                align-items: center;
            }
			
			.card-episode.focus .full-episode::after {
				border: 0.3em solid #c22222;
			}
			
			@media screen and (max-width: 480px) {
				.settings__content {
					left: 0 !important;
					top: unset !important;
				}
			}
			
			@media screen and (max-width: 480px) {
    ..ru-title-full:hover {
        max-width: none !important;
		top: unset !important;
    }
}

@media screen and (max-width: 480px) {
	.ru-title-full:hover {
		max-width: none !important;
		text-align: center !important;
	}
}

@media screen and (max-width: 480px) {
	.ru-title-full {
		max-width: none !important;
		text-align: center !important;
	}
}

@media screen and (max-width: 480px) {
    .full-start-new__body {
        text-align: center !important;
    }
}


@media screen and (max-width: 580px) {
    .full-start-new__buttons {
        overflow: auto;
        display: flex !important;
        justify-content: center !important;
        flex-wrap: wrap !important;
        max-width: 100% !important;
        margin: 0.5em auto !important;
    }
}

@media screen and (max-width: 480px) {
    .full-start-new__rate-line {
        display: flex !important;
        justify-content: center !important;
        flex-wrap: wrap !important;
        max-width: 100% !important;
        margin: 0.5em auto !important;
    }
}

@media screen and (max-width: 767px) {
    .full-start-new__details {
        display: flex !important;
        justify-content: center !important;
        flex-wrap: wrap !important;
        max-width: 100% !important;
        margin: 0.5em auto !important;
    }
}

@media screen and (max-width: 480px) {
	.full-start-new__reactions {
		display: flex !important;
		justify-content: center !important;
		flex-wrap: wrap !important;
		max-width: 100% !important;
		margin: 0.5em auto !important;
	}
}

@media screen and (max-width: 480px) {
    .selectbox__content {
        left: 0 !important;
		top: unset !important;
    }
}

@media screen and (max-width: 480px) {
    .full-start-new__rate-line {
        padding-top: 0.5em !important;
    }
}

@media screen and (max-width: 480px) {
.full-start-new__tagline {
    margin-bottom: 0.5em !important;
    margin-top: 0.5em !important;
}
}

.navigation-bar__body {
    background: #1c1c1c;
}
            
            .noty__body {
                box-shadow: 0 -4px 10px rgb(22 22 22 / 50%);
				background: #e52d27;  
				background: -webkit-linear-gradient(to right, #b31217, #e52d27); 
				background: linear-gradient(to right, #b31217, #e52d27); 
            }
            
            
            body {
                background: #0a0a0a;
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
                color: white;
                background-size: 200% 200%;
                animation: gradientAnimation 5s ease infinite;
				background: #e52d27;  
				background: -webkit-linear-gradient(to right, #b31217, #e52d27); 
				background: linear-gradient(to right, #b31217, #e52d27); 
            }
            
            /* Стиль для элемента selectbox в фокусе */
            .selectbox-item.focus {
                color: #fff;
				border-radius: 1.2em;
				background: #e52d27;  
				background: -webkit-linear-gradient(to right, #b31217, #e52d27); 
				background: linear-gradient(to right, #b31217, #e52d27); 
            }
            
            /* Стиль для папки настроек в фокусе */
            .settings-folder.focus {
                color: #fff;
				border-radius: 1.2em;
				background: #e52d27;  
				background: -webkit-linear-gradient(to right, #b31217, #e52d27); 
				background: linear-gradient(to right, #b31217, #e52d27); 
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
        document.querySelectorAll('.selector__body, .modal-layer, .bookmarks-folder__layer').forEach(el => {
            el.style.removeProperty('background-color');
            el.style.removeProperty('background');
        });
        
        console.log("[Lampa Safe Styles] Плагин остановлен");
    };
})();