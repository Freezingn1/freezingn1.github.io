(function() {

    console.log('Активирован плагин "Auto CUB Search"');

    // 1. Перехватываем открытие поиска
    const originalSearchShow = Lampa.Search.show;
    Lampa.Search.show = function() {
        originalSearchShow.apply(this, arguments);
        
        // 2. Ждём, пока появится селектор источников
        setTimeout(() => {
            const sourceSelector = document.querySelector('.search-source-selector select');
            if (!sourceSelector) {
                console.warn('Не найден search-source-selector!');
                return;
            }

            // 3. Находим опцию CUB (может называться "cub", "CUB" или иначе)
            const cubOption = Array.from(sourceSelector.options).find(
                opt => opt.value.toLowerCase().includes('cub')
            );

            if (cubOption) {
                // 4. Принудительно выбираем CUB
                sourceSelector.value = cubOption.value;
                sourceSelector.dispatchEvent(new Event('change'));
                console.log('Автоматически выбран источник:', cubOption.value);
            } else {
                console.warn('CUB не найден в списке источников!');
            }
        }, 300); // Задержка для прогрузки интерфейса
    };
})();