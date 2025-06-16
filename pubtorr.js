(function () {
    'use strict';

    function translate() {
      Lampa.Lang.add({
        lme_parser: {
          ru: 'Каталог парсеров',
          en: 'Parsers catalog',
          uk: 'Каталог парсерів',
          zh: '解析器目录' // Chinese translation
        },
        lme_parser_description: {
          ru: 'Нажмите для выбора парсера из ',
          en: 'Click to select a parser from the ',
          uk: 'Натисніть для вибору парсера з ',
          zh: '单击以从可用的 '
        },
        lme_pubtorr: {
          ru: 'Каталог TorrServer',
          en: 'TorrServer catalog',
          uk: 'Каталог TorrServer',
          zh: '解析器目录' // Chinese translation
        },
        lme_pubtorr_description: {
          ru: 'Бесплатные серверы от проекта LME',
          en: 'Free servers from the LME project',
          uk: 'Безкоштовні сервери від проєкту LME',
          zh: '来自 LME 项目的免费服务器 '
        },
        lme_pubtorr_firstrun: {
          "ru": "Привет! Ты установил плагин LME PubTorr, учти что если стоит Mods's то в разделе парсеров будет ошибка, которая не влияет на работу. Хочешь избавиться - оставь или LME PubTorr или Mods's.",
          "en": "Hello! You have installed the LME PubTorr plugin. Note that if Mods's is enabled, there will be an error in the parsers section that does not affect functionality. If you want to get rid of it, keep either LME PubTorr or Mods's.",
          "uk": "Привіт! Ви встановили плагін LME PubTorr, врахуйте, що якщо активовано Mods's, то в розділі парсерів буде помилка, яка не впливає на роботу. Якщо хочете позбутися - залиште або LME PubTorr, або Mods's.",
          "zh": "你好！你安装了LME PubTorr插件，请注意，如果启用了Mods's，解析器部分将出现错误，但这不会影响功能。如果你想摆脱它，请保留LME PubTorr或Mods's。"
        }
      });
    }
    var Lang = {
      translate: translate
    };

    var parsersInfo = [{
      base: 'redapi',
      name: 'Redapi Jacred',
      settings: {
        url: 'redapi.cfhttp.top',
        key: '',
        parser_torrent_type: 'jackett'
      }
    }, {
      base: 'maxvol',
      name: 'Maxvol Jackett',
      settings: {
        url: 'https://jac.maxvol.pro',
        key: '1',
        parser_torrent_type: 'jackett'
      }
    },
      ];

    var proto = location.protocol === "https:" ? 'https://' : 'http://';

    // Объект для хранения кеша
    var cache = {};
    function checkAlive(type) {
      if (type === 'parser') {
        var requests = parsersInfo.map(function (parser) {
          var protocol = parser.base === "lme_jackett" || parser.base === "lme_prowlarr" ? "" : proto;
          var endPoint = parser.settings.parser_torrent_type === 'prowlarr' ? '/api/v1/health?apikey=' + parser.settings.key : "/api/v2.0/indexers/status:healthy/results?apikey=".concat(parser.settings.url === 'spawn.pp.ua:59117' ? '2' : parser.base === 'lme_jackett' ? parser.settings.key : '');
          var myLink = protocol + parser.settings.url + endPoint;

          // Используем jQuery для поиска элемента с текстом имени парсера
          var mySelector = $('div.selectbox-item__title').filter(function () {
            return $(this).text().trim() === parser.name;
          });

          // Проверяем наличие кеша
          if (cache[myLink]) {
            console.log('Using cached response for', myLink, cache[myLink]);
            var color = cache[myLink].color;
            $(mySelector).css('color', color);
            return Promise.resolve();
          }
          return new Promise(function (resolve) {
            //if ($(mySelector).text() !== 'Не выбран') return resolve();

            $.ajax({
  url: myLink,
  method: 'GET',
  timeout: 10000, // 10 секунд ожидания
  success: function (response, textStatus, xhr) {
    var color;
    if (xhr.status === 200) {
      color = '#1aff00'; // Успех (зелёный)
    } else if (xhr.status === 401) {
      color = '#ff2e36'; // Ошибка авторизации (красный)
    } else {
      color = '#ff2e36'; // Другие ошибки (красный)
    }
    $(mySelector).css('color', color);
    cache[myLink] = { color: color }; // Кешируем ответ
  },
  error: function (xhr) {
    console.error('Ошибка запроса:', xhr.status, xhr.statusText);
    $(mySelector).css('color', '#ff2e36'); // При любой ошибке — красный
  },
  complete: resolve
});
          });
        });
        return Promise.all(requests).then(function () {
          return console.log('All requests completed');
        });
      }
    }

    /**/
    Lampa.Controller.listener.follow('toggle', function (e) {
      if (e.name === 'select') {
        checkAlive("parser");
      }
    });
    function changeParser() {
      var jackettUrlTwo = Lampa.Storage.get("lme_url_two");
      var selectedParser = parsersInfo.find(function (parser) {
        return parser.base === jackettUrlTwo;
      });
      if (selectedParser) {
        var settings = selectedParser.settings;
        Lampa.Storage.set(settings.parser_torrent_type === 'prowlarr' ? "prowlarr_url" : "jackett_url", settings.url);
        Lampa.Storage.set(settings.parser_torrent_type === 'prowlarr' ? "prowlarr_key" : "jackett_key", settings.key);
        Lampa.Storage.set("parser_torrent_type", settings.parser_torrent_type);
      } else {
        console.warn("Jackett URL not found in parsersInfo");
      }
    }
    var s_values = parsersInfo.reduce(function (prev, _ref) {
      var base = _ref.base,
        name = _ref.name;
      prev[base] = name;
      return prev;
    }, {
      no_parser: 'Не выбран'
    });
    function parserSetting() {
      Lampa.SettingsApi.addParam({
        component: 'parser',
        param: {
          name: 'lme_url_two',
          type: 'select',
          values: s_values,
          "default": 'no_parser'
        },
        field: {
          name: "<div class=\"settings-folder\" style=\"padding:0!important\"><div style=\"font-size:1.0em\">".concat(Lampa.Lang.translate('lme_parser'), "</div></div>"),
          description: "".concat(Lampa.Lang.translate('lme_parser_description'), " ").concat(parsersInfo.length)
        },
        onChange: function onChange(value) {
          changeParser();
          Lampa.Settings.update();
        },
        onRender: function onRender(item) {
          $('.settings-param__value p.parserName').remove();
          changeParser();
          setTimeout(function () {
            $('div[data-children="parser"]').on('hover:enter', function () {
              Lampa.Settings.update();
            });
            if (Lampa.Storage.field('parser_use')) {
              item.show();
              $('.settings-param__name', item).css('color', 'f3d900');
              $('div[data-name="lme_url_two"]').insertAfter('div[data-children="parser"]');
            } else {
              item.hide();
            }
          });
        }
      });
    }
    var Parser = {
      parserSetting: parserSetting
    };

    Lampa.Platform.tv();
    function add() {
      Lang.translate();
      Parser.parserSetting();
    }
    function startPlugin() {
      window.plugin_lmepublictorr_ready = true;
      if (window.appready) add();else {
        Lampa.Listener.follow('app', function (e) {
          if (e.type === 'ready') add();
        });
      }
    }
    if (!window.plugin_lmepublictorr_ready) startPlugin();

})();
