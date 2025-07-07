(function () {
  'use strict';

  if (!window.Lampa) {
    console.error('Lampa не найдена!');
    return;
  }

  // Функция для добавления кнопки
  function addSearchButton() {
    // Находим контейнер меню
    const selectBox = document.querySelector('.selectbox__content.layer--height');
    if (!selectBox) return false; // Если меню ещё нет, выходим

    // Проверяем, не добавлена ли кнопка уже
    if (selectBox.querySelector('.custom-search-button')) return true;

    // Создаём кнопку "Поиск серии"
    const searchButton = document.createElement('div');
    searchButton.className = 'selectbox-item selector custom-search-button'; // Те же классы, что у других пунктов
    searchButton.innerHTML = '<div class="selectbox-item__name">Поиск серии</div>';

    // Добавляем обработчик клика
    searchButton.addEventListener('click', function () {
      alert('Поиск серии запущен!'); // Пока заглушка, потом заменим на реальный поиск
    });

    // Вставляем кнопку в меню (например, после первого элемента)
    const firstItem = selectBox.querySelector('.selectbox-item.selector');
    if (firstItem) {
      firstItem.after(searchButton); // Добавляем после первой кнопки
    } else {
      selectBox.prepend(searchButton); // Если не нашли, вставляем в начало
    }

    return true;
  }

  // Мониторим появление меню (на случай, если оно открывается динамически)
  const observer = new MutationObserver(function () {
    addSearchButton();
  });

  // Начинаем наблюдать за изменениями в DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Пробуем добавить кнопку сразу (если меню уже есть)
  Lampa.Listener.follow('app', function () {
    addSearchButton();
  });

})();