class SearchSourceBuilder {
  constructor() {
    this.results = []; // Массив для хранения результатов
    this.active = null; // Активный источник
    this.last = null; // Последний элемент
    this.listener = new EventEmitter(); // Для обработки событий
  }

  // Метод для создания вкладки и обработки событий
  build(source) {
    const _this = this;

    // Создаём вкладку с фиксированным названием "cub" вместо source.title
    const tab = $(`
      <div class="search-source selector">
        <div class="search-source__tab">cub</div>
        <div class="search-source__count">0</div>
      </div>
    `);

    // Создаём результат (заглушка, т.к. create$n не определён)
    const result = {
      create: function() { console.log("Source initialized:", source); },
      listener: new EventEmitter(),
      render: function() { return "<div>Results will appear here</div>"; }
    };

    // Если источник "ленивый", убираем счётчик
    if (source.params && source.params.lazy) {
      tab.find('.search-source__count').remove();
    }

    // Обработчики событий
    result.listener.on('start', () => {
      tab.addClass('search-source--loading');
      tab.find('.search-source__count').html('&nbsp;');
    });

    result.listener.on('clear', () => {
      tab.find('.search-source__count').text('0');
    });

    result.listener.on('finded', (e) => {
      tab.removeClass('search-source--loading');
      tab.find('.search-source__count').text(e.count || 0);
      
      if (_this.active === result) {
        Layer.visible(result.render()); // Предполагается, что Layer существует
      }

      _this.listener.emit('finded', {
        source: source,
        result: result,
        count: e.count,
        data: e.data
      });
    });

    result.listener.on('up', (e) => {
      if (_this.results.length < 2) {
        _this.listener.emit('up');
      } else {
        _this.toggle();
      }
    });

    result.listener.on('select', (data) => _this.listener.emit('select', data));
    result.listener.on('back', (data) => _this.listener.emit('back', data));
    result.listener.on('toggle', (e) => {
      _this.listener.emit('toggle', {
        source: source,
        result: e.result,
        element: e.element
      });
    });

    // Обработчики кликов и фокуса
    tab.on('click', () => {
      _this.enable(result);
    }).on('mouseenter', (e) => {
      _this.last = e.target;
      scroll.update($(e.target)); // Предполагается, что scroll существует
    });

    // Добавляем вкладку в контейнер (замените `scroll` на ваш DOM-элемент)
    $('#search-container').append(tab); // Пример с jQuery

    this.results.push(result);
    this.listener.emit('create', { source, result });
  }

  // Включение источника
  enable(result) {
    this.active = result;
    Layer.visible(result.render());
  }

  // Переключение между источниками (заглушка)
  toggle() {
    console.log("Toggle between sources");
  }
}

// Заглушка для EventEmitter, если его нет
class EventEmitter {
  constructor() {
    this.events = {};
  }
  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args));
    }
  }
}

// Пример использования:
const builder = new SearchSourceBuilder();

// Создаём источник (source.title не используется, т.к. заменён на "cub")
const source = {
  title: "example", // Не будет использоваться
  params: { lazy: false }
};

builder.build(source);

// Эмулируем событие "finded" через 2 секунды
setTimeout(() => {
  builder.results[0].listener.emit('finded', {
    count: 42,
    data: ["Result 1", "Result 2"]
  });
}, 2000);