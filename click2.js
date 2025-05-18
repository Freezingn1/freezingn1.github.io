(function() {
  // Конфигурация задержек
  const CLICK_DELAY = 300;  // Задержка эмуляции клика
  const OPEN_DELAY = 500;   // Задержка после открытия
  
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

    // Эмулируем клик с задержкой
    setTimeout(() => {
      firstInactive.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
      
      console.log('Переключено на:', 
        firstInactive.querySelector('.search-source__tab')?.textContent || 'источник');
    }, CLICK_DELAY);
  }

  // Обработчик TV-пульта
  function handleRemoteKeys(event) {
    // Поддержка Enter, OK (DPAD_CENTER) и пробела
    if (event.key === 'Enter' || event.keyCode === 13 || 
        event.key === ' ' || event.keyCode === 32) {
      const active = document.querySelector('.search-source.selector.active') || 
                    document.querySelector('.search-source.selector:hover');
      if (active) {
        setTimeout(() => active.click(), CLICK_DELAY);
        event.preventDefault();
      }
    }
  }

  // Наблюдатель за открытием поиска
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.classList.contains('open--search')) {
        setTimeout(switchSource, OPEN_DELAY);
        document.addEventListener('keydown', handleRemoteKeys);
      } else {
        document.removeEventListener('keydown', handleRemoteKeys);
      }
    });
  });

  // Инициализация
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
    subtree: true
  });

  console.log('TV-наблюдатель активирован');
})();