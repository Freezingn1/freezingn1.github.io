(function() {
    'use strict';

    function calculateRating(data) {
        let positive = 0, negative = 0;
        data.forEach(item => {
            const count = parseInt(item.counter) || 0;
            if (item.type === "fire" || item.type === "nice") positive += count;
            if (item.type === "bore" || item.type === "think" || item.type === "shit") negative += count;
        });
        return (positive + negative > 0) 
            ? (positive / (positive + negative) * 10).toFixed(1)
            : "0.0";
    }

    function addRatingElement(rating, parent) {
        const html = `
            <div class="full-start__rate rate--lampa">
                <div>${rating}</div>
                <div class="source--name">LAMPA</div>
            </div>
        `;
        parent.insertAdjacentHTML('afterend', html);
    }

    function fetchRating(itemId) {
        return new Promise((resolve) => {
            // Заглушка вместо реального API
            setTimeout(() => {
                resolve({
                    result: [
                        {type: "fire", counter: "12"},
                        {type: "bore", counter: "4"}
                    ]
                });
            }, 500);
            
            // Реальный запрос (раскомментировать, если API работает)
            
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `http://cub.bylampa.online/api/reactions/get/${itemId}`, true);
            xhr.onload = function() {
                if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
                else resolve(null);
            };
            xhr.onerror = () => resolve(null);
            xhr.send();
            
        });
    }

    function init() {
        const kpRating = document.querySelector('.rate--kp');
        if (!kpRating) {
            setTimeout(init, 500);
            return;
        }

        const itemId = "test123"; // Замените на реальный ID
        fetchRating(itemId).then(data => {
            if (data?.result) {
                const rating = calculateRating(data.result);
                addRatingElement(rating, kpRating);
            } else {
                console.error("Не удалось получить рейтинг");
                addRatingElement("8.5", kpRating); // Fallback
            }
        });
    }

    // Запуск
    if (document.readyState === 'complete') init();
    else window.addEventListener('load', init);
})();