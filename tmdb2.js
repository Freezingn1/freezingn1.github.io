(function () {
    'use strict';

    // Генерация или получение уникального ID
    let unic_id = Lampa.Storage.get('lampac_unic_id', '');
    if (!unic_id) {
        unic_id = Lampa.Utils.uid(8).toLowerCase();
        Lampa.Storage.set('lampac_unic_id', unic_id);
    }

    // Список прокси-серверов (можно расширить)
    const proxyServers = [
        'http://my.bylampa.online',
        'https://fastproxy.example.com', // Добавьте реальные альтернативы
        'https://backupproxy.example.com'
    ];

    // Кэш для API и изображений
    const cache = {
        api: new Map(),
        image: new Map()
    };

    // Выбор активного прокси-сервера
    function getActiveProxy() {
        let activeProxy = Lampa.Storage.get('active_proxy', proxyServers[0]);
        if (!proxyServers.includes(activeProxy)) activeProxy = proxyServers[0];
        return activeProxy;
    }

    // Переключение на следующий прокси при ошибке
    function switchProxy() {
        let currentProxy = getActiveProxy();
        let nextIndex = (proxyServers.indexOf(currentProxy) + 1) % proxyServers.length;
        let newProxy = proxyServers[nextIndex];
        Lampa.Storage.set('active_proxy', newProxy);
        console.log('Switched to proxy:', newProxy);
        return newProxy;
    }

    // Добавление параметров к URL
    function account(url) {
        const params = [];
        const email = Lampa.Storage.get('account_email', '');
        if (email && !url.includes('account_email=')) {
            params.push(`account_email=${encodeURIComponent(email)}`);
        }
        if (unic_id && !url.includes('uid=')) {
            params.push(`uid=${encodeURIComponent(unic_id)}`);
        }
        // Токен закомментирован, так как не используется
        // const token = ''; // Если нужен токен, добавьте логику
        // if (token && !url.includes('token=')) {
        //     params.push(`token=${encodeURIComponent(token)}`);
        // }
        return params.length ? Lampa.Utils.addUrlComponent(url, params.join('&')) : url;
    }

    // Обработка изображений TMDB
    Lampa.TMDB.image = function (url) {
        const base = `${Lampa.Utils.protocol()}image.tmdb.org/${url}`;
        const proxyEnabled = Lampa.Storage.field('proxy_tmdb');

        if (!proxyEnabled) return base;

        // Проверка кэша
        if (cache.image.has(url)) {
            return cache.image.get(url);
        }

        const proxyUrl = `${getActiveProxy()}/tmdb/img/${account(url)}`;

        // Асинхронная проверка доступности прокси
        fetch(proxyUrl, { method: 'HEAD' })
            .catch(() => {
                // При ошибке переключаемся на другой прокси
                const newProxy = switchProxy();
                return `${newProxy}/tmdb/img/${account(url)}`;
            });

        cache.image.set(url, proxyUrl);
        return proxyUrl;
    };

    // Обработка API TMDB
    Lampa.TMDB.api = function (url) {
        const base = `${Lampa.Utils.protocol()}api.themoviedb.org/3/${url}`;
        const proxyEnabled = Lampa.Storage.field('proxy_tmdb');

        if (!proxyEnabled) return base;

        // Проверка кэша
        if (cache.api.has(url)) {
            return cache.api.get(url);
        }

        const proxyUrl = `${getActiveProxy()}/tmdb/api/3/${account(url)}`;

        // Асинхронная проверка доступности прокси
        fetch(proxyUrl, { method: 'HEAD' })
            .catch(() => {
                // При ошибке переключаемся на другой прокси
                const newProxy = switchProxy();
                return `${newProxy}/tmdb/api/3/${account(url)}`;
            });

        cache.api.set(url, proxyUrl);
        return proxyUrl;
    };

    // Очистка настроек proxy в интерфейсе
    Lampa.Settings.listener.follow('open', function (e) {
        if (e.name === 'tmdb') {
            e.body.find('[data-parent="proxy"]').remove();
        }
    });

})();
