(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['cub'], factory);
  } else if (typeof exports !== 'undefined') {
    module.exports = factory(require('cub'));
  } else {
    global.CUBSearchPlugin = factory(global.cub);
  }
})(this, function (CUB) {
  'use strict';

  // Плагин поисковой вкладки "cub"
  function CUBSearchPlugin(element, options) {
    this.element = element;
    this.options = CUB.extend({
      lazy: false,        // Ленивая загрузка (не показывать счётчик)
      onSelect: null,     // Коллбэк при выборе элемента
      onFinded: null,     // Коллбэк при нахождении результатов
    }, options);

    this.results = [];    // Массив результатов
    this.active = null;   // Текущий активный источник
    this.last = null;     // Последний элемент

    this.init();
  }

  // Инициализация плагина
  CUBSearchPlugin.prototype.init = function () {
    this.build();
    this.bindEvents();
  };

  // Создание вкладки "cub"
  CUBSearchPlugin.prototype.build = function () {
    var _this = this;

    // Создаём вкладку с фиксированным названием "cub"
    var tab = CUB.$(
      '<div class="search-source selector">' +
        '<div class="search-source__tab">cub</div>' +
        '<div class="search-source__count">0</div>' +
      '</div>'
    );

    // Имитация поискового источника (можно заменить на реальный API)
    var result = {
      data: [],
      count: 0,
      listener: new CUB.EventEmitter(),
      create: function () {
        console.log('CUB Source initialized');
      },
      render: function () {
        return '<div class="cub-results">Results loaded: ' + this.count + '</div>';
      }
    };

    // Обработчики событий
    result.listener.follow('start', function () {
      tab.addClass('search-source--loading');
      tab.find('.search-source__count').html('&nbsp;');
    });

    result.listener.follow('clear', function () {
      tab.find('.search-source__count').text('0');
    });

    result.listener.follow('finded', function (e) {
      tab.removeClass('search-source--loading');
      tab.find('.search-source__count').text(e.count);
      if (_this.active === result) {
        CUB.Layer.visible(result.render());
      }

      if (_this.options.onFinded) {
        _this.options.onFinded({
          source: { title: 'cub' },
          result: result,
          count: e.count,
          data: e.data
        });
      }
    });

    // Клик по вкладке активирует источник
    tab.on('click', function () {
      _this.enable(result);
    });

    // Добавляем в DOM (предполагается, что есть контейнер)
    CUB.$('.search-container').append(tab);
    this.results.push(result);
  };

  // Активация источника
  CUBSearchPlugin.prototype.enable = function (result) {
    this.active = result;
    console.log('Active source: cub');
  };

  // Привязка событий
  CUBSearchPlugin.prototype.bindEvents = function () {
    var _this = this;
    CUB.$(document).on('keydown', function (e) {
      if (e.key === 'Enter' && _this.active) {
        _this.active.listener.send('select');
      }
    });
  };

  // Регистрация плагина в CUB
  CUB.plugin('search', CUBSearchPlugin);

  return CUBSearchPlugin;
});