(function() {
  // Функция для переключения источника
  function switchSource() {
    const firstInactive = document.querySelector('.search-source.selector:not(.active)');
    if (!firstInactive) {
      console.log('Не найдено неактивных элементов');
      return;
    }

    // Удаляем active у всех
    document.querySelectorAll('.search-source.selector.active').forEach(el => {
      el.classList.remove('active');
    });

    // Активируем найденный элемент
    firstInactive.classList.add('active');

    // Эмулируем клик
    setTimeout(() => {
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      firstInactive.dispatchEvent(clickEvent);
      
      console.log('Автоматически переключено на:', 
        firstInactive.querySelector('.search-source__tab')?.textContent || 'источник');
    }, 300); // Задержка перед кликом
  }

  // Наблюдаем за появлением open--search
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.classList.contains('open--search')) {
        // Небольшая задержка после открытия
        setTimeout(switchSource, 500);
      }
    });
  });

  // Начинаем наблюдение за body
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
    subtree: true
  });

  console.log('Наблюдатель активирован, ждём открытия поиска...');
})();