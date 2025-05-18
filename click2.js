(function() {
  // Функция для активации первого найденного элемента
  function activateFirstSource() {
    // Находим первый элемент с классом search-source selector
    const firstSource = document.querySelector('.search-source.selector');
    
    if (!firstSource) {
      console.log('Элементы .search-source.selector не найдены');
      return;
    }

    // Удаляем active у всех элементов
    document.querySelectorAll('.search-source.selector.active').forEach(el => {
      el.classList.remove('active');
    });

    // Добавляем active к найденному элементу
    firstSource.classList.add('active');

    console.log('Активирован первый найденный элемент:', firstSource);
  }

  // Наблюдаем за изменениями DOM
  const observer = new MutationObserver((mutations) => {
    // Проверяем, появился ли нужный элемент
    if (document.querySelector('.search-source.selector')) {
      // Вызываем функцию активации с небольшой задержкой
      setTimeout(activateFirstSource, 100);
      
      // Можно отключить наблюдатель после выполнения
      observer.disconnect();
      console.log('Наблюдатель отключен после активации элемента');
    }
  });

  // Начинаем наблюдение за всем документом
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  console.log('Наблюдатель активирован, ищем .search-source.selector...');
})();