(function() {
  // Конфигурация
  const CLICK_DELAY = 1000;
  const OPEN_DELAY = 1300;
  
  // Универсальная функция клика
  function triggerClick(element) {
    if (!element) return;
    
    // 1. Попытка стандартного клика
    try {
      element.click();
      console.log('Стандартный клик выполнен');
      return;
    } catch (e) {}
    
    // 2. Создание MouseEvent
    try {
      const mouseEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      element.dispatchEvent(mouseEvent);
      console.log('MouseEvent клик выполнен');
      return;
    } catch (e) {}
    
    // 3. Создание TouchEvent (для некоторых TV)
    try {
      const touchEvent = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      element.dispatchEvent(touchEvent);
      console.log('TouchEvent клик выполнен');
      return;
    } catch (e) {}
    
    // 4. Активация через focus+keydown (крайний случай)
    try {
      element.focus();
      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        bubbles: true
      });
      element.dispatchEvent(keyboardEvent);
      console.log('KeyboardEvent клик выполнен');
    } catch (e) {
      console.error('Все методы клика не сработали', e);
    }
  }

  function switchSource() {
    const firstInactive = document.querySelector('.search-source.selector:not(.active)');
    if (!firstInactive) {
      console.log('Не найдено неактивных элементов');
      return;
    }

    document.querySelectorAll('.search-source.selector.active').forEach(el => {
      el.classList.remove('active');
    });

    firstInactive.classList.add('active');

    setTimeout(() => {
      triggerClick(firstInactive);
      console.log('Автоматически переключено на:', 
        firstInactive.querySelector('.search-source__tab')?.textContent || 'источник');
    }, CLICK_DELAY);
  }

  // Обработчик нажатий пульта
  function handleRemoteKey(event) {
    // Enter/OK
    if (event.key === 'Enter' || event.keyCode === 13 || event.key === 'OK') {
      const activeElement = document.querySelector('.search-source.selector.active') || 
                          document.querySelector('.search-source.selector:hover');
      if (activeElement) {
        setTimeout(() => triggerClick(activeElement), 300);
        event.preventDefault();
      }
    }
    // Другие кнопки пульта при необходимости
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.classList.contains('open--search')) {
        setTimeout(switchSource, OPEN_DELAY);
        document.addEventListener('keydown', handleRemoteKey);
      } else {
        document.removeEventListener('keydown', handleRemoteKey);
      }
    });
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
    subtree: true
  });

  // Инициализация фокуса для TV
  document.addEventListener('DOMContentLoaded', () => {
    const firstElement = document.querySelector('.search-source.selector');
    if (firstElement) {
      setTimeout(() => firstElement.focus(), 2000);
    }
  });

  console.log('TV-оптимизированный наблюдатель активирован');
})();