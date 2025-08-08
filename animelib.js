(function(){
    const PROXY_PREFIX = 'https://wild-mode-68f9.edikgarr.workers.dev/';
    const COVER_HOST   = 'https://cover.imglib.info/';

    const origImgLoad = Lampa.Utils.imgLoad;
    Lampa.Utils.imgLoad = function(img, url){
        if (url && url.includes(COVER_HOST) && !url.startsWith(PROXY_PREFIX)) {
            url = PROXY_PREFIX + url;
        }
        return origImgLoad.call(this, img, url);
    };
})();
