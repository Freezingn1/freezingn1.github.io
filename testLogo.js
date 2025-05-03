!function() {
    "use strict";

    // Настройка параметра в интерфейсе
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
            description: "Сначала русские логотипы, если нет — английские/другие (работает на главной и странице фильма)"
        }
    });

    if (!window.logoplugin) {
        window.logoplugin = true;

        // Функция для получения и вставки логотипа
        function applyLogo(element, movie, isCard = false) {
            if (Lampa.Storage.get("logo_glav") === "1") return;

            const isAnime = movie.genres?.some(g => g.name.toLowerCase().includes("аниме")) 
                         || /аниме|anime/i.test(movie.title || movie.name);

            const type = movie.name ? "tv" : "movie";
            const tmdbUrl = Lampa.TMDB.api(type) + `/${movie.id}/images?api_key=${Lampa.TMDB.key()}&include_image_language=ru,en,null`;

            $.get(tmdbUrl, function(data) {
                const logos = data.logos || [];
                let logo = logos.find(l => l.iso_639_1 === "ru") || 
                          logos.find(l => l.iso_639_1 === "en") || 
                          logos[0];

                if (logo?.file_path) {
                    const imageUrl = Lampa.TMDB.image("/t/p/w500" + logo.file_path);
                    const imgStyle = isCard 
                        ? "max-width: 100%; max-height: 2.5em; object-fit: contain; margin: 0 auto; display: block;" 
                        : "margin-top: 0.2em; margin-bottom: 0.1em; max-width: 9em; max-height: 4em;";
                    
                    element.html(`<img style="${imgStyle}" src="${imageUrl}" />`);
                } 
                else if (isAnime) {
                    const textStyle = isCard 
                        ? "font-family: 'Anime Ace', sans-serif; color: #ff6b6b; font-size: 0.9em; text-align: center;" 
                        : "font-family: 'Anime Ace', sans-serif; color: #ff6b6b;";
                    element.html(`<span style="${textStyle}">${movie.title || movie.name}</span>`);
                }
            }).fail(() => console.error("Ошибка загрузки логотипов из TMDB"));
        }

        // Обработчик для страницы фильма
        Lampa.Listener.follow("full", function(event) {
            if (event.type === "complite") {
                applyLogo(
                    event.object.activity.render().find(".new-interface-info__title"),
                    event.data.movie
                );
            }
        });

        // Обработчик для карточек на главной
        Lampa.Listener.follow("app_resume", function() {
            if (Lampa.Storage.get("logo_glav") === "1") return;

            // Обрабатываем карточки в основных блоках
            $(".card:not(.logo-processed)").each(function() {
                const card = $(this);
                card.addClass("logo-processed");
                
                const data = card.data();
                if (data.id && data.type) {
                    const titleElement = card.find(".card__title");
                    if (titleElement.length) {
                        const movie = {
                            id: data.id,
                            title: data.title,
                            name: data.name,
                            genres: data.genres || []
                        };
                        applyLogo(titleElement, movie, true);
                    }
                }
            });
        });
    }
}();