(function () {
    'use strict';

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
        anime_movies: {
          ru: "Аниме фильмы",
          en: "Anime Movies",
          uk: "Аніме фільми",
          zh: "动漫电影"
        },
        anime_tv: {
          ru: "Аниме сериалы",
          en: "Anime TV",
          uk: "Аніме серіали",
          zh: "动漫剧集"
        },
        anime_popular: {
          ru: "Популярное",
          en: "Popular",
          uk: "Популярне",
          zh: "热门"
        },
        anime_top: {
          ru: "Топ рейтинга",
          en: "Top Rated",
          uk: "Топ рейтингу",
          zh: "评分最高"
        },
        anime_new: {
          ru: "Новинки",
          en: "New Releases",
          uk: "Новинки",
          zh: "新发布"
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
            url: 'anime',
            title: NEW_ITEM_TEXT,
            component: 'category',
            source: 'cub',
            page: 1
          });
        });
        
        var $tvItem = Lampa.Menu.render().find(ITEM_TV_SELECTOR);
        if ($tvItem.length) {
          $tvItem.after(field);
          moveItemAfter(NEW_ITEM_SELECTOR, ITEM_TV_SELECTOR);
        }
    }

    function createAnimeMenu() {
        // Создаем контейнер для подменю
        var submenuContainer = document.createElement('div');
        submenuContainer.className = 'anime-submenu';
        submenuContainer.style.display = 'none';
        document.body.appendChild(submenuContainer);

        // Функция для показа/скрытия подменю
        function toggleSubmenu(show) {
            if (show) {
                submenuContainer.style.display = 'block';
                // Позиционируем подменю рядом с пунктом "Аниме"
                var animeItem = $('[data-action="anime"]')[0];
                if (animeItem) {
                    var rect = animeItem.getBoundingClientRect();
                    submenuContainer.style.position = 'absolute';
                    submenuContainer.style.left = rect.left + 'px';
                    submenuContainer.style.top = rect.bottom + 'px';
                    submenuContainer.style.zIndex = '1000';
                    submenuContainer.style.background = 'var(--color-background)';
                    submenuContainer.style.borderRadius = '6px';
                    submenuContainer.style.padding = '10px';
                    submenuContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
                }
            } else {
                submenuContainer.style.display = 'none';
            }
        }

        // Создаем пункты подменю
        var menuItems = [
            {
                name: Lampa.Lang.translate('anime_movies'),
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>',
                action: function() {
                    Lampa.Activity.push({
                        url: 'anime/movies',
                        title: Lampa.Lang.translate('anime_movies'),
                        component: 'category',
                        source: 'cub',
                        type: 'movie',
                        page: 1
                    });
                }
            },
            {
                name: Lampa.Lang.translate('anime_tv'),
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/></svg>',
                action: function() {
                    Lampa.Activity.push({
                        url: 'anime/tv',
                        title: Lampa.Lang.translate('anime_tv'),
                        component: 'category',
                        source: 'cub',
                        type: 'tv',
                        page: 1
                    });
                }
            },
            {
                name: Lampa.Lang.translate('anime_popular'),
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>',
                action: function() {
                    Lampa.Activity.push({
                        url: 'anime/popular',
                        title: Lampa.Lang.translate('anime_popular'),
                        component: 'category',
                        source: 'cub',
                        sort_by: 'popularity.desc',
                        page: 1
                    });
                }
            },
            {
                name: Lampa.Lang.translate('anime_top'),
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>',
                action: function() {
                    Lampa.Activity.push({
                        url: 'anime/top',
                        title: Lampa.Lang.translate('anime_top'),
                        component: 'category',
                        source: 'cub',
                        sort_by: 'vote_average.desc',
                        'vote_count.gte': 100,
                        page: 1
                    });
                }
            },
            {
                name: Lampa.Lang.translate('anime_new'),
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-10 5h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
                action: function() {
                    Lampa.Activity.push({
                        url: 'anime/new',
                        title: Lampa.Lang.translate('anime_new'),
                        component: 'category',
                        source: 'cub',
                        sort_by: 'first_air_date.desc',
                        first_air_date_year: new Date().getFullYear(),
                        page: 1
                    });
                }
            }
        ];

        // Добавляем пункты в подменю
        menuItems.forEach(function(item) {
            var menuItem = document.createElement('div');
            menuItem.className = 'selector focusable';
            menuItem.style.padding = '10px';
            menuItem.style.display = 'flex';
            menuItem.style.alignItems = 'center';
            menuItem.style.marginBottom = '5px';
            menuItem.style.borderRadius = '4px';
            
            menuItem.innerHTML = `
                <div style="width:24px;height:24px;margin-right:10px;">${item.icon}</div>
                <div>${item.name}</div>
            `;
            
            menuItem.addEventListener('hover:enter', function() {
                item.action();
                toggleSubmenu(false);
            });
            
            submenuContainer.appendChild(menuItem);
        });

        // Обработчик для пункта "Аниме" в главном меню
        $('body').on('hover:enter', '[data-action="tv"]', function() {
            toggleSubmenu(true);
        });

        // Закрываем подменю при клике вне его
        document.addEventListener('click', function(e) {
            if (!submenuContainer.contains(e.target)) {
                toggleSubmenu(false);
            }
        });
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
          description: Lampa.Lang.translate('anime_title') + " раздел в главном меню"
        },
        onChange: function (value) {
          if (value === 'true') {
            animeSubmenu();
            createAnimeMenu();
          } else {
            $('[data-action="anime"]').remove();
            $('.anime-submenu').remove();
          }
          Lampa.Settings.update();
        }
      });
    }

    // Инициализация плагина
    data();
    setting();
    
    // Добавляем раздел Аниме, если он включен в настройках
    if (Lampa.Storage.get('anime_section', 'false') === 'true') {
      animeSubmenu();
      createAnimeMenu();
    }
})();