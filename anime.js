(function () {
    'use strict';

    function data() {
      Lampa.Lang.add({
        anime_title: {
          ru: "Аниме",
          en: "Anime",
          uk: "Аніме",
          zh: "动漫" // Chinese translation
        },
        anime_popular: {
          ru: "Популярное аниме",
          en: "Popular Anime",
          uk: "Популярне аніме",
          zh: "热门动漫" // Chinese translation
        },
        anime_top: {
          ru: "Топ аниме",
          en: "Top Anime",
          uk: "Топ аніме",
          zh: "动漫排行榜" // Chinese translation
        },
        anime_new: {
          ru: "Новое аниме",
          en: "New Anime",
          uk: "Нове аніме",
          zh: "新番动漫" // Chinese translation
        },
        anime_collections: {
          ru: "Подборки аниме",
          en: "Anime Collections",
          uk: "Підбірки аніме",
          zh: "动漫合集" // Chinese translation
        }
      });
    }
    var lang = {
      data: data
    };

    var NEW_ITEM_SOURCES = ["tmdb", "cub"];
    var ITEM_TV_SELECTOR = '[data-action="tv"]';
    var ITEM_MOVE_TIMEOUT = 2000;
    
    var moveItemAfter = function moveItemAfter(item, after) {
      return setTimeout(function () {
        return $(item).insertAfter($(after));
      }, ITEM_MOVE_TIMEOUT);
    };

    function animeSubmenu() {
        // Добавляем основной пункт меню "Аниме"
        var NEW_ITEM_ATTR = 'data-action="anime"';
        var NEW_ITEM_SELECTOR = "[".concat(NEW_ITEM_ATTR, "]");
        var NEW_ITEM_TEXT = Lampa.Lang.translate('anime_title');
        
        var field = $(/* html */`
          <li class="menu__item selector" ${NEW_ITEM_ATTR}>
             <div class="menu__ico">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.5 14.67C9.5 15.96 8.46 17 7.17 17C5.88 17 4.83 15.96 4.83 14.67C4.83 13.38 5.88 12.33 7.17 12.33C8.46 12.33 9.5 13.38 9.5 14.67ZM12 17.5C10.33 17.5 8.86 16.64 8.04 15.33C7.22 14.02 7.22 12.48 8.04 11.17C8.86 9.86 10.33 9 12 9C13.67 9 15.14 9.86 15.96 11.17C16.78 12.48 16.78 14.02 15.96 15.33C15.14 16.64 13.67 17.5 12 17.5ZM16.83 17C15.54 17 14.5 15.96 14.5 14.67C14.5 13.38 15.54 12.33 16.83 12.33C18.12 12.33 19.17 13.38 19.17 14.67C19.17 15.96 18.12 17 16.83 17Z" fill="currentColor"/>
                </svg>
             </div>
             <div class="menu__text">${NEW_ITEM_TEXT}</div>
          </li>
        `);
        
        field.on("hover:enter", function () {
          Lampa.Activity.push({
            url: '',
            title: NEW_ITEM_TEXT,
            component: 'animeMain',
            page: 1
          });
        });
        
        Lampa.Menu.render().find(ITEM_TV_SELECTOR).after(field);
        moveItemAfter(NEW_ITEM_SELECTOR, ITEM_TV_SELECTOR);
    }

    var insert = {
      animeSubmenu: animeSubmenu
    };

    function setting() {
      Lampa.SettingsApi.addComponent({
        component: "addAnime",
        name: Lampa.Lang.translate('anime_title'),
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.5 14.67C9.5 15.96 8.46 17 7.17 17C5.88 17 4.83 15.96 4.83 14.67C4.83 13.38 5.88 12.33 7.17 12.33C8.46 12.33 9.5 13.38 9.5 14.67ZM12 17.5C10.33 17.5 8.86 16.64 8.04 15.33C7.22 14.02 7.22 12.48 8.04 11.17C8.86 9.86 10.33 9 12 9C13.67 9 15.14 9.86 15.96 11.17C16.78 12.48 16.78 14.02 15.96 15.33C15.14 16.64 13.67 17.5 12 17.5ZM16.83 17C15.54 17 14.5 15.96 14.5 14.67C14.5 13.38 15.54 12.33 16.83 12.33C18.12 12.33 19.17 13.38 19.17 14.67C19.17 15.96 18.12 17 16.83 17Z" fill="white"/></svg>'
      });

      // Добавляем настройку для включения/выключения раздела Аниме
      Lampa.SettingsApi.addParam({
        component: "addAnime",
        param: {
          name: "anime_section",
          type: "trigger",
          default: false
        },
        field: {
          name: Lampa.Lang.translate('anime_title'),
          description: ""
        },
        onChange: function onChange(value) {
          if (value === 'true') insert.animeSubmenu();
          else $('body').find('.menu [data-action="anime"]').remove();
          Lampa.Settings.update();
        }
      });
    }

    var config = {
      setting: setting
    };

    // Компонент для главной страницы аниме
    function componentAnimeMain(object) {
      var scroll = new Lampa.Scroll({
        mask: true,
        over: true,
        step: 250,
        end_ratio: 2
      });
      
      var html = document.createElement('div');
      var header = document.createElement('div');
      var body = document.createElement('div');
      
      this.create = function () {
        this.build();
      };
      
      this.build = function () {
        header.className = 'lme-catalog lme-header';
        
        // Создаем карточки для разных категорий аниме
        var categories = [
          {
            title: Lampa.Lang.translate('anime_popular'),
            action: 'animePopular',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.5 14.67C9.5 15.96 8.46 17 7.17 17C5.88 17 4.83 15.96 4.83 14.67C4.83 13.38 5.88 12.33 7.17 12.33C8.46 12.33 9.5 13.38 9.5 14.67ZM12 17.5C10.33 17.5 8.86 16.64 8.04 15.33C7.22 14.02 7.22 12.48 8.04 11.17C8.86 9.86 10.33 9 12 9C13.67 9 15.14 9.86 15.96 11.17C16.78 12.48 16.78 14.02 15.96 15.33C15.14 16.64 13.67 17.5 12 17.5ZM16.83 17C15.54 17 14.5 15.96 14.5 14.67C14.5 13.38 15.54 12.33 16.83 12.33C18.12 12.33 19.17 13.38 19.17 14.67C19.17 15.96 18.12 17 16.83 17Z" fill="currentColor"/></svg>'
          },
          {
            title: Lampa.Lang.translate('anime_top'),
            action: 'animeTop',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.5 14.67C9.5 15.96 8.46 17 7.17 17C5.88 17 4.83 15.96 4.83 14.67C4.83 13.38 5.88 12.33 7.17 12.33C8.46 12.33 9.5 13.38 9.5 14.67ZM12 17.5C10.33 17.5 8.86 16.64 8.04 15.33C7.22 14.02 7.22 12.48 8.04 11.17C8.86 9.86 10.33 9 12 9C13.67 9 15.14 9.86 15.96 11.17C16.78 12.48 16.78 14.02 15.96 15.33C15.14 16.64 13.67 17.5 12 17.5ZM16.83 17C15.54 17 14.5 15.96 14.5 14.67C14.5 13.38 15.54 12.33 16.83 12.33C18.12 12.33 19.17 13.38 19.17 14.67C19.17 15.96 18.12 17 16.83 17Z" fill="currentColor"/></svg>'
          },
          {
            title: Lampa.Lang.translate('anime_new'),
            action: 'animeNew',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.5 14.67C9.5 15.96 8.46 17 7.17 17C5.88 17 4.83 15.96 4.83 14.67C4.83 13.38 5.88 12.33 7.17 12.33C8.46 12.33 9.5 13.38 9.5 14.67ZM12 17.5C10.33 17.5 8.86 16.64 8.04 15.33C7.22 14.02 7.22 12.48 8.04 11.17C8.86 9.86 10.33 9 12 9C13.67 9 15.14 9.86 15.96 11.17C16.78 12.48 16.78 14.02 15.96 15.33C15.14 16.64 13.67 17.5 12 17.5ZM16.83 17C15.54 17 14.5 15.96 14.5 14.67C14.5 13.38 15.54 12.33 16.83 12.33C18.12 12.33 19.17 13.38 19.17 14.67C19.17 15.96 18.12 17 16.83 17Z" fill="currentColor"/></svg>'
          },
          {
            title: Lampa.Lang.translate('anime_collections'),
            action: 'animeCollections',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.5 14.67C9.5 15.96 8.46 17 7.17 17C5.88 17 4.83 15.96 4.83 14.67C4.83 13.38 5.88 12.33 7.17 12.33C8.46 12.33 9.5 13.38 9.5 14.67ZM12 17.5C10.33 17.5 8.86 16.64 8.04 15.33C7.22 14.02 7.22 12.48 8.04 11.17C8.86 9.86 10.33 9 12 9C13.67 9 15.14 9.86 15.96 11.17C16.78 12.48 16.78 14.02 15.96 15.33C15.14 16.64 13.67 17.5 12 17.5ZM16.83 17C15.54 17 14.5 15.96 14.5 14.67C14.5 13.38 15.54 12.33 16.83 12.33C18.12 12.33 19.17 13.38 19.17 14.67C19.17 15.96 18.12 17 16.83 17Z" fill="currentColor"/></svg>'
          }
        ];
        
        categories.forEach(function(category) {
          var card = document.createElement('div');
          card.className = 'anime-category selector';
          card.innerHTML = `
            <div class="anime-category__icon">${category.icon}</div>
            <div class="anime-category__title">${category.title}</div>
          `;
          
          card.on('hover:enter', function() {
            Lampa.Activity.push({
              url: 'discover/tv',
              title: category.title,
              component: "category_full",
              with_genres: '16', // Жанр аниме в TMDB
              sort_by: category.action === 'animeNew' ? 'first_air_date.desc' : 
                      category.action === 'animeTop' ? 'vote_average.desc' : 
                      'popularity.desc',
              source: 'tmdb',
              card_type: true,
              page: 1
            });
          });
          
          body.appendChild(card);
        });
        
        scroll.append(body);
        html.addClass('animeCatalog');
        html.appendChild(header);
        html.appendChild(scroll.render(true));
        
        this.activity.loader(false);
        this.activity.toggle();
      };
      
      this.start = function () {
        Lampa.Controller.add('content', {
          link: this,
          toggle: function toggle() {
            Lampa.Controller.collectionSet(header, scroll.render(true));
          },
          left: function left() {
            Lampa.Controller.toggle('menu');
          },
          right: function right() {
            Navigator.move('right');
          },
          up: function up() {
            Navigator.move('up');
          },
          down: function down() {
            Navigator.move('down');
          },
          back: function back() {
            Lampa.Activity.backward();
          }
        });
        
        Lampa.Controller.toggle('content');
      };
      
      this.render = function (js) {
        return js ? html : $(html);
      };
      
      this.destroy = function () {
        scroll.destroy();
        html.remove();
        body.remove();
      };
    }

    // Регистрируем компоненты
    Lampa.Component.add('animeMain', componentAnimeMain);
    
    // Инициализация плагина
    lang.data();
    config.setting();
    
    // Добавляем раздел Аниме, если он включен в настройках
    if (Lampa.Storage.get('anime_section') === 'true') {
      insert.animeSubmenu();
    }
})();