(function () {
  'use strict';

  if (!window.Lampa || !window.lampac_plugin) {
    console.log('Расширение работает только в Lampac!');
    return;
  }

  // Функция для добавления кнопки
  function addSearchButton() {
    // Ищем конкретное меню плеера (не все .scroll__body!)
    const selectBox = document.querySelector('.selectbox.animate .scroll__body');
    if (!selectBox) return false;

    // Проверяем, есть ли уже кнопка "Сбросить фильтр" (чтобы вставить после неё)
    const resetFilterButton = selectBox.querySelector('.selectbox-item__title:contains("Сбросить фильтр")');
    if (!resetFilterButton) return false;

    // Если наша кнопка уже есть - выходим
    if (selectBox.querySelector('.search-series-button')) return true;

    // Создаём кнопку "Поиск серии"
    const searchButton = document.createElement('div');
    searchButton.className = 'selectbox-item selector search-series-button';
    searchButton.innerHTML = `
      <div class="selectbox-item__title">Поиск серии</div>
    `;

    // Обработчик клика
    searchButton.addEventListener('click', function (e) {
      e.stopPropagation();
      console.log('Поиск серии запущен!');
      // Здесь будет логика поиска
    });

    // Вставляем после кнопки "Сбросить фильтр"
    resetFilterButton.closest('.selectbox-item').after(searchButton);
    return true;
  }

  // Наблюдатель за изменениями (на случай, если меню открывается динамически)
  const observer = new MutationObserver(function () {
    addSearchButton();
  });

  // Наблюдаем за изменениями в .player или .selectbox
  const playerContainer = document.querySelector('.player, .selectbox');
  if (playerContainer) {
    observer.observe(playerContainer, {
      childList: true,
      subtree: true
    });
  }

  // Первая попытка добавить кнопку
  Lampa.Listener.follow('app', function () {
    addSearchButton();
  });

})();