(function() {
    // Убедитесь, что jQuery подключен
    if (typeof $ === 'undefined') {
        console.error('jQuery is not loaded');
        return;
    }

    // Ждем загрузки DOM
    document.addEventListener('DOMContentLoaded', function() {
        // Создаем элемент меню
        var menuItem = $('<li data-action="lnum" class="menu__item selector"><div class="menu__ico"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><g><g><path fill="currentColor" d="M482.909,67.2H29.091C13.05,67.2,0,80.25,0,96.291v319.418C0,431.75,13.05,444.8,29.091,444.8h453.818c16.041,0,29.091-13.05,29.091-29.091V96.291C512,80.25,498.95,67.2,482.909,67.2z M477.091,409.891H34.909V102.109h442.182V409.891z"/></g></g><g><g><rect fill="currentColor" x="126.836" y="84.655" width="34.909" height="342.109"/></g></g><g><g><rect fill="currentColor" x="350.255" y="84.655" width="34.909" height="342.109"/></g></g><g><g><rect fill="currentColor" x="367.709" y="184.145" width="126.836" height="34.909"/></g></g><g><g><rect fill="currentColor" x="17.455" y="184.145" width="126.836" height="34.909"/></g></g><g><g><rect fill="currentColor" x="367.709" y="292.364" width="126.836" height="34.909"/></g></g><g><g><rect fill="currentColor" x="17.455" y="292.364" width="126.836" height="34.909"/></g></g></svg></div><div class="menu__text">Anime2</div></li>');

        // Добавляем обработчик клика с делегированием
        $(document).on('click', '.menu__item[data-action="lnum"]', function() {
            $('.activity--active').removeClass('activity--active');
            var content = `...`; // Ваш HTML-контент
            $('.wrap__content').append(content);
            setTimeout(function() {
                $('.activity__loader').hide();
            }, 1000);
        });

        // Функция для добавления пункта меню
        function addMenuItem() {
            var menuList = $('.menu__list');
            console.log('menuList found:', menuList.length);
            if (menuList.length) {
                menuList.append(menuItem);
                console.log('Menu item added');
            } else {
                setTimeout(addMenuItem, 100);
            }
        }

        // Начинаем попытки добавить пункт меню
        addMenuItem();

        // Альтернатива: наблюдаем за DOM
        const observer = new MutationObserver((mutations, obs) => {
            var menuList = $('.menu__list');
            if (menuList.length) {
                menuList.append(menuItem);
                console.log('Menu item added via observer');
                obs.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
})();