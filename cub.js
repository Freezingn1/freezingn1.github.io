(function() {
    'use strict';

    // Базовые настройки CUB API
    const CUB_API = {
        baseUrl: 'https://api.cub.red/v1/',
        apiKey: '', // Ваш API ключ (если требуется)
        defaultParams: {
            lang: Lampa.Storage.get('language') || 'ru',
            limit: 20
        }
    };

    // Жанры для CUB (адаптированные под их систему)
    const allGenres = [
        { id: 'action', title: 'surs_genre_action' },
        { id: 'comedy', title: 'surs_genre_comedy' },
        { id: 'drama', title: 'surs_genre_drama' },
        { id: 'animation', title: 'surs_genre_animation' },
        { id: 'family', title: 'surs_genre_family' },
        { id: 'fantasy', title: 'surs_genre_fantasy' }
    ];

    // Стриминговые сервисы для CUB
    const allStreamingServices = [
        { id: 'cub', title: 'CUB' },
        { id: 'ivi', title: 'Иви' },
        { id: 'kinopoisk', title: 'Кинопоиск' }
    ];

    // Функция для запросов к CUB API
    function cubRequest(endpoint, params = {}, callback, errorCallback) {
        const urlParams = new URLSearchParams({
            ...CUB_API.defaultParams,
            ...params
        });

        if (CUB_API.apiKey) {
            urlParams.append('api_key', CUB_API.apiKey);
        }

        const url = `${CUB_API.baseUrl}${endpoint}?${urlParams.toString()}`;
        
        Lampa.Reguest.json(url, (json) => {
            if (json && !json.error) {
                callback(json);
            } else {
                errorCallback(json?.error || 'Unknown error');
            }
        }, errorCallback);
    }

    // Адаптер результатов CUB под структуру Lampa
    function adaptCubItems(items) {
        return items.map(item => ({
            id: item.id,
            title: item.title || item.name,
            original_title: item.original_title,
            poster_path: item.poster || item.cover,
            backdrop_path: item.backdrop || item.background,
            overview: item.description || item.overview,
            vote_average: item.rating || 0,
            vote_count: item.votes || 0,
            release_date: item.year ? `${item.year}-01-01` : '',
            first_air_date: item.released || '',
            media_type: item.type === 'series' ? 'tv' : 'movie'
        }));
    }

    // Основной источник CUB
    var SourceCUB = function(parent) {
        this.network = new Lampa.Reguest();
        this.discovery = false;

        this.main = function(params = {}, onComplete, onError) {
            const partsLimit = 15;
            const partsData = [];

            // Популярные фильмы
            partsData.push(callback => {
                cubRequest('movies/popular', { limit: 20 }, (json) => {
                    callback({
                        results: adaptCubItems(json.items || []),
                        title: Lampa.Lang.translate('surs_popular_movies')
                    });
                }, () => callback({ results: [] }));
            });

            // Популярные сериалы
            partsData.push(callback => {
                cubRequest('series/popular', { limit: 20 }, (json) => {
                    callback({
                        results: adaptCubItems(json.items || []),
                        title: Lampa.Lang.translate('surs_popular_series')
                    });
                }, () => callback({ results: [] }));
            });

            // Поиск по жанрам
            getGenres().forEach(genre => {
                partsData.push(callback => {
                    cubRequest('search', { 
                        genre: genre.id,
                        sort: 'popular',
                        limit: 20
                    }, (json) => {
                        callback({
                            results: adaptCubItems(json.items || []),
                            title: `${Lampa.Lang.translate('surs_genre')}: ${Lampa.Lang.translate(genre.title)}`
                        });
                    }, () => callback({ results: [] }));
                });
            });

            // Функция загрузки частей
            function loadPart(partLoaded, partEmpty) {
                Lampa.Api.partNext(partsData, partsLimit, partLoaded, partEmpty);
            }

            loadPart(onComplete, onError);
            return loadPart;
        };

        // Поиск
        this.search = function(params, callback) {
            cubRequest('search', { 
                query: params.query,
                limit: 30
            }, (json) => {
                callback({ 
                    results: adaptCubItems(json.items || []),
                    page: params.page || 1,
                    total_pages: Math.ceil((json.total || 0) / 30)
                });
            }, () => callback({ results: [] }));
        };
    };

    // Детский источник
    var SourceCUBkids = function(parent) {
        this.network = new Lampa.Reguest();
        this.discovery = false;

        this.main = function(params = {}, onComplete, onError) {
            const partsLimit = 10;
            const partsData = [];

            // Детские фильмы
            partsData.push(callback => {
                cubRequest('movies', { 
                    genre: 'family,animation',
                    age_rating: '0+,6+',
                    limit: 20
                }, (json) => {
                    callback({
                        results: adaptCubItems(json.items || []),
                        title: Lampa.Lang.translate('surs_kids_movies')
                    });
                }, () => callback({ results: [] }));
            });

            // Детские сериалы
            partsData.push(callback => {
                cubRequest('series', { 
                    genre: 'family,animation',
                    age_rating: '0+,6+',
                    limit: 20
                }, (json) => {
                    callback({
                        results: adaptCubItems(json.items || []),
                        title: Lampa.Lang.translate('surs_kids_series')
                    });
                }, () => callback({ results: [] }));
            });

            function loadPart(partLoaded, partEmpty) {
                Lampa.Api.partNext(partsData, partsLimit, partLoaded, partEmpty);
            }

            loadPart(onComplete, onError);
            return loadPart;
        };
    };

    // Функция добавления источников
    function add() {
        const sourceName = Lampa.Storage.get('surs_name') || 'CUB';
        const sourceNameKids = sourceName + ' KIDS';

        Lampa.Api.sources.cub = new SourceCUB();
        Lampa.Api.sources.cub_kids = new SourceCUBkids();

        Object.defineProperty(Lampa.Api.sources, sourceName, {
            get: () => Lampa.Api.sources.cub
        });

        Object.defineProperty(Lampa.Api.sources, sourceNameKids, {
            get: () => Lampa.Api.sources.cub_kids
        });

        Lampa.Params.select('source', {
            ...Lampa.Params.values['source'],
            [sourceName]: sourceName,
            [sourceNameKids]: sourceNameKids
        }, 'tmdb');
    }

    // Инициализация
    if (window.appready) {
        add();
    } else {
        Lampa.Listener.follow('app', e => {
            if (e.type == 'ready') add();
        });
    }

})();