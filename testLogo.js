!function() {
    "use strict";
    
    Lampa.SettingsApi.addParam({
        component: "interface",
        param: {
            name: "logo_glav",
            type: "select",
            values: { 1: "Скрыть", 0: "Отображать" },
            default: "0"
        },
        field: {
            name: "Логотипы вместо названий",
            description: "Отображает логотипы фильмов вместо текста"
        }
    });

    window.logoplugin || (window.logoplugin = !0, Lampa.Listener.follow("full", function(a) {
        if ("complite" === a.type && "1" !== Lampa.Storage.get("logo_glav")) {
            var e = a.data.movie;
            
            // Для аниме пробуем сначала Shikimori/AniList, если TMDB не дал лого
            var title = e.title || e.name;
            var isAnime = e.genres?.some(g => g.name.toLowerCase().includes("аниме")) 
                          || /аниме|anime/i.test(title);

            // 1. Запрос логотипа из TMDB
            var tmdbUrl = Lampa.TMDB.api(e.name ? "tv" : "movie") + "/" + e.id + "/images?api_key=" + Lampa.TMDB.key();
            
            $.get(tmdbUrl, function(tmdbData) {
                if (tmdbData.logos?.[0]?.file_path) {
                    // Логотип найден в TMDB
                    var logoPath = tmdbData.logos[0].file_path;
                    var imageUrl = Lampa.TMDB.image("/t/p/w300" + logoPath);
                    
                    a.object.activity.render()
                        .find(".full-start-new__title")
                        .html(`<img style="margin-top: 5px; max-height: 125px;" src="${imageUrl}" />`);
                } 
                else if (isAnime) {
                    // Для аниме: пробуем Shikimori или AniList
                    var searchTitle = encodeURIComponent(title.replace(/\(.*?\)/g, "").trim());
                    var shikimoriUrl = `https://shikimori.one/animes?search=${searchTitle}`;
                    
                    // Альтернатива: AniList API (нужен парсинг)
                    // var anilistUrl = `https://anilist.co/search/anime?search=${searchTitle}`;
                    
                    // Временное решение: подставляем заголовок с аниме-стилем
                    a.object.activity.render()
                        .find(".full-start-new__title")
                        .html(`<span style="font-family: 'Anime Ace', sans-serif; color: #ff6b6b;">${title}</span>`);
                }
            }).fail(function() {
                console.log("TMDB request failed");
            });
        }
    }));
}();