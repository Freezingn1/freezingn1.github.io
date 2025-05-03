(function () {
  'use strict';

  // Кэш для логотипов
  const logoCache = {};

  function startPlugin() {
    if (!Lampa.Platform.screen('tv')) return console.log('Cardify', 'no tv');
    
    // Добавляем поддержку логотипов
    Lampa.Storage.set('new_interface_logo', true);
    
    Lampa.Lang.add({
      cardify_enable_sound: {
        ru: 'Включить звук',
        en: 'Enable sound',
        uk: 'Увімкнути звук',
        be: 'Уключыць гук',
        zh: '启用声音',
        pt: 'Ativar som',
        bg: 'Включване на звук'
      },
      cardify_enable_trailer: {
        ru: 'Показывать трейлер',
        en: 'Show trailer',
        uk: 'Показувати трейлер',
        be: 'Паказваць трэйлер',
        zh: '显示预告片',
        pt: 'Mostrar trailer',
        bg: 'Показване на трейлър'
      }
    });

    // Модифицированный шаблон с поддержкой логотипов
    Lampa.Template.add('full_start_new', `
      <div class="full-start-new cardify">
        <div class="full-start-new__body">
          <div class="full-start-new__left hide">
            <div class="full-start-new__poster">
              <img class="full-start-new__img full--poster" />
            </div>
          </div>

          <div class="full-start-new__right">
            <div class="cardify__left">
              <div class="full-start-new__head"></div>
              <div class="full-start-new__title"></div>

              <div class="cardify__details">
                <div class="full-start-new__details"></div>
              </div>

              <div class="full-start-new__buttons">
                <div class="full-start__button selector button--play">
                  <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>
                    <path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>
                  </svg>
                  <span>#{title_watch}</span>
                </div>

                <div class="full-start__button selector button--book">
                  <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>
                  </svg>
                  <span>#{settings_input_links}</span>
                </div>
              </div>
            </div>

            <div class="cardify__right">
              <div class="full-start-new__reactions selector">
                <div>#{reactions_none}</div>
              </div>

              <div class="full-start-new__rate-line">
                <div class="full-start__pg hide"></div>
                <div class="full-start__status hide"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);

    // Стили для карточного интерфейса
    var style = `
      <style>
        .cardify {
          transition: all 0.3s;
        }
        .cardify .full-start-new__body {
          height: 80vh;
        }
        .cardify .full-start-new__right {
          display: flex;
          align-items: flex-end;
        }
        .cardify .full-start-new__title {
          text-shadow: 0 0 0.1em rgba(0,0,0,0.3);
        }
        .cardify__left {
          flex-grow: 1;
        }
        .cardify__right {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          position: relative;
        }
        .cardify__details {
          display: flex;
        }
        .full-start-new__title img {
          max-height: 3em;
          max-width: 100%;
          margin: 0.5em 0;
        }
      </style>
    `;
    
    $('body').append(style);

    // Функция для загрузки логотипа
    function loadLogo(data, element) {
      const type = data.name ? 'tv' : 'movie';
      const cacheKey = `${type}_${data.id}`;
      
      if (logoCache[cacheKey]) {
        element.html(logoCache[cacheKey]);
        return;
      }

      const url = Lampa.TMDB.api(`${type}/${data.id}/images?api_key=${Lampa.TMDB.key()}&language=${Lampa.Storage.get('language')}`);

      Lampa.Storage.cache(url, (images) => {
        if (images.logos?.length > 0) {
          const logoPath = images.logos[0].file_path;
          if (logoPath) {
            const imageUrl = Lampa.TMDB.image(`/t/p/w500${logoPath.replace(".svg", ".png")}`);
            const logoHtml = `<img src="${imageUrl}" style="max-height: 3em; max-width: 100%; margin: 0.5em 0;" />`;
            logoCache[cacheKey] = logoHtml;
            element.html(logoHtml);
            return;
          }
        }
        element.text(data.title);
      }, () => {
        element.text(data.title);
      });
    }

    // Обработчик для отображения контента
    Lampa.Listener.follow('full', (e) => {
      if (e.type == 'ready') {
        const html = e.object.activity.render();
        const data = e.object.data;
        
        // Показываем либо логотип, либо название
        const titleElement = html.find('.full-start-new__title');
        if (Lampa.Storage.get('new_interface_logo') === true) {
          loadLogo(data, titleElement);
        } else {
          titleElement.text(data.title);
        }

        // Остальные элементы интерфейса
        const create = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
        const vote = parseFloat((data.vote_average || 0) + '').toFixed(1);
        const head = [];
        const details = [];
        const countries = Lampa.Api.sources.tmdb.parseCountries(data);
        const pg = Lampa.Api.sources.tmdb.parsePG(data);
        
        if (create !== '0000') head.push('<span>' + create + '</span>');
        if (countries.length > 0) head.push(countries.join(', '));
        
        if (vote > 0) details.push('<div class="full-start__rate"><div>' + vote + '</div><div>TMDB</div></div>');
        
        if (data.number_of_episodes && data.number_of_episodes > 0) {
          details.push('<span class="full-start__pg">Эпизодов ' + data.number_of_episodes + '</span>');
        }
        
        if (data.runtime) details.push(Lampa.Utils.secondsToTime(data.runtime * 60, true));
        if (pg) details.push('<span class="full-start__pg" style="font-size: 0.9em;">' + pg + '</span>');
        
        html.find('.full-start-new__head').empty().append(head.join(', '));
        html.find('.full-start-new__details').html(details.join('<span class="new-interface-info__split">&#9679;</span>'));
      }
    });

    // Добавляем настройку для включения/выключения логотипов
    Lampa.SettingsApi.addParam({
      component: 'interface',
      param: {
        name: 'new_interface_logo',
        type: 'toggle',
        default: true
      },
      field: {
        name: 'Показывать логотипы вместо названий'
      }
    });
  }

  // Запускаем плагин после загрузки приложения
  if (window.appready) {
    startPlugin();
  } else {
    Lampa.Listener.follow('app', (e) => {
      if (e.type === 'ready') startPlugin();
    });
  }
})();