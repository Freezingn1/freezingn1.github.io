(function () {
  'use strict';

  // Проверяем, что это Lampac
  if (!window.Lampa || !window.lampac_plugin) {
    console.log('Расширение работает только в Lampac!');
    return;
  }

  // Функция для добавления кнопки
  function addSearchButton() {
    // Ищем контейнер .scroll__body (где находятся кнопки)
    const scrollBody = document.querySelector('.scroll__body');
    if (!scrollBody) return false; // Если контейнера нет, выходим

    // Проверяем, не добавлена ли кнопка уже
    if (scrollBody.querySelector('.custom-search-button')) return true;

    // Создаём кнопку "Поиск серии" по аналогии с другими
    const searchButton = document.createElement('div');
    searchButton.className = 'selectbox-item selector custom-search-button';
    searchButton.innerHTML = `
      <div class="selectbox-item__title">Поиск серии</div>
    `;

    // Обработчик клика
    searchButton.addEventListener('click', function (e) {
      e.stopPropagation();
      alert('Поиск серии!'); // Позже заменим на реальный функционал
    });

    // Вставляем кнопку в конец списка (.scroll__body)
    scrollBody.appendChild(searchButton);
    return true;
  }

  // Наблюдаем за изменениями в DOM (на случай динамической загрузки)
  const observer = new MutationObserver(function () {
    addSearchButton();
  });

  // Начинаем наблюдать за изменениями в .scroll (родительский контейнер)
  const scrollContainer = document.querySelector('.scroll');
  if (scrollContainer) {
    observer.observe(scrollContainer, {
      childList: true,
      subtree: true
    });
  }

  // Первая попытка добавить кнопку
  Lampa.Listener.follow('app', function () {
    addSearchButton();
  });

})();