(function() {
    // Создаем элемент style и добавляем в него все CSS правила
    const style = document.createElement('style');
    style.id = 'lampa-custom-styles';
    style.textContent = `
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
            background-color: #0d0d0d !important;
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
            background-color: #0d0d0d;
        }

        .settings-input__content {
            background: #0d0d0d;
        }
        
        .extensions {
            background-color: #0d0d0d;
        }
        
        .modal__content {
            background-color: #0d0d0d;
            box-shadow: 0px 0px 20px 0px rgb(0 0 0 / 51%);
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
        
        .card--tv .card__type {
            background: #c22222;
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
		
		.settings__content {
			background: #141414;
		}
		
		.selectbox__content {
			background: #141414;
		}
		
		.bookmarks-folder__layer {
			background-color: rgba(0, 0, 0, 0.3);
		}
    `;

    // Добавляем стили в head документа
    document.head.appendChild(style);

    // Функция для проверки, что Lampa загружена
    function checkLampaLoaded() {
        if (typeof Lampa !== 'undefined') {
            console.log('Lampa Custom Styles: Плагин успешно загружен!');
        } else {
            setTimeout(checkLampaLoaded, 1000);
        }
    }

    // Запускаем проверку
    checkLampaLoaded();
})();