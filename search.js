(function () {
  'use strict';

  // Проверяем, что это Lampac, иначе выходим
  if (!window.Lampa || !window.lampac_plugin) {
    console.log('Расширение работает только в Lampac!');
    return;
  }

  // Функция для добавления кнопки
  function addSearchButton() {
    // Ищем контейнер .scroll__body (вместо selectbox__content)
    const scrollBody = document.querySelector('.scroll__body');
    if (!scrollBody) return false;

    // Проверяем, не добавлена ли кнопка уже
    if (scrollBody.querySelector('.custom-search-button')) return true;

    // Создаём кнопку "Поиск серии"
    const searchButton = document.createElement('div');
    searchButton.className = 'custom-search-button'; // Убираем лишние классы
    searchButton.innerHTML = `
      <div class="selectbox-item selector">
        <div class="selectbox-item__name">Поиск серии</div>
      </div>
    `;

    // Обработчик клика
    searchButton.addEventListener('click', function (e) {
      e.stopPropagation(); // Предотвращаем всплытие
      alert('Поиск серии!'); // Заглушка
    });

    // Вставляем кнопку в .scroll__body
    scrollBody.prepend(searchButton); // Добавляем в начало
    return true;
  }

  // Наблюдатель за изменениями DOM
  const observer = new MutationObserver(function () {
    addSearchButton();
  });

  // Начинаем наблюдать за .player (или другим родительским контейнером)
  const playerContainer = document.querySelector('.player');
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