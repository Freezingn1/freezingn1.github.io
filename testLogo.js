!function() {
    "use strict";

    Lampa.SettingsApi.addParam({
        component: "interface",
        param: {
            name: "logo_glav",
            type: "select",
            values: { 
                "show_all": "Все логотипы", 
                "ru_only": "Только русские", 
                "hide": "Скрыть логотипы"
            },
            default: "show_all"
        },
        field: {
            name: "Настройки логотипов в карточке",
            description: "Управление отображением логотипов вместо названий"
        }
    });

    if (!window.logoplugin) {
        window.logoplugin = true;

        Lampa.Listener.follow("full", function(event) {
            if (event.type !== "complite") return;

            const movie = event.data.movie;
            const titleElement = event.object.activity.render().find(".full-start-new__title");
            const originalTitle = movie.title || movie.name;
            const isAnime = movie.genres?.some(g => g.name.toLowerCase().includes("аниме")) 
                            || /аниме|anime/i.test(originalTitle);
            const logoSetting = Lampa.Storage.get("logo_glav") || "show_all";

            // Если выбрано "Скрыть логотипы" - сразу показываем текст
            if (logoSetting === "hide") {
                showTextTitle();
                return;
            }

            // Очищаем заголовок перед загрузкой
            titleElement.empty();

            // Загружаем логотипы
            const tmdbUrl = Lampa.TMDB.api(movie.name ? "tv" : "movie") + `/${movie.id}/images?api_key=${Lampa.TMDB.key()}&include_image_language=ru,en,null`;

            $.get(tmdbUrl, function(data) {
                const logos = data.logos || [];
                let logo = null;

                // Логика выбора логотипа в зависимости от настроек
                if (logoSetting === "ru_only") {
                    // Только русские логотипы
                    logo = logos.find(l => l.iso_639_1 === "ru");
                } else {
                    // Все логотипы (сначала русский, потом английский, потом любой)
                    logo = logos.find(l => l.iso_639_1 === "ru") || 
                           logos.find(l => l.iso_639_1 === "en") || 
                           logos[0];
                }

                if (logo?.file_path) {
                    // Показываем найденный логотип
                    const imageUrl = Lampa.TMDB.image("/t/p/w500" + logo.file_path);
                    titleElement.html(`<img style="margin-top: 0.2em; margin-bottom: 0.1em; max-width: 9em; max-height: 4em;" src="${imageUrl}" />`);
                } else {
                    // Логотип не найден - показываем текст
                    showTextTitle();
                }
            }).fail(() => {
                console.error("Ошибка загрузки логотипов из TMDB");
                showTextTitle();
            });

            function showTextTitle() {
                if (isAnime) {
                    titleElement.html(`<span style="font-family: 'Anime Ace', sans-serif; color: #ff6b6b;">${originalTitle}</span>`);
                } else {
                    titleElement.text(originalTitle);
                }
            }
        });
    }
}();