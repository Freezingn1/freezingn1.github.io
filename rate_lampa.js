// Ждём загрузки страницы и появления .rate--kp
function init() {
    const kpRating = document.querySelector('.rate--kp');
    if (kpRating) {
        // Ваш код вставки рейтинга
        kpRating.insertAdjacentHTML('afterend', `
            <div class="full-start__rate rate--lampa">
                <div>{rating}</div>
                <div class="source--name">LAMPA</div>
            </div>
        `);
    } else {
        setTimeout(init, 500); // Повторяем проверку
    }
}

// Запуск
if (document.readyState === 'complete') init();
else window.addEventListener('load', init);