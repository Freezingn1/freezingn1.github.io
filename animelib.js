(function () {
    const COVER_HOST = 'https://cover.imglib.info/';

    const obs = new MutationObserver(muts => {
        muts.forEach(m => {
            if (m.type === 'childList') {
                m.addedNodes.forEach(node => {
                    if (node.tagName === 'IMG') {
                        console.log('IMG added:', node.src);
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll('img').forEach(img => {
                            console.log('IMG in subtree:', img.src);
                        });
                    }
                });
            } else if (m.type === 'attributes' && m.attributeName === 'src') {
                console.log('IMG src changed:', m.target.src);
            }
        });
    });

    obs.observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });

    console.log('Image logger started');
})();
