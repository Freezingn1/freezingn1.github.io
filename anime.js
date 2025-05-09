(function() {
    // Ждем загрузки DOM
    document.addEventListener('DOMContentLoaded', function() {
        // Создаем элемент меню
        var menuItem = $('<li data-action="lnum" class="menu__item selector"><div class="menu__ico"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><g><g><path fill="currentColor" d="M482.909,67.2H29.091C13.05,67.2,0,80.25,0,96.291v319.418C0,431.75,13.05,444.8,29.091,444.8h453.818c16.041,0,29.091-13.05,29.091-29.091V96.291C512,80.25,498.95,67.2,482.909,67.2z M477.091,409.891H34.909V102.109h442.182V409.891z"/></g></g><g><g><rect fill="currentColor" x="126.836" y="84.655" width="34.909" height="342.109"/></g></g><g><g><rect fill="currentColor" x="350.255" y="84.655" width="34.909" height="342.109"/></g></g><g><g><rect fill="currentColor" x="367.709" y="184.145" width="126.836" height="34.909"/></g></g><g><g><rect fill="currentColor" x="17.455" y="184.145" width="126.836" height="34.909"/></g></g><g><g><rect fill="currentColor" x="367.709" y="292.364" width="126.836" height="34.909"/></g></g><g><g><rect fill="currentColor" x="17.455" y="292.364" width="126.836" height="34.909"/></g></g></svg></div><div class="menu__text">Anime2</div></li>');
        
        // Добавляем обработчик клика
        menuItem.on('click', function() {
            // Скрываем все активные разделы
            $('.activity--active').removeClass('activity--active');
            
            // Создаем контент для нового раздела
            var content = `
            <div class="activity layer--width activity--active">
                <div class="activity__body">
                    <div class="new-interface">
                        <img class="full-start__background loaded" src="https://image.tmdb.org/t/p/w1280//89qSKhLrJOUhp6xgbqgSTpzblbA.jpg">
                        <div class="new-interface-info">
                            <div class="new-interface-info__body">
                                <div class="new-interface-info__head"><span>2025</span>, Китай</div>
                                <div class="new-interface-info__title"><img class="new-interface-logo" src="https://image.tmdb.org//t/p/w500/1FIvQSUzFovFdk8rNXnE9t76G6E.png" alt="Сверхкуб" onerror="this.onerror=null;this.parentElement.textContent='Сверхкуб'"></div>
                                <div class="new-interface-info__details">
                                    <div class="full-start__rate"><div>9.1</div><div>TMDB</div></div>
                                    <span class="new-interface-info__split">●</span>
                                    <span class="full-start__pg">Эпизодов 12</span>
                                    <span class="new-interface-info__split">●</span>
                                    <span class="full-start__pg" style="font-size: 0.9em;">14+</span>
                                </div>
                                <div class="new-interface-info__description"></div>
                            </div>
                        </div>
                        <div class="scroll scroll--mask scroll--over layer--wheight" style="height: 239.281px;">
                            <div class="scroll__content">
                                <div class="scroll__body">
                                    <!-- Здесь можно добавить блоки с контентом -->
                                    <div class="items-line layer--visible layer--render items-line--type-none">
                                        <div class="items-line__head">
                                            <div class="items-line__title">Популярное в Anime2</div>
                                            <div class="items-line__more selector">Еще</div>
                                        </div>
                                        <div class="items-line__body">
                                            <div class="scroll scroll--horizontal">
                                                <div class="scroll__content">
                                                    <div class="scroll__body items-cards">
                                                        <!-- Карточки контента -->
                                                        <div class="card selector layer--visible layer--render card--tv card--small card--wide card--loaded">
                                                            <div class="card__view">
                                                                <img src="https://image.tmdb.org/t/p/w780//89qSKhLrJOUhp6xgbqgSTpzblbA.jpg" class="card__img">
                                                                <div class="card__icons"><div class="card__icons-inner"></div></div>
                                                                <div class="card__type" style="font-size: 0.9em;">Сериал</div>
                                                                <div class="card__vote">9.1</div>
                                                                <div class="card__quality"><div>webrip</div></div>
                                                            </div>
                                                        </div>
                                                        <!-- Добавьте больше карточек по аналогии -->
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="activity__loader"></div>
            </div>
            `;
            
            // Добавляем контент в обертку
            $('.wrap__content').append(content);
            
            // Имитируем загрузку данных (можно заменить на реальный API запрос)
            setTimeout(function() {
                $('.activity__loader').hide();
            }, 1000);
        });
        
        // Функция для поиска и добавления пункта меню
        function addMenuItem() {
            var menuList = $('.menu__list');
            if (menuList.length) {
                menuList.append(menuItem);
            } else {
                setTimeout(addMenuItem, 100);
            }
        }
        
        // Начинаем попытки добавить пункт меню
        addMenuItem();
    });
})();