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
            name: "Логотипы вместо названий в карточках",
            description: "Показывать логотипы в карточках"
        }
    });

    Lampa.SettingsApi.addParam({
        component: "interface",
        param: {
            name: "disable_english_logos",
            type: "select",
            values: { 1: "Да", 0: "Нет" },
            default: "0"
        },
        field: {
            name: "Отключить английские логотипы в карточках",
            description: "Показывать только русские логотипы или названия"
        }
    });

    if (!window.logoplugin) {
        window.logoplugin = true;

        Lampa.Listener.follow("full", function(event) {
            if (event.type !== "complite" || Lampa.Storage.get("logo_glav") === "1") return;

            const movie = event.data.movie;
            const titleElement = event.object.activity.render().find(".full-start-new__title");
            const originalTitle = movie.title || movie.name;
            const isAnime = movie.genres?.some(g => g.name.toLowerCase().includes("аниме")) 
                            || /аниме|anime/i.test(originalTitle);
            const disableEnglishLogos = Lampa.Storage.get("disable_english_logos") === "1";

            // Сначала очищаем заголовок
            titleElement.empty();

            // Загружаем логотип
            const tmdbUrl = Lampa.TMDB.api(movie.name ? "tv" : "movie") + `/${movie.id}/images?api_key=${Lampa.TMDB.key()}&include_image_language=ru,en,null`;

            $.get(tmdbUrl, function(data) {
                const logos = data.logos || [];
                
                // 1. Ищем русский логотип (language = "ru")
                let logo = logos.find(l => l.iso_639_1 === "ru");
                
                // 2. Если нет русского и английские не отключены — ищем английский ("en")
                if (!logo && !disableEnglishLogos) logo = logos.find(l => l.iso_639_1 === "en");
                
                // 3. Если английские отключены или не нашли нужный — берём первый доступный (только если английские не отключены)
                if (!logo && !disableEnglishLogos) logo = logos[0];
                
                if (logo?.file_path) {
                    // Если логотип найден — показываем его
                    const imageUrl = Lampa.TMDB.image("/t/p/w500" + logo.file_path);
                    titleElement.html(`<img style="margin-top: 0.2em; margin-bottom: 0.1em; max-width: 9em; max-height: 4em;" src="${imageUrl}" />`);
                } else {
                    // Если логотипа нет — показываем текст
                    if (isAnime) {
                        titleElement.html(`<span style="font-family: 'Anime Ace', sans-serif; color: #ff6b6b;">${originalTitle}</span>`);
                    } else {
                        titleElement.text(originalTitle);
                    }
                }
            }).fail(() => {
                console.error("Ошибка загрузки логотипов из TMDB");
                // Если произошла ошибка — показываем текст
                if (isAnime) {
                    titleElement.html(`<span style="font-family: 'Anime Ace', sans-serif; color: #ff6b6b;">${originalTitle}</span>`);
                } else {
                    titleElement.text(originalTitle);
                }
            });
        });
    }
}();