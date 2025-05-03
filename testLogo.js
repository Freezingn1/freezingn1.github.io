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
            description: "Сначала русские логотипы, если нет — английские/другие"
        }
    });

    if (!window.logoplugin) {
        window.logoplugin = true;

        Lampa.Listener.follow("full", function(event) {
            if (event.type !== "complite" || Lampa.Storage.get("logo_glav") === "1") return;

            const movie = event.data.movie;
            const isAnime = movie.genres?.some(g => g.name.toLowerCase().includes("аниме")) 
                            || /аниме|anime/i.test(movie.title || movie.name);

            // Запрос логотипов (сначала русские, потом английские, потом любые)
            const tmdbUrl = Lampa.TMDB.api(movie.name ? "tv" : "movie") + `/${movie.id}/images?api_key=${Lampa.TMDB.key()}&include_image_language=ru,en,null`;

            $.get(tmdbUrl, function(data) {
                const logos = data.logos || [];
                
                // 1. Ищем русский логотип (language = "ru")
                let logo = logos.find(l => l.iso_639_1 === "ru");
                
                // 2. Если нет русского — ищем английский ("en")
                if (!logo) logo = logos.find(l => l.iso_639_1 === "en");
                
                // 3. Если нет английского — берём первый доступный
                if (!logo) logo = logos[0];
                
                // Если логотип найден — вставляем его
                if (logo?.file_path) {
                    const imageUrl = Lampa.TMDB.image("/t/p/w300" + logo.file_path);
                    event.object.activity.render()
                        .find(".full-start-new__title")
                        .html(`<img style="margin-top: 5px; max-height: 125px;" src="${imageUrl}" />`);
                } 
                // Если лого нет и это аниме — стилизуем текст
                else if (isAnime) {
                    event.object.activity.render()
                        .find(".full-start-new__title")
                        .html(`<span style="font-family: 'Anime Ace', sans-serif; color: #ff6b6b;">${movie.title || movie.name}</span>`);
                }
            }).fail(() => console.error("Ошибка загрузки логотипов из TMDB"));
        });
    }
}();