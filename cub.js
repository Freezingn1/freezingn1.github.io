lampa_plugin({
    name: 'cub search',
    version: '1.0',
    description: 'Автоматически использует поиск по CUB',
    author: 'Ваше имя',
    
    // Инициализация плагина
    init: function(){
        let originalSearch = lampa.search;
        
        // Переопределяем метод поиска
        lampa.search = function(query, callback){
            // Заменяем стандартный поиск на поиск по CUB
            lampa.request('cub://search?query=' + encodeURIComponent(query), function(data){
                // Обрабатываем результаты для совместимости
                let results = [];
                
                if(data && data.results){
                    results = data.results.map(item => {
                        return {
                            title: item.title,
                            year: item.year,
                            description: item.description,
                            poster: item.poster,
                            link: item.link
                        };
                    });
                }
                
                // Вызываем оригинальный callback с преобразованными данными
                callback(results);
            });
        };
        
        console.log('CUB Search plugin activated');
    }
});