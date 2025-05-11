(function() {
    // Проверяем, существует ли Lampa
    if (typeof Lampa === 'undefined') {
        console.error('Lampa не найдена!');
        return;
    }

    // Сохраняем оригинальный метод поиска
    const originalSearch = Lampa.Search.search;

    // Переопределяем поиск
    Lampa.Search.search = function(params) {
        // Если запрос пустой, возвращаем оригинальный поиск
        if (!params.query) {
            return originalSearch.call(this, params);
        }

        console.log('Используем поиск через CUB вместо стандартного');

        // Подменяем запрос на CUB
        params.source = 'cub'; // Или другой идентификатор CUB
        // Либо можно полностью заменить логику:
        return Lampa.Request.json('cub://search?query=' + encodeURIComponent(params.query))
            .then((data) => {
                // Преобразуем ответ CUB в формат Lampa
                const results = (data.results || []).map(item => ({
                    title: item.title,
                    year: item.year,
                    description: item.description || '',
                    poster: item.poster || '',
                    link: item.link || '',
                    // Дополнительные поля, если нужны
                }));

                // Возвращаем результаты в нужном формате
                return {
                    results: results,
                    hasMore: data.has_more || false
                };
            })
            .catch((error) => {
                console.error('Ошибка поиска через CUB:', error);
                // Возвращаем оригинальный поиск в случае ошибки
                return originalSearch.call(this, params);
            });
    };

    console.log('Плагин "CUB Search" успешно активирован!');
})();