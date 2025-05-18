// Запоминаем оригинальный метод
const originalBuild = SearchManager.prototype.build;

// Переопределяем метод
SearchManager.prototype.build = function(source) {
  const _this = this;

  // Фиксируем "cub" вместо source.title
  const tab = $(`
    <div class="search-source selector">
      <div class="search-source__tab">cub</div>
      <div class="search-source__count">0</div>
    </div>
  `);

  const result = new create$n(source);
  result.create();

  if (source.params.lazy) {
    tab.find('.search-source__count').remove();
  }

  result.listener.follow('start', () => {
    tab.addClass('search-source--loading');
    tab.find('.search-source__count').html('&nbsp;');
  });

  result.listener.follow('clear', () => {
    tab.find('.search-source__count').text(0);
  });

  result.listener.follow('finded', (e) => {
    tab.removeClass('search-source--loading');
    tab.find('.search-source__count').text(e.count);

    if (_this.active == result) {
      Layer.visible(result.render());
    }

    _this.listener.send('finded', {
      source: source,
      result: result,
      count: e.count,
      data: e.data
    });
  });

  result.listener.follow('up', (e) => {
    if (_this.results.length < 2) {
      _this.listener.send('up');
    } else {
      _this.toggle();
    }
  });

  result.listener.follow('select', _this.listener.send.bind(_this.listener, 'select'));
  result.listener.follow('back', _this.listener.send.bind(_this.listener, 'back'));
  result.listener.follow('toggle', (e) => {
    _this.listener.send('toggle', {
      source: source,
      result: e.result,
      element: e.element
    });
  });

  tab.on('hover:enter', () => {
    _this.enable(result);
  }).on('hover:focus', (e) => {
    _this.last = e.target;
    scroll.update($(e.target));
  });

  scroll.append(tab);
  _this.results.push(result);
  _this.listener.send('create', { source, result });
};