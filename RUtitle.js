(function () {
  //BDVBurik 2024
  "use strict";

  async function titleOrigin(card) {
    var params = {
      id: card.id,
      url: "https://worker-patient-dream-26d7.bdvburik.workers.dev:8443/https://api.themoviedb.org/3/movie/",
      urlEnd: "&api_key=4ef0d7355d9ffb5151e987764708ce96",
    };

    if (card.first_air_date) {
      params.url = "https://worker-patient-dream-26d7.bdvburik.workers.dev:8443/https://api.themoviedb.org/3/tv/";
      params.urlEnd = "&api_key=4ef0d7355d9ffb5151e987764708ce96";
    }

    var getOptions = {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    };

    async function getRuTitle() {
      var title;
      var ftc = await fetch(
        params.url + params.id + "?language=ru-RU" + params.urlEnd,
        getOptions
      )
        .then((response) => response.json())
        .then((e) => (title = e.title || e.name));
      return title;
    }

    var etRuTitle = await getRuTitle();
    _showRuTitle(etRuTitle);

    function _showRuTitle(data) {
      if (data) {
        var render = Lampa.Activity.active().activity.render();
        
        // Ищем элемент с "онгоинг" или аналогичный
        var ongoingElement = $(".full-start-new__title, .full-start-new__status", render);
        
        if (ongoingElement.length) {
          ongoingElement.before(
            `<div class="russian-title" style="font-size: 1.3em; margin-bottom: 5px; color: #ffffff; text-align: left;">RU: ${data}</div>`
          );
        } else {
          // Если не нашли элемент, добавляем в начало
          $(".full-start-new__title", render).before(
            `<div class="russian-title" style="font-size: 1.3em; margin-bottom: 5px; color: #ffffff; text-align: left;">RU: ${data}</div>`
          );
        }
      }
    }
  }

  function startPlugin() {
    window.title_plugin = true;
    Lampa.Listener.follow("full", function (e) {
      if (e.type == "complite") {
        var render = e.object.activity.render();
        $(".russian-title", render).remove(); // Удаляем предыдущие заголовки
        titleOrigin(e.data.movie);
      }
    });
  }
  if (!window.title_plugin) startPlugin();
})();