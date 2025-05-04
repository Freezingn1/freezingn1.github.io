(function () {
    'use strict';

    var NEW_ITEM_SOURCES = ["tmdb", "cub"];
    var ITEM_TV_SELECTOR = '[data-action="tv"]';
    var ITEM_MOVE_TIMEOUT = 2000;
    
    function data() {
      Lampa.Lang.add({
        anime_title: {
          ru: "Аниме",
          en: "Anime",
          uk: "Аніме",
          zh: "动漫"
        },
        anime_watching: {
          ru: "Сейчас смотрят",
          en: "Trending Now",
          uk: "Зараз дивляться",
          zh: "正在观看"
        },
        anime_top: {
          ru: "В топе",
          en: "Top Rated",
          uk: "В топі",
          zh: "热门排行"
        },
        anime_ongoing: {
          ru: "Онгоинги",
          en: "Ongoing",
          uk: "Онгоінги",
          zh: "连载中"
        },
        anime_new: {
          ru: "Новинки этого года",
          en: "New This Year",
          uk: "Новинки цього року",
          zh: "今年新番"
        }
      });
    }

    function moveItemAfter(item, after) {
      return setTimeout(function () {
        var $item = $(item);
        var $after = $(after);
        if ($item.length && $after.length) {
          $item.insertAfter($after);
        }
      }, ITEM_MOVE_TIMEOUT);
    }

    function animeSubmenu() {
        var NEW_ITEM_ATTR = 'data-action="anime"';
        var NEW_ITEM_SELECTOR = "[" + NEW_ITEM_ATTR + "]";
        var NEW_ITEM_TEXT = Lampa.Lang.translate('anime_title');
        
        // Удаляем существующий элемент, если он есть
        $(NEW_ITEM_SELECTOR).remove();
        
        var field = $(`
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
        
        var $tvItem = Lampa.Menu.render().find(ITEM_TV_SELECTOR);
        if ($tvItem.length) {
          $tvItem.after(field);
          moveItemAfter(NEW_ITEM_SELECTOR, ITEM_TV_SELECTOR);
        }
    }

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
        this.activity = object;
        this.build();
      };
      
      this.build = function () {
        header.className = 'lme-catalog lme-header';
        body.className = 'anime-categories-container';
        
        var categories = [
          {
            title: Lampa.Lang.translate('anime_watching'),
            action: 'trending',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.5 14.67C9.5 15.96 8.46 17 7.17 17C5.88 17 4.83 15.96 4.83 14.67C4.83 13.38 5.88 12.33 7.17 12.33C8.46 12.33 9.5 13.38 9.5 14.67ZM12 17.5C10.33 17.5 8.86 16.64 8.04 15.33C7.22 14.02 7.22 12.48 8.04 11.17C8.86 9.86 10.33 9 12 9C13.67 9 15.14 9.86 15.96 11.17C16.78 12.48 16.78 14.02 15.96 15.33C15.14 16.64 13.67 17.5 12 17.5ZM16.83 17C15.54 17 14.5 15.96 14.5 14.67C14.5 13.38 15.54 12.33 16.83 12.33C18.12 12.33 19.17 13.38 19.17 14.67C19.17 15.96 18.12 17 16.83 17Z"/></svg>'
          },
          {
            title: Lampa.Lang.translate('anime_top'),
            action: 'top',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.5 14.67C9.5 15.96 8.46 17 7.17 17C5.88 17 4.83 15.96 4.83 14.67C4.83 13.38 5.88 12.33 7.17 12.33C8.46 12.33 9.5 13.38 9.5 14.67ZM12 17.5C10.33 17.5 8.86 16.64 8.04 15.33C7.22 14.02 7.22 12.48 8.04 11.17C8.86 9.86 10.33 9 12 9C13.67 9 15.14 9.86 15.96 11.17C16.78 12.48 16.78 14.02 15.96 15.33C15.14 16.64 13.67 17.5 12 17.5ZM16.83 17C15.54 17 14.5 15.96 14.5 14.67C14.5 13.38 15.54 12.33 16.83 12.33C18.12 12.33 19.17 13.38 19.17 14.67C19.17 15.96 18.12 17 16.83 17Z"/></svg>'
          },
          {
            title: Lampa.Lang.translate('anime_ongoing'),
            action: 'ongoing',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.5 14.67C9.5 15.96 8.46 17 7.17 17C5.88 17 4.83 15.96 4.83 14.67C4.83 13.38 5.88 12.33 7.17 12.33C8.46 12.33 9.5 13.38 9.5 14.67ZM12 17.5C10.33 17.5 8.86 16.64 8.04 15.33C7.22 14.02 7.22 12.48 8.04 11.17C8.86 9.86 10.33 9 12 9C13.67 9 15.14 9.86 15.96 11.17C16.78 12.48 16.78 14.02 15.96 15.33C15.14 16.64 13.67 17.5 12 17.5ZM16.83 17C15.54 17 14.5 15.96 14.5 14.67C14.5 13.38 15.54 12.33 16.83 12.33C18.12 12.33 19.17 13.38 19.17 14.67C19.17 15.96 18.12 17 16.83 17Z"/></svg>'
          },
          {
            title: Lampa.Lang.translate('anime_new'),
            action: 'new',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.5 14.67C9.5 15.96 8.46 17 7.17 17C5.88 17 4.83 15.96 4.83 14.67C4.83 13.38 5.88 12.33 7.17 12.33C8.46 12.33 9.5 13.38 9.5 14.67ZM12 17.5C10.33 17.5 8.86 16.64 8.04 15.33C7.22 14.02 7.22 12.48 8.04 11.17C8.86 9.86 10.33 9 12 9C13.67 9 15.14 9.86 15.96 11.17C16.78 12.48 16.78 14.02 15.96 15.33C15.14 16.64 13.67 17.5 12 17.5ZM16.83 17C15.54 17 14.5 15.96 14.5 14.67C14.5 13.38 15.54 12.33 16.83 12.33C18.12 12.33 19.17 13.38 19.17 14.67C19.17 15.96 18.12 17 16.83 17Z"/></svg>'
          }
        ];
        
        categories.forEach(function(category) {
          var card = document.createElement('div');
          card.className = 'anime-category selector';
          card.innerHTML = `
            <div class="anime-category__icon">${category.icon}</div>
            <div class="anime-category__title">${category.title}</div>
          `;
          
          card.addEventListener('hover:enter', function() {
            var params = {
              url: 'discover/tv',
              title: category.title,
              component: "category_full",
              with_genres: '16', // Жанр аниме в TMDB
              source: 'tmdb',
              card_type: true,
              page: 1
            };

            // Добавляем специфичные параметры для каждой категории
            switch(category.action) {
              case 'trending':
                params.sort_by = 'popularity.desc';
                break;
              case 'top':
                params.sort_by = 'vote_average.desc';
                params['vote_count.gte'] = 100;
                break;
              case 'ongoing':
                params.sort_by = 'first_air_date.desc';
                params.with_status = 'returning';
                break;
              case 'new':
                params.sort_by = 'first_air_date.desc';
                params.first_air_date_year = new Date().getFullYear();
                break;
            }

            Lampa.Activity.push(params);
          });
          
          body.appendChild(card);
        });
        
        scroll.append(body);
        html.className = 'anime-catalog';
        html.appendChild(header);
        html.appendChild(scroll.render(true));
        
        if (this.activity) {
          this.activity.loader(false);
          this.activity.toggle();
        }
      };
      
      this.start = function () {
        Lampa.Controller.add('content', {
          toggle: function () {
            Lampa.Controller.collectionSet(html, scroll.render(true));
          },
          left: function () {
            Lampa.Controller.toggle('menu');
          },
          right: function () {
            Lampa.Controller.toggle('right');
          },
          up: function () {
            Lampa.Controller.toggle('up');
          },
          down: function () {
            Lampa.Controller.toggle('down');
          },
          back: function () {
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
        if (html.parentNode) {
          html.parentNode.removeChild(html);
        }
      };

      this.pause = function() {};
      this.stop = function() {};
      this.refresh = function() {};
    }

    function setting() {
      Lampa.SettingsApi.addComponent({
        component: "addAnime",
        name: Lampa.Lang.translate('anime_title'),
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.5 14.67C9.5 15.96 8.46 17 7.17 17C5.88 17 4.83 15.96 4.83 14.67C4.83 13.38 5.88 12.33 7.17 12.33C8.46 12.33 9.5 13.38 9.5 14.67ZM12 17.5C10.33 17.5 8.86 16.64 8.04 15.33C7.22 14.02 7.22 12.48 8.04 11.17C8.86 9.86 10.33 9 12 9C13.67 9 15.14 9.86 15.96 11.17C16.78 12.48 16.78 14.02 15.96 15.33C15.14 16.64 13.67 17.5 12 17.5ZM16.83 17C15.54 17 14.5 15.96 14.5 14.67C14.5 13.38 15.54 12.33 16.83 12.33C18.12 12.33 19.17 13.38 19.17 14.67C19.17 15.96 18.12 17 16.83 17Z" fill="white"/></svg>'
      });

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
        onChange: function (value) {
          if (value === 'true') {
            animeSubmenu();
          } else {
            $('[data-action="anime"]').remove();
          }
          Lampa.Settings.update();
        }
      });
    }

    // Инициализация плагина
    data();
    setting();
    Lampa.Component.add('animeMain', componentAnimeMain);
    
    // Добавляем раздел Аниме, если он включен в настройках
    if (Lampa.Storage.get('anime_section', 'false') === 'true') {
      animeSubmenu();
    }
})();