(function () {
    const PROXY_PREFIX = 'https://wild-mode-68f9.edikgarr.workers.dev/';
    const ORIGINAL_SRC = Object.getOwnPropertyDescriptor(Image.prototype, 'src');

    Object.defineProperty(Image.prototype, 'src', {
        set: function (url) {
            try {
                if (typeof url === 'string' && url.startsWith('https://cover.imglib.info/')) {
                    url = PROXY_PREFIX + url;
                }
            } catch (e) {
                console.error('Proxy image error:', e);
            }
            return ORIGINAL_SRC.set.call(this, url);
        }
    });

    console.log('Плагин глобального проксирования постеров загружен');
})();
