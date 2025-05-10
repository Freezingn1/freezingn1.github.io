(function() {
    'use strict';

    // Ждем полной загрузки Lampa
    function waitLampa(callback) {
        if (window.Lampa && Lampa.Activity) {
            callback();
        } else {
            setTimeout(() => waitLampa(callback), 100);
        }
    }

    waitLampa(function() {
        Lampa.Platform.tv();
        
        // Создаем иконку для меню
        const animeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="8.5" cy="10.5" r="1.5"/><circle cx="15.5" cy="10.5" r="1.5"/><path d="M12 16c-1.48 0-2.75-.81-3.45-2H6.88c.8 2.05 2.79 3.5 5.12 3.5s4.32-1.45 5.12-3.5h-1.67c-.69 1.19-1.97 2-3.45 2z"/></svg>';

        // Функция для поиска меню
        function findMenu() {
            const menus = [
                '.menu__list', 
                '.navigation .menu__list',
                '.main-menu ul',
                'nav ul'
            ];
            
            for (let selector of menus) {
                const menu = document.querySelector(selector);
                if (menu) return menu;
            }
            return null;
        }

        // Добавляем пункт в меню
        function addMenuItem() {
            const menu = findMenu();
            if (!menu) {
                console.error('Меню не найдено');
                return false;
            }

            const menuItem = document.createElement('li');
            menuItem.className = 'menu__item selector';
            menuItem.innerHTML = `
                <div class="menu__ico">${animeIcon}</div>
                <div class="menu__text">Аниме</div>
            `;

            menuItem.addEventListener('click', openAnimeCategory);
            menu.appendChild(menuItem);
            return true;
        }

        // Открываем категорию аниме
        function openAnimeCategory() {
    Lampa.Activity.push({
        url: 'discover/tv?with_genres=16&with_original_language=ja',
        title: 'Аниме',
        component: 'category',
        source: 'tmdb',
        card_type: 'poster'
    });
}

        // Пытаемся добавить пункт меню
        if (!addMenuItem()) {
            const observer = new MutationObserver(function() {
                if (addMenuItem()) {
                    observer.disconnect();
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    });
})();