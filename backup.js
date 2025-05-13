(function () {
    function startPlugin() {
        const style = document.createElement('style');
        style.innerText = `
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
.settings-param.focus,
.simple-button.focus,
.tag-count.focus,
.full-person.focus,
.full-review.focus,
.menu__item.focus,
.menu__item.traverse,
.menu__item.hover,
.online.focus,
.head__action.focus,
.selectbox-item.focus,
.settings-folder.focus {
    background-color: #c22222;
    color: #fff;
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
.menu__item.focus .menu__ico [stroke],
.menu__item.traverse .menu__ico [stroke],
.menu__item.hover .menu__ico [stroke] {
    stroke: #ffffff;
}
.torrent-serial.focus,
.torrent-file.focus {
    background-color: #c22222;
}
.torrent-item.focus::after,
.extensions__item.focus:after,
.extensions__block-empty.focus:after,
.extensions__block-add.focus:after,
.card-more.focus .card-more__box::after,
.full-episode.focus::after,
.online-prestige.focus::after {
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border: 0.3em solid #c22222;
    background-color: #c22222;
    border-radius: 0.7em;
    z-index: -1;
}
.explorer__left {
    display: none;
}
.explorer__files {
    width: 100%;
}
.head__actions,
.head__title {
    opacity: 0.80;
}
.noty {
    background: #c22222;
    color: #ffffff;
}
.selector:hover {
    opacity: 0.8;
}
.modal__content {
    background-color: #0d0d0d !important;
    box-shadow: 0px 0px 20px 0px rgb(0 0 0 / 51%);
    max-height: 90vh;
    overflow: hidden;
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
    background: #0d0d0d;
}
.full-start__rate > div:first-child {
    background: -webkit-linear-gradient(66.47deg, rgb(192, 254, 207) -15.94%, rgb(30, 213, 169) 62.41%);
    -webkit-background-clip: text;
    color: transparent;
    font-weight: bold;
}
.card__vote {
    position: absolute;
    top: 0;
    right: 0em;
    background: #c22222;
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
.extensions__item,
.extensions__block-add,
.extensions {
    background-color: #181818;
}
.settings-input--free,
.settings-input__content {
    background-color: #0d0d0d;
}
        `;
        document.head.appendChild(style);

        console.log('[RedThemePlugin] Стили успешно загружены');
    }

    function waitForLampaPluginAdd(callback) {
        if (window.Lampa && Lampa.Plugin && typeof Lampa.Plugin.add === 'function') {
            callback();
        } else {
            setTimeout(() => waitForLampaPluginAdd(callback), 500);
        }
    }

    waitForLampaPluginAdd(() => {
        Lampa.Plugin.add({
            title: 'Red Theme',
            version: '1.0',
            description: 'Плагин применяет красную тему к интерфейсу Lampa.',
            author: 'ChatGPT',
            type: 'style',
            onMount: startPlugin,
            onDestroy: function () {
                console.log('[RedThemePlugin] отключён');
            }
        });
    });
})();
