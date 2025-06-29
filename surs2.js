(function () {
    'use strict';

    // Опции сортировки
    var allSortOptions = [
        { id: 'vote_count.desc', title: 'surs_vote_count_desc' },
        { id: 'vote_average.desc', title: 'surs_vote_average_desc' },
        { id: 'first_air_date.desc', title: 'surs_first_air_date_desc' },
        { id: 'popularity.desc', title: 'surs_popularity_desc' },
        { id: 'revenue.desc', title: 'surs_revenue_desc' }
    ];

    // Жанры фильмов
    var allGenres = [
        { id: 28, title: 'surs_genre_action' },
        { id: 35, title: 'surs_genre_comedy' },
        { id: 18, title: 'surs_genre_drama' },
        { id: 10749, title: 'surs_genre_romance' },
        { id: 16, title: 'surs_genre_animation' },
        { id: 10762, title: 'surs_genre_kids' },
        { id: 12, title: 'surs_genre_adventure' },
        { id: 80, title: 'surs_genre_crime' },
        { id: 9648, title: 'surs_genre_mystery' },
        { id: 878, title: 'surs_genre_sci_fi' },
        { id: 37, title: 'surs_genre_western' },
        { id: 53, title: 'surs_genre_thriller' },
        { id: 10751, title: 'surs_genre_family' },
        { id: 14, title: 'surs_genre_fantasy' },
        { id: 10764, title: 'surs_genre_reality' },
        { id: 10759, title: 'surs_genre_action_adventure' },
        { id: 10766, title: 'surs_genre_soap' },
        { id: 10767, title: 'surs_genre_talk_show' }
    ];

    // Стриминговые сервисы
    var allStreamingServices = [
        { id: 49, title: 'HBO' },
        { id: 77, title: 'SyFy' },
        { id: 2552, title: 'Apple TV+' },
        { id: 453, title: 'Hulu' },
        { id: 1024, title: 'Amazon Prime' },
        { id: 213, title: 'Netflix' },
        { id: 3186, title: 'HBO Max' },
        { id: 2076, title: 'Paramount network' },
        { id: 4330, title: 'Paramount+' },
        { id: 3353, title: 'Peacock' },
        { id: 2739, title: 'Disney+' },
        { id: 2, title: 'ABC' },
        { id: 6, title: 'NBC' },
        { id: 16, title: 'CBS' },
        { id: 318, title: 'Starz' },
        { id: 174, title: 'AMC' },
        { id: 19, title: 'FOX' },
        { id: 64, title: 'Discovery' },
        { id: 1778, title: 'test' },
        { id: 493, title: 'BBC America' },
        { id: 88, title: 'FX' },
        { id: 67, title: 'Showtime' }
    ];

    var allStreamingServicesRUS = [
        { id: 2493, title: 'Start' },
        { id: 2859, title: 'Premier' },
        { id: 4085, title: 'KION' },
        { id: 3923, title: 'ИВИ' },
        { id: 412, title: 'Россия 1' },
        { id: 558, title: 'Первый канал' },
        { id: 3871, title: 'Okko' },
        { id: 3827, title: 'Кинопоиск' },
        { id: 5806, title: 'Wink' },
        { id: 806, title: 'СТС' },
        { id: 1191, title: 'ТНТ' },
        { id: 1119, title: 'НТВ' },
        { id: 3031, title: 'Пятница' },
        { id: 3882, title: 'More.TV' }
    ];

    // Функция получения всех настроек
    function getAllStoredSettings() {
        return Lampa.Storage.get('surs_settings') || {};
    }

    // Функция получения настроек текущего пользователя
    function getProfileSettings() {
        var profileId = Lampa.Storage.get('lampac_profile_id', '') || 'default';
        var allSettings = getAllStoredSettings();

        if (!allSettings.hasOwnProperty(profileId)) {
            allSettings[profileId] = {};
            saveAllStoredSettings(allSettings);
        }

        return allSettings[profileId];
    }

    // Функция сохранения всех настроек
    function saveAllStoredSettings(settings) {
        Lampa.Storage.set('surs_settings', settings);
    }

    // Функция получения конкретного сохраненного значения (по умолчанию true)
    function getStoredSetting(key, defaultValue) {
        var profileSettings = getProfileSettings();
        return profileSettings.hasOwnProperty(key) ? profileSettings[key] : defaultValue;
    }

    // Функция сохранения отдельного значения
    function setStoredSetting(key, value) {
        var allSettings = getAllStoredSettings();
        var profileId = Lampa.Storage.get('lampac_profile_id', '') || 'default';

        if (!allSettings.hasOwnProperty(profileId)) {
            allSettings[profileId] = {};
        }

        allSettings[profileId][key] = value;
        saveAllStoredSettings(allSettings);
    }

    // Функция фильтрации включенных элементов
    function getEnabledItems(allItems, storageKeyPrefix) {
        var result = [];
        for (var i = 0; i < allItems.length; i++) {
            if (getStoredSetting(storageKeyPrefix + allItems[i].id, true)) {
                result.push(allItems[i]);
            }
        }
        return result;
    }

    function getSortOptions() {
        return getEnabledItems(allSortOptions, 'sort_');
    }

    function getGenres() {
        return getEnabledItems(allGenres, 'genre_');
    }

    function getStreamingServices() {
        return getEnabledItems(allStreamingServices, 'streaming_');
    }

    function getStreamingServicesRUS() {
        return getEnabledItems(allStreamingServicesRUS, 'streaming_rus_');
    }

    function startPlugin() {
        window.plugin_tmdb_mod_ready = true;

        var Episode = function (data) {
            var card = data.card || data;
            var episode = data.next_episode_to_air || data.episode || {};
            if (card.source == undefined) card.source = 'tmdb';
            Lampa.Arrays.extend(card, {
                title: card.name,
                original_title: card.original_name,
                release_date: card.first_air_date
            });
            card.release_year = ((card.release_date || '0000') + '').slice(0, 4);

            function remove(elem) {
                if (elem) elem.remove();
            }

            this.build = function () {
                this.card = Lampa.Template.js('card_episode');
                this.img_poster = this.card.querySelector('.card__img') || {};
                this.img_episode = this.card.querySelector('.full-episode__img img') || {};
                this.card.querySelector('.card__title').innerText = card.title;
                this.card.querySelector('.full-episode__num').innerText = card.unwatched || '';
                if (episode && episode.air_date) {
                    this.card.querySelector('.full-episode__name').innerText = ('Сезон ' + (episode.season_number || '?') + ' ') + (episode.name || Lampa.Lang.translate('surs_noname'));
                    this.card.querySelector('.full-episode__date').innerText = episode.air_date ? Lampa.Utils.parseTime(episode.air_date).full : '----';
                }

                if (card.release_year == '0000') {
                    remove(this.card.querySelector('.card__age'));
                } else {
                    this.card.querySelector('.card__age').innerText = card.release_year;
                }

                this.card.addEventListener('visible', this.visible.bind(this));
            };

            this.image = function () {
                var _this = this;
                this.img_poster.onload = function () {};
                this.img_poster.onerror = function () {
                    _this.img_poster.src = './img/img_broken.svg';
                };
                this.img_episode.onload = function () {
                    _this.card.querySelector('.full-episode__img').classList.add('full-episode__img--loaded');
                };
                this.img_episode.onerror = function () {
                    _this.img_episode.src = './img/img_broken.svg';
                };
            };

            this.create = function () {
                var _this2 = this;
                this.build();
                this.card.addEventListener('hover:focus', function () {
                    if (_this2.onFocus) _this2.onFocus(_this2.card, card);
                });
                this.card.addEventListener('hover:hover', function () {
                    if (_this2.onHover) _this2.onHover(_this2.card, card);
                });
                this.card.addEventListener('hover:enter', function () {
                    if (_this2.onEnter) _this2.onEnter(_this2.card, card);
                });
                this.image();
            };

            this.visible = function () {
                if (card.poster_path) this.img_poster.src = Lampa.Api.img(card.poster_path);
                else if (card.profile_path) this.img_poster.src = Lampa.Api.img(card.profile_path);
                else if (card.poster) this.img_poster.src = card.poster;
                else if (card.img) this.img_poster.src = card.img;
                else this.img_poster.src = './img/img_broken.svg';
                if (card.still_path) this.img_episode.src = Lampa.Api.img(episode.still_path, 'w300');
                else if (card.backdrop_path) this.img_episode.src = Lampa.Api.img(card.backdrop_path, 'w300');
                else if (episode.img) this.img_episode.src = episode.img;
                else if (card.img) this.img_episode.src = card.img;
                else this.img_episode.src = './img/img_broken.svg';
                if (this.onVisible) this.onVisible(this.card, card);
            };

            this.destroy = function () {
                this.img_poster.onerror = function () {};
                this.img_poster.onload = function () {};
                this.img_episode.onerror = function () {};
                this.img_episode.onload = function () {};
                this.img_poster.src = '';
                this.img_episode.src = '';
                remove(this.card);
                this.card = null;
                this.img_poster = null;
                this.img_episode = null;
            };

            this.render = function (js) {
                return js ? this.card : $(this.card);
            };
        };

        var SourceTMDB = function (parent) {
            this.network = new Lampa.Reguest();
            this.discovery = false;

            this.main = function () {
                var owner = this;
                var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                var onComplete = arguments.length > 1 ? arguments[1] : undefined;
                var onError = arguments.length > 2 ? arguments[2] : undefined;
                var partsLimit = 6;

                function filterCyrillic(items) {
                    var storedValue = getStoredSetting('cirillic');
                    var isFilterEnabled = storedValue === '1' || storedValue === null || storedValue === undefined || storedValue === '';

                    if (!isFilterEnabled) {
                        return items;
                    }

                    function containsCyrillic(value) {
                        if (typeof value === 'string') {
                            return /[а-яА-ЯёЁ]/.test(value);
                        } else if (typeof value === 'object' && value !== null) {
                            var keys = Object.keys(value);
                            for (var i = 0; i < keys.length; i++) {
                                if (containsCyrillic(value[keys[i]])) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }

                    var filteredItems = items.filter(function (item) {
                        return containsCyrillic(item);
                    });

                    var excludedItems = items.filter(function (item) {
                        return !containsCyrillic(item);
                    });

                    return filteredItems;
                }

                function applyFilters(items) {
                    items = filterCyrillic(items);
                    return items;
                }

                function applyMinVotes(baseUrl) {
                    var minVotes = getStoredSetting('minVotes');
                    minVotes = parseInt(minVotes, 10);
                    if (isNaN(minVotes)) {
                        minVotes = 10;
                    }

                    if (minVotes > 0) {
                        baseUrl += '&vote_count.gte=' + minVotes;
                    }

                    return baseUrl;
                }

                function applyAgeRestriction(baseUrl) {
                    var ageRestriction = getStoredSetting('ageRestrictions');

                    if (ageRestriction && String(ageRestriction).trim() !== '') {
                        var certificationMap = {
                            '0+': '0+',
                            '6+': '6+',
                            '12+': '12+',
                            '16+': '16+',
                            '18+': '18+'
                        };

                        if (certificationMap.hasOwnProperty(ageRestriction)) {
                            baseUrl += '&certification_country=RU&certification=' + encodeURIComponent(certificationMap[ageRestriction]);
                        }
                    }

                    return baseUrl;
                }

                function excludeAsia(baseUrl) {
                    return baseUrl;
                }

                function applyWithoutKeywords(baseUrl) {
                    var filterLevel = getStoredSetting('withoutKeywords');
                    var baseExcludedKeywords = [
                        '346488',
                        '158718',
                        '41278'
                    ];

                    if (!filterLevel || filterLevel == '1') {
                        baseExcludedKeywords.push(
                            '13141',
                            '345822',
                            '315535',
                            '290667',
                            '323477',
                            '290609'
                        );
                    }

                    if (filterLevel == '2') {
                        baseExcludedKeywords.push(
                            '210024',
                            '13141',
                            '345822',
                            '315535',
                            '290667',
                            '323477',
                            '290609'
                        );
                    }

                    baseUrl += '&without_keywords=' + encodeURIComponent(baseExcludedKeywords.join(','));

                    return baseUrl;
                }

                function buildApiUrl(baseUrl) {
                    baseUrl = applyMinVotes(baseUrl);
                    baseUrl = applyAgeRestriction(baseUrl);
                    baseUrl = applyWithoutKeywords(baseUrl);
                    return baseUrl;
                }

                function shuffleArray(array) {
                    for (var i = array.length - 1; i > 0; i--) {
                        var j = Math.floor(Math.random() * (i + 1));
                        var temp = array[i];
                        array[i] = array[j];
                        array[j] = temp;
                    }
                }

                function adjustSortForMovies(sort) {
                    if (sort.id === 'first_air_date.desc') {
                        sort = { id: 'release_date.desc', title: 'surs_first_air_date_desc' };
                    }

                    if (sort.id === 'release_date.desc') {
                        var endDate = new Date();
                        endDate.setDate(endDate.getDate() - 25);
                        endDate = endDate.toISOString().split('T')[0];

                        var startDate = new Date();
                        startDate.setFullYear(startDate.getFullYear() - 1);
                        startDate = startDate.toISOString().split('T')[0];

                        sort.extraParams = '&release_date.gte=' + startDate + '&release_date.lte=' + endDate;
                    }

                    return sort;
                }

                function adjustSortForTVShows(sort) {
                    if (sort.id === 'first_air_date.desc') {
                        var endDate = new Date();
                        endDate.setDate(endDate.getDate() - 10);
                        endDate = endDate.toISOString().split('T')[0];

                        var startDate = new Date();
                        startDate.setFullYear(startDate.getFullYear() - 1);
                        startDate = startDate.toISOString().split('T')[0];
                        sort.extraParams = '&first_air_date.gte=' + startDate + '&first_air_date.lte=' + endDate;
                    }

                    return sort;
                }

                var partsData = [
                    function (callback) {
                        var baseUrl = 'trending/all/week';
                        baseUrl = applyAgeRestriction(baseUrl);

                        owner.get(baseUrl, params, function (json) {
                            if (json.results) {
                                json.results = json.results.filter(function (result) {
                                    var forbiddenCountries = ['KR', 'CN', 'JP'];
                                    return !result.origin_country || !result.origin_country.some(function (country) {
                                        return forbiddenCountries.includes(country);
                                    });
                                });
                                
                                if (getStoredSetting('shuffleTrending', true)) {
                                    shuffleArray(json.results);
                                }
                            }
                            json.title = Lampa.Lang.translate('surs_title_trend_week');
                            callback(json);
                        }, callback);
                    }
                ];

                var CustomData = [];

                var upcomingEpisodesRequest = function (callback) {
                    callback({
                        source: 'tmdb',
                        results: Lampa.TimeTable.lately().slice(0, 20),
                        title: Lampa.Lang.translate('surs_title_upcoming_episodes'),
                        nomore: true,
                        cardClass: function (_elem, _params) {
                            return new Episode(_elem, _params);
                        }
                    });
                };

                function getPopularPersons() {
                    return function (callback) {
                        var baseUrl = 'person/popular';

                        owner.get(baseUrl, params, function (json) {
                            if (json.results) {
                                json.results = json.results.filter(function (result) {
                                    return true;
                                });
                            }
                            json.title = Lampa.Lang.translate('surs_popular_persons');
                            callback(json);
                        }, callback);
                    };
                }

                function getStreamingWithGenres(serviceName, serviceId, isRussian) {
                    return function (callback) {
                        var sortOptions = getSortOptions();
                        var genres = getGenres();

                        var sort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
                        var genre = genres[Math.floor(Math.random() * genres.length)];

                        var apiUrl = 'discover/tv?with_networks=' + serviceId +
                                     '&with_genres=' + genre.id +
                                     '&sort_by=' + sort.id;

                        if (isRussian) {
                            apiUrl = applyAgeRestriction(apiUrl);
                            apiUrl = applyWithoutKeywords(apiUrl);
                        } else {
                            apiUrl = buildApiUrl(apiUrl);
                        }
                        apiUrl = excludeAsia(apiUrl);

                        owner.get(apiUrl, params, function (json) {
                            if (json.results) {
                                json.results = applyFilters(json.results);
                            }

                            json.title = Lampa.Lang.translate(sort.title) + ' (' + Lampa.Lang.translate(genre.title) + ') ' + Lampa.Lang.translate('surs_on') + ' ' + serviceName;
                            callback(json);
                        }, callback);
                    };
                }

                function getStreaming(serviceName, serviceId, isRussian) {
                    return function (callback) {
                        var sortOptions = getSortOptions();
                        var sort = sortOptions[Math.floor(Math.random() * sortOptions.length)];

                        var apiUrl = 'discover/tv?with_networks=' + serviceId +
                                     '&sort_by=' + sort.id;

                        if (isRussian) {
                            apiUrl = applyAgeRestriction(apiUrl);
                            apiUrl = applyWithoutKeywords(apiUrl);
                        } else {
                            apiUrl = buildApiUrl(apiUrl);
                        }
                        apiUrl = excludeAsia(apiUrl);

                        owner.get(apiUrl, params, function (json) {
                            if (json.results) {
                                json.results = applyFilters(json.results);
                            }

                            json.title = Lampa.Lang.translate(sort.title) + ' ' + Lampa.Lang.translate('surs_on') + ' ' + serviceName;
                            callback(json);
                        }, callback);
                    };
                }

                function getSelectedStreamingServices() {
                    var includeGlobal = getStoredSetting('getStreamingServices', true);
                    var includeRussian = getStoredSetting('getStreamingServicesRUS', true);

                    var streamingServices = getStreamingServices();
                    var streamingServicesRUS = getStreamingServicesRUS();

                    if (includeGlobal && includeRussian) {
                        return streamingServices.concat(streamingServicesRUS);
                    } else if (includeGlobal) {
                        return streamingServices;
                    } else if (includeRussian) {
                        return streamingServicesRUS;
                    }
                    return [];
                }

                var selectedStreamingServices = getSelectedStreamingServices();

                selectedStreamingServices.forEach(function (service) {
                    var isRussian = getStreamingServicesRUS().some(rusService => rusService.id === service.id);
                    CustomData.push(getStreamingWithGenres(service.title, service.id, isRussian));
                });

                selectedStreamingServices.forEach(function (service) {
                    var isRussian = getStreamingServicesRUS().some(rusService => rusService.id === service.id);
                    CustomData.push(getStreaming(service.title, service.id, isRussian));
                });

                function getMovies(genre, options) {
                    options = options || {};

                    return function (callback) {
                        var sortOptions = getSortOptions();
                        var sort = adjustSortForMovies(sortOptions[Math.floor(Math.random() * sortOptions.length)]);
                        var apiUrl = 'discover/movie?with_genres=' + genre.id + '&sort_by=' + sort.id;

                        if (options.russian) {
                            apiUrl += '&with_origin_country=RU';
                        }
                        
                        if (options.ukrainian) {
                            apiUrl += '&with_origin_country=UA';
                        }

                        if (sort.extraParams) {
                            apiUrl += sort.extraParams;
                        }

                        apiUrl = buildApiUrl(apiUrl);
                        apiUrl = excludeAsia(apiUrl);

                        owner.get(apiUrl, params, function (json) {
                            if (!options.russian && !options.ukrainian) {
                                json.results = applyFilters(json.results);
                            }
                            var titlePrefix = options.russian ? Lampa.Lang.translate('surs_russian') :
                                             
                                             options.ukrainian ? Lampa.Lang.translate('surs_ukrainian') : '';
                            json.title = Lampa.Lang.translate(sort.title) + ' ' + titlePrefix + ' (' + Lampa.Lang.translate(genre.title) + ')';
                            callback(json);
                        }, callback);
                    };
                }

                function getTVShows(genre, options) {
                    options = options || {};

                    return function (callback) {
                        var sortOptions = getSortOptions();
                        var sort = adjustSortForTVShows(sortOptions[Math.floor(Math.random() * sortOptions.length)]);
                        var apiUrl = 'discover/tv?with_genres=' + genre.id + '&sort_by=' + sort.id;

                        if (options.russian) {
                            apiUrl += '&with_origin_country=RU';
                        }
                        if (options.korean) {
                            apiUrl += '&with_origin_country=KR';
                        }
                        if (options.turkish) {
                            apiUrl += '&with_origin_country=TR';
                        }
                        if (options.ukrainian) {
                            apiUrl += '&with_origin_country=UA';
                        }

                        if (sort.extraParams) {
                            apiUrl += sort.extraParams;
                        }

                        apiUrl = buildApiUrl(apiUrl);

                        owner.get(apiUrl, params, function (json) {
                            if (!options.russian && !options.ukrainian) {
                                json.results = applyFilters(json.results);
                            }
                            var titlePrefix = options.russian ? Lampa.Lang.translate('surs_russian') :
                                             options.korean ? Lampa.Lang.translate('surs_korean') :
                                             options.turkish ? Lampa.Lang.translate('surs_turkish') :
                                             options.ukrainian ? Lampa.Lang.translate('surs_ukrainian') : '';
                            json.title = Lampa.Lang.translate(sort.title) + ' ' + titlePrefix + ' ' + Lampa.Lang.translate('surs_tv_shows') + ' (' + Lampa.Lang.translate(genre.title) + ')';
                            callback(json);
                        }, callback);
                    };
                }

                var genres = getGenres();

                var isUkrainianLanguage = Lampa.Storage.get('language') === 'uk';

                var includeGlobalMovies = getStoredSetting('getMoviesByGenreGlobal', true);
                var includeRussianMovies = getStoredSetting('getMoviesByGenreRus', true);
                var includeUkrainianMovies = getStoredSetting('getMoviesByGenreUA', isUkrainianLanguage);

                var isGlobalTVEnabled = getStoredSetting('getTVShowsByGenreGlobal', true);
                var isRussianTVEnabled = getStoredSetting('getTVShowsByGenreRus', true);
                var isKoreanTVEnabled = getStoredSetting('getTVShowsByGenreKOR', false);
                var isTurkishTVEnabled = getStoredSetting('getTVShowsByGenreTR', true);
                var isUkrainianTVEnabled = getStoredSetting('getTVShowsByGenreUA', isUkrainianLanguage);

                genres.forEach(function (genre) {
                    if (includeGlobalMovies) {
                        CustomData.push(getMovies(genre));
                    }
                    if (includeRussianMovies) {
                        CustomData.push(getMovies(genre, { russian: true }));
                    }
                    if (includeUkrainianMovies) {
                        CustomData.push(getMovies(genre, { ukrainian: true }));
                    }
                });

                genres.forEach(function (genre) {
                    if (isGlobalTVEnabled) {
                        CustomData.push(getTVShows(genre));
                    }
                    if (isRussianTVEnabled) {
                        CustomData.push(getTVShows(genre, { russian: true }));
                    }
                    if (isKoreanTVEnabled) {
                        CustomData.push(getTVShows(genre, { korean: true }));
                    }
                    if (isTurkishTVEnabled) {
                        CustomData.push(getTVShows(genre, { turkish: true }));
                    }
                    if (isUkrainianTVEnabled) {
                        CustomData.push(getTVShows(genre, { ukrainian: true }));
                    }
                });

                function getBestContentByGenre(genre, contentType) {
                    return function (callback) {
                        var apiUrl = 'discover/' + contentType + '?with_genres=' + genre.id +
                                    '&sort_by=vote_average.desc' +
                                    '&vote_count.gte=500';

                        apiUrl = applyAgeRestriction(apiUrl);
                        apiUrl = applyWithoutKeywords(apiUrl);
                        apiUrl = excludeAsia(apiUrl);

                        owner.get(apiUrl, params, function (json) {
                            if (json.results) {
                                json.results = filterCyrillic(json.results);
                            }

                            json.title = Lampa.Lang.translate(contentType === 'movie' ? 'surs_top_movies' : 'surs_top_tv') + ' (' + Lampa.Lang.translate(genre.title) + ')';
                            callback(json);
                        }, callback);
                    };
                }

                genres.forEach(function (genre) {
                    var isMoviesEnabled = getStoredSetting('getBestContentByGenreMovie', true);
                    var isTVEnabled = getStoredSetting('getBestContentByGenreTV', true);

                    if (isMoviesEnabled) {
                        CustomData.push(getBestContentByGenre(genre, 'movie'));
                    }

                    if (isTVEnabled) {
                        CustomData.push(getBestContentByGenre(genre, 'tv'));
                    }
                });

                function getBestContentByGenreAndPeriod(type, genre, startYear, endYear) {
                    return function (callback) {
                        var baseUrl = 'discover/' + type + '?with_genres=' + genre.id +
                                    '&sort_by=vote_average.desc' +
                                    '&vote_count.gte=100' +
                                    '&' + (type === 'movie' ? 'primary_release_date' : 'first_air_date') + '.gte=' + startYear + '-01-01' +
                                    '&' + (type === 'movie' ? 'primary_release_date' : 'first_air_date') + '.lte=' + endYear + '-12-31';

                        baseUrl = applyAgeRestriction(baseUrl);
                        baseUrl = applyWithoutKeywords(baseUrl);
                        baseUrl = excludeAsia(baseUrl);

                        owner.get(baseUrl, params, function (json) {
                            if (json.results) {
                                json.results = applyFilters(json.results).filter(function (content) {
                                    var dateField = type === 'movie' ? 'release_date' : 'first_air_date';
                                    return content[dateField] &&
                                        parseInt(content[dateField].substring(0, 4)) >= startYear &&
                                        parseInt(content[dateField].substring(0, 4)) <= endYear;
                                });
                            }

                            json.title = Lampa.Lang.translate(type === 'movie' ? 'surs_top_movies' : 'surs_top_tv') +
                                         ' (' + Lampa.Lang.translate(genre.title) + ')' +
                                         Lampa.Lang.translate('surs_for_period') + startYear + '-' + endYear;
                            callback(json);
                        }, callback);
                    };
                }

                var periods = [
                    { start: 1970, end: 1974 },
                    { start: 1975, end: 1979 },
                    { start: 1980, end: 1984 },
                    { start: 1985, end: 1989 },
                    { start: 1990, end: 1994 },
                    { start: 1995, end: 1999 },
                    { start: 2000, end: 2004 },
                    { start: 2005, end: 2009 },
                    { start: 2010, end: 2014 },
                    { start: 2015, end: 2019 },
                    { start: 2020, end: 2025 }
                ];

                function getRandomPeriod() {
                    var index = Math.floor(Math.random() * periods.length);
                    return periods[index];
                }

                genres.forEach(function (genre) {
                    var useMovies = getStoredSetting('getBestContentByGenreAndPeriod_movie', true);
                    var useTV = getStoredSetting('getBestContentByGenreAndPeriod_tv', true);

                    var period1 = getRandomPeriod();
                    var period2 = getRandomPeriod();

                    while (period2.start === period1.start && period2.end === period1.end) {
                        period2 = getRandomPeriod();
                    }

                    [period1, period2].forEach(function (period) {
                        if (useMovies) {
                            CustomData.push(getBestContentByGenreAndPeriod('movie', genre, period.start, period.end));
                        }
                        if (useTV) {
                            CustomData.push(getBestContentByGenreAndPeriod('tv', genre, period.start, period.end));
                        }
                    });
                });

                function randomWideFlag() {
                    return Math.random() < 0.1;
                }

                function wrapWithWideFlag(requestFunc) {
                    return function (callback) {
                        requestFunc(function (json) {
                            if (randomWideFlag()) {
                                json.small = true;
                                json.wide = true;

                                if (Array.isArray(json.results)) {
                                    json.results.forEach(function (card) {
                                        card.promo = card.overview;
                                        card.promo_title = card.title || card.name;
                                    });
                                }
                            }
                            callback(json);
                        });
                    };
                }

                CustomData = CustomData.map(wrapWithWideFlag);

                shuffleArray(CustomData);
                CustomData.splice(4, 0, upcomingEpisodesRequest);

                var combinedData = partsData.concat(CustomData);

                function loadPart(partLoaded, partEmpty) {
                    Lampa.Api.partNext(combinedData, partsLimit, partLoaded, partEmpty);
                }

                loadPart(onComplete, onError);
                return loadPart;
            };
        };

        function add() {
            var sourceName = Lampa.Storage.get('surs_name') || 'SURS';
            var tmdb_mod = Object.assign({}, Lampa.Api.sources.tmdb, new SourceTMDB(Lampa.Api.sources.tmdb));
            Lampa.Api.sources.tmdb_mod = tmdb_mod;

            Object.defineProperty(Lampa.Api.sources, sourceName, {
                get: function() {
                    return tmdb_mod;
                }
            });

            Lampa.Params.select('source', Object.assign({}, Lampa.Params.values['source'], {
                [sourceName]: sourceName
            }), 'tmdb');
        }

        if (window.appready) {
            add();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') {
                    add();
                }
            });
        }
    }

    if (!window.plugin_tmdb_mod_ready) startPlugin();
})();