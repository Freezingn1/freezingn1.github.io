(function() {
    // Ждём загрузки страницы
    document.addEventListener('DOMContentLoaded', function() {
        // Функция для проверки наличия русского логотипа
        function checkRussianLogo() {
            // Ищем элемент с логотипом (предполагаем, что он имеет класс full-start__logo)
            let logo = document.querySelector('.full-start__logo');
            
            // Если логотипа нет, ничего не делаем
            if (!logo) return;
            
            // Проверяем, содержит ли логотип русский текст (простая проверка)
            // Это можно улучшить, если знать точные классы или атрибуты русского логотипа
            let hasRussianLogo = logo.textContent.match(/[А-Яа-я]/) || 
                                logo.querySelector('img[alt*="русский"]') || 
                                logo.querySelector('img[src*="ru"]');
            
            // Если русский логотип есть - выходим
            if (hasRussianLogo) return;
            
            // Ищем название на русском (предполагаем, что оно есть в данных)
            let titleElement = document.querySelector('.full-start__title[lang="ru"], .full-start__title:contains("русский")');
            let russianTitle = titleElement ? titleElement.textContent : 
                              document.querySelector('.full-start__title')?.textContent || 'Название не найдено';
            
            // Создаем элемент для отображения русского названия
            let statusElement = document.querySelector('.full-start__status');
            if (statusElement) {
                let ruTitleElement = document.createElement('div');
                ruTitleElement.className = 'full-start__ru-title';
                ruTitleElement.textContent = 'RU: ' + russianTitle;
                ruTitleElement.style.cssText = 'color: #fff; font-size: 16px; margin-top: 5px;';
                
                // Вставляем после статуса
                statusElement.parentNode.insertBefore(ruTitleElement, statusElement.nextSibling);
            }
        }
        
        // Запускаем проверку с задержкой, чтобы все элементы успели загрузиться
        setTimeout(checkRussianLogo, 1000);
        
        // Также можно использовать MutationObserver для динамического контента
        let observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (!document.querySelector('.full-start__ru-title')) {
                    checkRussianLogo();
                }
            });
        });
        
        // Начинаем наблюдение
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
})();