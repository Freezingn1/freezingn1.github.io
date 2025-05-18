(function() {
  // Конфигурация задержек (в миллисекундах)
  const INITIAL_CLICK_DELAY = 500;  // Первый клик после открытия
  const SECOND_CLICK_DELAY = 800;   // Дополнительный клик
  const KEYPRESS_DELAY = 300;       // Задержка для кнопок пульта

  // Функция для клика по элементу
  function clickElement(element) {
    if (!element) return;
    
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    element.dispatchEvent(clickEvent);
    
    console.log('Произведен клик на:', 
      element.querySelector('.search-source__tab')?.textContent || 'источник');
  }

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

    // Первый клик после активации
    setTimeout(() => clickElement(firstInactive), INITIAL_CLICK_DELAY);
    
    // Дополнительный клик через заданный интервал
    setTimeout(() => clickElement(firstInactive), SECOND_CLICK_DELAY);
  }

  // Улучшенный обработчик TV-пульта
  function handleTVRemote(event) {
    if (event.key === 'Enter' || event.keyCode === 13 || 
        event.key === ' ' || event.keyCode === 32) {
      let targetElement = document.querySelector('.search-source.selector.active') || 
                         document.querySelector('.search-source.selector:hover');
      
      if (targetElement) {
        // Клик с небольшой задержкой для TV
        setTimeout(() => clickElement(targetElement), KEYPRESS_DELAY);
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }

  // Наблюдаем за появлением open--search
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.classList.contains('open--search')) {
        // При открытии меню
        setTimeout(switchSource, INITIAL_CLICK_DELAY);
        document.addEventListener('keydown', handleTVRemote);
      } else {
        // При закрытии меню
        document.removeEventListener('keydown', handleTVRemote);
      }
    });
  });

  // Начинаем наблюдение
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
    subtree: true
  });

  console.log('TV-наблюдатель активирован. Ожидание открытия меню...');
})();