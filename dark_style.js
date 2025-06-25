(function() {
    console.log("[Lampa Safe Styles] Полная оптимизированная версия");

    // Кеш элементов
    const elementsCache = new Map();
    let stylesApplied = false;

    /**
     * Добавление стилей с кешированием элементов
     */
    function safeAddStyleToElements(selector, styles) {
        if (!elementsCache.has(selector)) {
            elementsCache.set(selector, {
                elements: document.querySelectorAll(selector),
                styled: false
            });
        }

        const cacheEntry = elementsCache.get(selector);
        if (cacheEntry.styled) return;

        cacheEntry.elements.forEach(el => {
            if (el && !el.dataset.lampaStyled) {
                Object.entries(styles).forEach(([property, value]) => {
                    el.style.setProperty(property, value, 'important');
                });
                el.dataset.lampaStyled = 'true';
            }
        });
        
        cacheEntry.styled = true;
    }

    /**
     * Применение базовых стилей
     */
    function applyStyles() {
        if (stylesApplied) return;
        
        // Стили для body
        if (!document.body.dataset.lampaStyled) {
            document.body.style.setProperty('background', '#141414', 'important');
            document.body.dataset.lampaStyled = 'true';
        }

        // Основные элементы интерфейса
        const elementsToStyle = {
            '.selector__body, .modal-layer': { 'background-color': '#141414' },
            '.bookmarks-folder__layer': { 'background': 'rgba(0, 0, 0, 0.3)' },
            '.head__actions, .head__title': { 'opacity': '0.80' },
            '.explorer__left': { 'display': 'none' },
            '.explorer__files': { 'width': '100%' },
            '.console': { 'background': '#141414' },
            '.navigation-bar__body': { 'background': '#1c1c1c' }
        };

        Object.entries(elementsToStyle).forEach(([selector, styles]) => {
            safeAddStyleToElements(selector, styles);
        });		
		
        stylesApplied = true;
    }

    /**
     * Добавление всех CSS стилей
     */
    function addCardStyles() {
        const styleId = 'lampa-safe-css';
        if (document.getElementById(styleId)) return;

        const fullCSS = `
            :root {
                --dark-bg: #141414;
                --darker-bg: #1a1a1a;
                --menu-bg: #181818;
                --accent-color: #c22222;
                --accent-light: #e52d27;
                --accent-dark: #b31217;
                --accent-gradient: linear-gradient(to right, var(--accent-dark), var(--accent-light));
                --card-radius: 1.4em;
                --menu-radius: 1.2em;
            }

            /* Карточки */
            .card.focus .card__view::after,
            .card.hover .card__view::after {
                content: "";
                position: absolute;
                top: -0.3em;
                left: -0.3em;
                right: -0.3em;
                bottom: -0.3em;
                border: 0.3em solid var(--accent-color);
                border-radius: var(--card-radius);
                z-index: -1;
                pointer-events: none;
                background-color: var(--accent-color);
            }
            
            /* Элементы в фокусе */
            .settings-param.focus {
                color: #fff;
                border-radius: var(--menu-radius);
                background: var(--accent-gradient);
            }
            
            .simple-button.focus {
                color: #fff;
                background: var(--accent-gradient);
            }
            
            .torrent-serial.focus,
            .torrent-file.focus {
                background: var(--accent-gradient);
            }
            
            .torrent-item.focus::after {
                content: "";
                position: absolute;
                top: -0.5em;
                left: -0.5em;
                right: -0.5em;
                bottom: -0.5em;
                border: 0.3em solid var(--accent-color);
                border-radius: 0.7em;
                z-index: -1;
                background: var(--accent-gradient);
            }
            
            .tag-count.focus,
            .full-person.focus,
            .full-review.focus {
                color: #fff;
                background: var(--accent-gradient);
            }

            .menu__item.focus, 
            .menu__item.traverse, 
            .menu__item.hover {
                color: #fff;
                background: var(--accent-gradient);
            }
            
            .card__marker > span {
                max-width: 11em;
            }
            
            .menu__item.focus .menu__ico path[fill],
            .menu__item.focus .menu__ico rect[fill],
            .menu__item.focus .menu__ico circle[fill],
            .menu__item.traverse .menu__ico path[fill],
            .menu__item.traverse .menu__ico rect[fill],
            .menu__item.traverse .menu__ico circle[fill],
            .menu__item.hover .menu__ico path[fill],
            .menu__item.hover .menu__ico rect[fill],
            .menu__item.hover .menu__ico circle[fill] {
                fill: #ffffff;
            }
            
            .online.focus {
                box-shadow: 0 0 0 0.2em var(--accent-color);
                background: var(--accent-gradient);
            }
            
            .menu__item.focus .menu__ico [stroke],
            .menu__item.traverse .menu__ico [stroke],
            .menu__item.hover .menu__ico [stroke] {
                stroke: #ffffff;
            }
            
            .noty {
                color: #ffffff;
            }
            
            .head__action.focus {
                background: var(--accent-gradient);
                color: #fff;
            }
            
            .selector:hover {
                opacity: 0.8;
            }
            
            .online-prestige.focus::after {
                border: solid .3em var(--accent-color) !important;
                background-color: #871818;
            }
            
            .full-episode.focus::after,
            .card-episode.focus .full-episode::after {
                border: 0.3em solid var(--accent-color);
            }
            
            .wrap__left {
                box-shadow: 15px 0px 20px 0px var(--dark-bg) !important;
            }
            
            .card-more.focus .card-more__box::after {
                border: 0.3em solid var(--accent-color);
            }
            
            .card__type {
                background: var(--accent-gradient) !important;
            }
            
            .new-interface .card.card--wide+.card-more .card-more__box {
                background: rgba(0, 0, 0, 0.3);
            }
            
            .helper {
                background: var(--accent-gradient);
            }
            
            .extensions__item,
            .extensions__block-add {
                background-color: var(--menu-bg);
            }
            
            .extensions__item.focus:after,
            .extensions__block-empty.focus:after,
            .extensions__block-add.focus:after {
                border: 0.3em solid var(--accent-color);
            }
            
            .settings-input--free,
            .settings-input__content,
            .extensions {
                background-color: var(--dark-bg);
            }
            
            .modal__content {
                background-color: var(--darker-bg) !important;
                max-height: 90vh;
                overflow: hidden;
            }
            
            .settings__content, 
            .selectbox__content {
                position: fixed;
                right: -100%;
                display: flex;
                background: var(--darker-bg);
                top: 1em;
                left: 98%;
                max-height: calc(100vh - 2em);
                border-radius: var(--menu-radius);
                padding: 0.5em;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                overflow-y: auto;
            }
			
			.card-more__box {
				background: rgba(0, 0, 0, 0.3);
			}

            .settings__title, 
            .selectbox__title {
                font-size: 2.5em;
                font-weight: 300;
                text-align: center;
            }
            
            .scroll--mask {
                -webkit-mask-image: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 8%, rgb(255, 255, 255) 92%, rgba(255, 255, 255, 0) 100%);
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
            }
            
            .full-review-add.focus::after {
                border: 0.3em solid var(--accent-color);
            }
            
            .modal__title {
                background: linear-gradient(rgb(221 204 204), var(--accent-color)) text !important;
            }
			
            
            .notification-item {
                border: 2px solid var(--accent-color) !important;
            }
            
            .notification-date {
                background: var(--accent-gradient) !important;
            }
			
			.card__quality {
				color: #fff;
				background: var(--accent-gradient) !important;
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
                background: var(--accent-gradient);
            }
			
			body {
				margin: 1 !important;
			}
            
            /* Градиентный текст для рейтинга */
            .full-start__rate > div:first-child {
                background: linear-gradient(66.47deg, rgb(192, 254, 207) -15.94%, rgb(30, 213, 169) 62.41%);
                -webkit-background-clip: text;
                color: transparent;
                font-weight: bold;
            }
            
            /* Стили для рейтинга на карточке */
            .card__vote {
                position: absolute;
                top: 0;
                right: 0em;
                background: var(--accent-color);
                color: #ffffff;
                font-size: 1.5em;
                font-weight: 700;
                padding: 0.5em;
                border-radius: 0em 0.5em 0em 0.5em;
                display: flex;
                flex-direction: column;
                align-items: center;
                bottom: auto;
            }
            
            /* Анимация для кнопки в фокусе */
            @keyframes gradientAnimation {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            .full-start__button.focus {
                color: white;
                background-size: 200% 200%;
                animation: gradientAnimation 5s ease infinite;
                background: var(--accent-gradient);
            }
            
            /* Стиль для элемента selectbox в фокусе */
            .selectbox-item.focus {
                color: #fff;
                border-radius: var(--menu-radius);
                background: var(--accent-gradient);
            }
            
            /* Стиль для папки настроек в фокусе */
            .settings-folder.focus {
                color: #fff;
                border-radius: var(--menu-radius);
                background: var(--accent-gradient);
            }

            /* Мобильные стили */
            @media screen and (max-width: 480px) {
                .settings__content,
                .selectbox__content {
                left: 0 !important;
                top: unset !important;
				-webkit-border-top-left-radius: 2em;
				-moz-border-radius-topleft: 2em;
				border-top-left-radius: 2em !important;
				-webkit-border-top-right-radius: 2em;
				-moz-border-radius-topright: 2em;
				border-top-right-radius: 2em !important;
				border-radius: inherit;
                }
                
                .ru-title-full,
                .ru-title-full:hover {
                    max-width: none !important;
                    text-align: center !important;
                }
                
                .full-start-new__body {
                    text-align: center !important;
                }
                
                .full-start-new__rate-line {
                    padding-top: 0.5em !important;
					display: flex;
					justify-content: center;
					margin-bottom: 0em;
                }
                
                .full-start-new__tagline {
                    margin-bottom: 0.5em !important;
                    margin-top: 0.5em !important;
                }
            }
			
			@media screen and (max-width: 480px) {
				.full-start-new__title img {
					object-fit: contain;
					max-width: 12em;
					max-height: 6em;
				}
				}
				
				
@media screen and (max-width: 580px) {
    .full-descr__text {
        text-align: justify;
    }
}

@media screen and (max-width: 580px) {
.items-line__head {
    justify-content: center !important;
}
}

@media screen and (max-width: 580px) {
.full-descr__details {
    justify-content: center !important;
}
}

@media screen and (max-width: 480px) {
    .full-descr__tags {
        justify-content: center !important;
    }
}

@media screen and (max-width: 480px) {
.items-line__more {
    display: none;
}
}	

@media screen and (max-width: 480px) {
.full-descr__info-body {
    justify-content: center !important;
    display: flex;
}
}		

@media screen and (max-width: 480px) {
.full-descr__details > * {
    text-align: center;
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
            
            @media screen and (max-width: 767px) {
                .full-start-new__details {
                    display: flex !important;
                    justify-content: center !important;
                    flex-wrap: wrap !important;
                    max-width: 100% !important;
                    margin: 0.5em auto !important;
                }
            }
            
			@media screen and (min-width: 481px) {
				.settings__content,
				.selectbox__content,
				.modal__content
				{
					box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8);
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
        `;

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = fullCSS;
        document.head.appendChild(style);
    }

    // Умный наблюдатель за DOM
    const observer = new MutationObserver((mutations) => {
        const domChanged = mutations.some(mutation => 
            mutation.addedNodes.length > 0 || 
            (mutation.type === 'attributes' && mutation.attributeName === 'class')
        );
        
        if (domChanged) {
            requestAnimationFrame(() => {
                elementsCache.clear();
                stylesApplied = false;
                applyStyles();
            });
        }
    });

    // Инициализация
    function init() {
        applyStyles();
        addCardStyles();
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
        
        // Резервная проверка каждые 15 секунд
        const backupInterval = setInterval(() => {
            if (!stylesApplied) {
                applyStyles();
            }
        }, 15000);
        
        // Функция остановки
        window.stopLampaSafeStyles = () => {
            clearInterval(backupInterval);
            observer.disconnect();
            
            // Удаление стилей
            const style = document.getElementById('lampa-safe-css');
            if (style) style.remove();
            
            // Сброс атрибутов
            document.querySelectorAll('[data-lampa-styled]').forEach(el => {
                el.removeAttribute('data-lampa-styled');
            });
            
            elementsCache.clear();
            stylesApplied = false;
            
            console.log("[Lampa Safe Styles] Плагин остановлен");
        };
    }

    // Запуск
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();