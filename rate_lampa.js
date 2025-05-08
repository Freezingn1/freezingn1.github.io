(function() {
    'use strict';

    // Конфигурация
    const API_URL = 'http://cub.bylampa.online/api/reactions/get/';
    const CACHE_TIME = 60 * 60 * 1000; // 1 час кеширования

    // Рассчитывает рейтинг на основе реакций
    function calculateRating(data) {
        let positive = 0, negative = 0;
        
        data.forEach(item => {
            const count = parseInt(item.counter) || 0;
            if (item.type === "fire" || item.type === "nice") positive += count;
            if (item.type === "bore" || item.type === "think" || item.type === "shit") negative += count;
        });

        const total = positive + negative;
        return total > 0 ? ((positive / total) * 10).toFixed(1) : "0.0";
    }

    // Создает HTML-блок с рейтингом
    function createRatingElement(rating) {
        const div = document.createElement('div');
        div.className = 'full-start__rate rate--lampa';
        div.innerHTML = `
            <div>${rating}</div>
            <div class="source--name">LAMPA</div>
        `;
        return div;
    }

    // Получает сохраненный рейтинг из localStorage
    function getCachedRating(itemId) {
        const cached = localStorage.getItem(`lampa_rating_${itemId}`);
        if (!cached) return null;
        
        const { rating, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TIME) return rating;
        
        return null;
    }

    // Сохраняет рейтинг в localStorage
    function cacheRating(itemId, rating) {
        localStorage.setItem(`lampa_rating_${itemId}`, JSON.stringify({
            rating,
            timestamp: Date.now()
        }));
    }

    // Загружает рейтинг с API
    async function fetchRating(itemId) {
        try {
            const response = await fetch(`${API_URL}${itemId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            if (!data.result) throw new Error('Invalid API response');
            
            return data.result;
        } catch (error) {
            console.error('Failed to fetch rating:', error);
            return null;
        }
    }

    // Основная функция для добавления рейтинга
    async function addLampaRating() {
        const kpRating = document.querySelector('.rate--kp');
        if (!kpRating) return;

        // Получаем ID из URL или данных карточки (нужно адаптировать под вашу структуру)
        const itemId = window.location.pathname.split('/').pop() || 'default';
        
        // Проверяем кеш
        const cachedRating = getCachedRating(itemId);
        if (cachedRating) {
            kpRating.after(createRatingElement(cachedRating));
            return;
        }

        // Загружаем с API
        const reactions = await fetchRating(itemId);
        if (!reactions) return;

        const rating = calculateRating(reactions);
        cacheRating(itemId, rating);
        kpRating.after(createRatingElement(rating));
    }

    // Отслеживаем изменения DOM для динамического контента
    const observer = new MutationObserver((mutations) => {
        if (!document.querySelector('.rate--lampa')) {
            addLampaRating();
        }
    });

    // Запускаем при загрузке страницы
    if (document.readyState === 'complete') {
        addLampaRating();
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        window.addEventListener('load', () => {
            addLampaRating();
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    // Стили для рейтинга (можно вынести в CSS)
    const style = document.createElement('style');
    style.textContent = `
        .rate--lampa {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-left: 10px;
            color: #ffaa00;
            font-size: 16px;
        }
        .source--name {
            font-size: 12px;
            opacity: 0.8;
            margin-top: 2px;
        }
    `;
    document.head.appendChild(style);
})();