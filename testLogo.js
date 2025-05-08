Lampa.Listener.follow("full", function(event) {
    if (event.type !== "complite") return;

    const movie = event.data.movie;
    const render = event.object.activity.render();
    const titleElement = render.find(".full-start-new__title");
    const originalTitle = movie.title || movie.name;
    const isAnime = movie.genres?.some(g => g.name.toLowerCase().includes("аниме")) 
                    || /аниме|anime/i.test(originalTitle);
    const logoSetting = Lampa.Storage.get("logo_glav") || "show_all";
    const russianTitleSetting = Lampa.Storage.get("russian_titles_settings") || "show_when_no_ru_logo";

    render.find('.ru-title-full').remove();

    if (logoSetting === "hide") {
        showTextTitle();
        if (russianTitleSetting === "show_always") {
            showRussianTitle();
        }
        return;
    }

    titleElement.empty();

    const tmdbUrl = Lampa.TMDB.api(movie.name ? "tv" : "movie") + `/${movie.id}/images?api_key=${Lampa.TMDB.key()}`;

    $.get(tmdbUrl, function(data) {
        const logos = data.logos || [];
        const logo = getBestLogo(logos, logoSetting);

        if (logo?.file_path) {
            const imageUrl = Lampa.TMDB.image("/t/p/w500" + logo.file_path);
            titleElement.html(`<img style="margin-top: 0.2em; margin-bottom: 0.1em; max-width: 9em; max-height: 4em;" src="${imageUrl}" />`);
            
            if (russianTitleSetting === "show_always" || 
                (russianTitleSetting === "show_when_no_ru_logo" && logo.iso_639_1 !== "ru")) {
                showRussianTitle();
            }
        } else {
            showTextTitle();
            if (russianTitleSetting === "show_always") {
                showRussianTitle();
            }
        }
    }).fail(() => {
        console.error("Ошибка загрузки логотипов из TMDB");
        showTextTitle();
    });

    // 🔹 НОВЫЙ КОД (заменяет старую функцию showRussianTitle)
    function showRussianTitle() {
        fetchRussianTitle(movie).then(title => {
            if (title) {
                render.find(".full-start-new__rate-line").first().before(`
                    <div class="ru-title-full" style="
                        color: #ffffff;
                        font-weight: 500;
                        text-align: right;
                        margin-bottom: 10px;
                        opacity: 0.80;
                        max-width: 57%;
                    ">
                        RU: ${title}
                    </div>
                `);
            } else {
                // Если русского названия нет → выводим английское с "EN: "
                const englishTitle = movie.title || movie.name;
                if (englishTitle) {
                    render.find(".full-start-new__rate-line").first().before(`
                        <div class="ru-title-full" style="
                            color: #ffffff;
                            font-weight: 500;
                            text-align: right;
                            margin-bottom: 10px;
                            opacity: 0.80;
                            max-width: 57%;
                        ">
                            EN: ${englishTitle}
                        </div>
                    `);
                }
            }
        });
    }

    function showTextTitle() {
        if (isAnime) {
            titleElement.html(`<span style="font-family: 'Anime Ace', sans-serif; color: #ff6b6b;">${originalTitle}</span>`);
        } else {
            titleElement.text(originalTitle);
        }
    }
});