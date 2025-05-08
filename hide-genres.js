(function() {
    if (typeof Lampa === 'undefined') {
        console.warn('[HideGenres] Lampa не найдена');
        return;
    }

    // 1. Спрячем через CSS (на случай ранней загрузки)
    const style = document.createElement('style');
    style.innerHTML = `
        .full-start-new__details-item:nth-child(2),
        .full-start-new__details-item[data-genres] {
            display: none !important;
        }
    `;
    document.head.appendChild(style);

    // 2. Отслеживаем динамические изменения
    const observer = new MutationObserver((mutations) => {
        document.querySelectorAll('.full-start-new__details-item').forEach(item => {
            if (item.textContent.match(/фантастика|боевик|драма|комедия/i)) {
                item.style.display = 'none';
            }
        });
    });

    // 3. Хук на открытие карточки
    if (Lampa.Listener) {
        Lampa.Listener.follow('full', () => {
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: false
            });
            
            // Двойная проверка через секунду
            setTimeout(() => {
                document.querySelectorAll('.full-start-new__details-item:nth-child(2)').forEach(el => {
                    el.style.display = 'none';
                });
            }, 1000);
        });
    }

    console.log('[HideGenres] Плагин активирован');
})();