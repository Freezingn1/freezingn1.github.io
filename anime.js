(function() {
    'use strict';

    Lampa.Platform.tv();
    
    function initAnimeSection() {

        // Иконка SVG для меню
        const animeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="8.5" cy="10.5" r="1.5"/><circle cx="15.5" cy="10.5" r="1.5"/><path d="M12 16c-1.48 0-2.75-.81-3.45-2H6.88c.8 2.05 2.79 3.5 5.12 3.5s4.32-1.45 5.12-3.5h-1.67c-.69 1.19-1.97 2-3.45 2z"/></svg>';

        // Создаем пункт меню
        const menuItem = $(`
            <li class="menu__item selector" data-action="anime2">
                <div class="menu__ico">${animeIcon}</div>
                <div class="menu__text">Аниме</div>
            </li>
        `);

        // Функция добавления в меню
        function addToMenu() {
            const menuSelectors = [
                '.menu__list', 
                '.navigation__list',
                '.main-menu ul',
                '.menu .menu__list',
                'nav ul:first',
                '.navigation .menu__list'
            ];
            
            for(let selector of menuSelectors) {
                if($(selector).length) {
                    $(selector).append(menuItem);
                    console.log('Аниме пункт добавлен через селектор:', selector);
                    return true;
                }
            }
            
            console.error('Не удалось найти меню для добавления пункта');
            return false;
        }

        // Обработчик нажатия с компонентом category
        menuItem.on('hover:enter click', function() {
            Lampa.Activity.push({
                url: 'discover/tv?with_original_language=ja&with_genres=16',
                title: 'Аниме',
                component: 'category', // Используем компонент category
                source: 'tmdb',
                card_type: 'true',
                page: 1,
                // Для компонента category используем другой формат параметров
                category: {
                    view: 'poster', // или 'poster' для другого вида
                    count: 20,
                    fields: ['title','year','imdb','kp_id','age'],
                    filters: {
                        with_original_language: 'ja',
                        with_genres: '16'
                    },
                    sort: 'popularity.desc'
                }
            });
        });

        // Попытка добавления пункта
        if(!addToMenu()) {
            Lampa.Listener.follow('app', function(e) {
                if(e.type === 'ready') addToMenu();
            });
        }
    }

    // Запуск после загрузки
    if(document.readyState === 'complete') {
        initAnimeSection();
    } else {
        window.addEventListener('load', initAnimeSection);
    }
})();