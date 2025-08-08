(function () {
    const PROXY_PREFIX = 'https://wild-mode-68f9.edikgarr.workers.dev/';
    const COVER_HOST = 'https://cover.imglib.info/';

    function isCoverUrl(url) {
        return typeof url === 'string' && url.startsWith(COVER_HOST);
    }

    function proxify(url) {
        return PROXY_PREFIX + url;
    }

    // Чистим кэш постеров в localStorage
    try {
        Object.keys(localStorage).forEach(key => {
            if (/poster|cover|image/i.test(key)) {
                localStorage.removeItem(key);
            }
        });
        console.log('Proxy plugin: localStorage image cache cleared');
    } catch (e) {}

    // Патчим src у картинок
    const desc = Object.getOwnPropertyDescriptor(Image.prototype, 'src');
    Object.defineProperty(Image.prototype, 'src', {
        set: function (value) {
            if (isCoverUrl(value)) value = proxify(value);
            return desc.set.call(this, value);
        },
        get: function () {
            return desc.get.call(this);
        }
    });

    // Патчим setAttribute
    const origSetAttr = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (name, value) {
        if (typeof value === 'string' && (name === 'src' || name === 'srcset') && isCoverUrl(value)) {
            value = proxify(value);
        }
        return origSetAttr.call(this, name, value);
    };

    // Перехватываем вставку HTML
    const innerDesc = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    Object.defineProperty(Element.prototype, 'innerHTML', {
        set: function (html) {
            if (typeof html === 'string' && html.includes(COVER_HOST)) {
                html = html.replace(new RegExp(COVER_HOST + '[^"\\s]+', 'g'), m => proxify(m));
            }
            return innerDesc.set.call(this, html);
        },
        get: function () {
            return innerDesc.get.call(this);
        }
    });

    // MutationObserver для уже вставленных элементов
    const obs = new MutationObserver(muts => {
        muts.forEach(m => {
            if (m.type === 'childList') {
                m.addedNodes.forEach(node => {
                    if (node.tagName === 'IMG' && isCoverUrl(node.src)) {
                        node.src = proxify(node.src);
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll('img').forEach(img => {
                            if (isCoverUrl(img.src)) img.src = proxify(img.src);
                        });
                    }
                });
            } else if (m.type === 'attributes' && m.attributeName === 'src') {
                if (isCoverUrl(m.target.src)) m.target.src = proxify(m.target.src);
            }
        });
    });

    obs.observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });

    // Мгновенная замена уже вставленных постеров
    document.querySelectorAll('img').forEach(img => {
        if (isCoverUrl(img.src)) img.src = proxify(img.src);
    });

    console.log('Proxy plugin loaded (total override)');
})();
