(function() {
  // Конфигурация задержек
  const CLICK_DELAY = 400;  // Оптимальная задержка для TV
  const OPEN_DELAY = 600;

  // Улучшенная функция клика для TV
  function tvClick(element) {
    if (!element) return;
    
    // 1. Создаем событие мыши
    const mouseEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    
    // 2. Добавляем дополнительные свойства для TV
    mouseEvent.isTrusted = true;
    mouseEvent.remote = false;
    
    // 3. Двойная проверка перед кликом
    setTimeout(() => {
      if (document.body.contains(element)) {
        // 4. Триггерим все возможные события
        element.dispatchEvent(new Event('mousedown'));
        element.dispatchEvent(new Event('mouseup'));
        element.dispatchEvent(mouseEvent);
        
        console.log('TV Click выполнен на:', element.textContent.trim());
      }
    }, CLICK_DELAY);
  }

  function switchSource() {
    const firstInactive = document.querySelector('.search-source.selector:not(.active)');
    if (!firstInactive) return;

    document.querySelectorAll('.search-source.selector.active').forEach(el => {
      el.classList.remove('active');
    });

    firstInactive.classList.add('active');
    tvClick(firstInactive);  // Используем улучшенный клик
  }

  // Обработчик TV-пульта
  function handleRemoteKeys(event) {
    if ([13, 32, 29443].includes(event.keyCode)) {  // Enter, Space, DPAD_CENTER
      const target = document.querySelector('.search-source.selector.active') || 
                    document.querySelector('.search-source.selector:hover');
      if (target) {
        tvClick(target);
        event.preventDefault();
      }
    }
  }

  // Наблюдатель с улучшенной логикой
  const observer = new MutationObserver(() => {
    if (document.body.classList.contains('open--search')) {
      setTimeout(() => {
        switchSource();
        document.addEventListener('keydown', handleRemoteKeys);
      }, OPEN_DELAY);
    } else {
      document.removeEventListener('keydown', handleRemoteKeys);
    }
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
    childList: false,
    subtree: false
  });

  console.log('TV Interaction Handler готов');
})();