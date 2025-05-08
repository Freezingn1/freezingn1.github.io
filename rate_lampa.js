Lampa.Plugin.add({
    name: 'lampa-rating',
    version: '1.0',
    init: function() {
        // Ждём загрузки страницы
        Lampa.Listener.follow('appready', () => {
            this.addRating();
        });
    },
    addRating: function() {
        // Ищем .rate--kp (даже если он скрыт)
        const kpRating = document.querySelector('.rate--kp');
        if (!kpRating) return;

        // Запрос к API (или fallback)
        this.fetchRating()
            .then(rating => {
                const html = `
                    <div class="full-start__rate rate--lampa">
                        <div>${rating}</div>
                        <div class="source--name">LAMPA</div>
                    </div>
                `;
                kpRating.insertAdjacentHTML('afterend', html);
            })
            .catch(e => console.error('Ошибка:', e));
    },
    fetchRating: function() {
        return new Promise((resolve) => {
            // Здесь реальный запрос к API или заглушка
            resolve(8.7); // Пример статичного значения
        });
    }
});