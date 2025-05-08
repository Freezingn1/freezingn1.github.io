(function() {
    'use strict';
    Lampa.Platform.tv();

    function init() {
        if (Lampa.Manifest.app !== 'bylampa') {
            Lampa.Noty.show('Ошибка доступа');
            return;
        }

        Lampa.Listener.follow('appready', function(event) {
            if (event.type === 'complite') {
                const activity = event.object.activity.render();
                const itemId = event.object.id + '_' + event.object.id;
                const apiUrl = 'http://cub.bylampa.online/api/reactions/get/' + itemId;

                const xhr = new XMLHttpRequest();
                xhr.open('GET', apiUrl, true);
                xhr.timeout = 2000;
                xhr.send();

                xhr.onload = function() {
                    if (this.status === 200) {
                        const data = JSON.parse(this.responseText).result;
                        let positive = 0, negative = 0;

                        data.forEach(item => {
                            if (item.type === 'fire' || item.type === 'nice') {
                                positive += parseInt(item.counter, 10);
                            } else if (item.type === 'bore' || item.type === 'think' || item.type === 'shit') {
                                negative += parseInt(item.counter, 10);
                            }
                        });

                        const rating = (positive + negative > 0) 
                            ? (positive / (positive + negative) * 10).toFixed(1) 
                            : 0;

                        const ratingElement = $('<div class="full-start__rate rate--lampa"></div>');
                        const ratingValue = $('<div></div>').text(rating);
                        const sourceName = $('<div class="source--name">LAMPA</div>');

                        ratingElement.append(ratingValue);
                        ratingElement.append(sourceName);
                        $('.rate--kp', activity).after(ratingElement);
                    }
                };

                xhr.ontimeout = function() {
                    console.log('Тайм-аут при получении рейтинга');
                };

                xhr.onerror = function() {
                    console.log('Ошибка при выполнении запроса на получение рейтинга');
                };
            }
        });
    }

    if (window.ready) init();
    else Lampa.Listener.follow('ready', event => {
        if (event.type === 'origin') init();
    });
})();