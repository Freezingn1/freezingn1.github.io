(function() {
  // Конфигурация
  const CLICK_DELAY = 1000;
  const OPEN_DELAY = 1300;
  let currentFocusedIndex = 0;
  let sourceElements = [];

  // Инициализация элементов
  function initSources() {
    sourceElements = Array.from(document.querySelectorAll('.search-source.selector'));
    if (sourceElements.length > 0) {
      updateFocus();
    }
  }

  // Обновление фокуса
  function updateFocus() {
    sourceElements.forEach((el, index) => {
      el.classList.toggle('focused', index === currentFocusedIndex);
      el.classList.toggle('active', index === currentFocusedIndex);
    });
  }

  // Универсальный клик
  function triggerClick(element) {
    if (!element) return;
    
    // Все возможные методы активации
    const methods = [
      () => element.click(),
      () => element.dispatchEvent(new MouseEvent('click', {bubbles: true})),
      () => element.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true})),
      () => {
        element.focus();
        element.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', keyCode: 13}));
      }
    ];

    for (const method of methods) {
      try {
        method();
        console.log('Клик выполнен методом:', method.name);
        return;
      } catch (e) {}
    }
  }

  // Навигация DPAD
  function handleDPad(direction) {
    if (sourceElements.length === 0) return;

    const oldIndex = currentFocusedIndex;
    
    switch(direction) {
      case 'up': 
        currentFocusedIndex = Math.max(0, currentFocusedIndex - 1);
        break;
      case 'down':
        currentFocusedIndex = Math.min(sourceElements.length - 1, currentFocusedIndex + 1);
        break;
      case 'left':
        currentFocusedIndex = Math.max(0, currentFocusedIndex - 1);
        break;
      case 'right':
        currentFocusedIndex = Math.min(sourceElements.length - 1, currentFocusedIndex + 1);
        break;
    }

    if (oldIndex !== currentFocusedIndex) {
      updateFocus();
    }
  }

  // Обработчик кнопок пульта
  function handleRemoteKey(event) {
    const key = event.key || event.keyCode;
    
    // Навигация
    if ([37, 'ArrowLeft'].includes(key)) handleDPad('left');
    if ([38, 'ArrowUp'].includes(key)) handleDPad('up');
    if ([39, 'ArrowRight'].includes(key)) handleDPad('right');
    if ([40, 'ArrowDown'].includes(key)) handleDPad('down');
    
    // Подтверждение выбора
    if ([13, 'Enter', 'OK'].includes(key)) {
      const focusedElement = sourceElements[currentFocusedIndex];
      if (focusedElement) {
        setTimeout(() => triggerClick(focusedElement), 300);
        event.preventDefault();
      }
    }
  }

  // Основная логика
  function switchSource() {
    initSources();
    if (sourceElements.length > 0) {
      currentFocusedIndex = 0;
      updateFocus();
      setTimeout(() => triggerClick(sourceElements[0]), CLICK_DELAY);
    }
  }

  // Наблюдатель
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

  // Инициализация
  observer.observe(document.body, {attributes: true, attributeFilter: ['class'], subtree: true});
  document.addEventListener('DOMContentLoaded', initSources);
  console.log('TV-контроллер инициализирован (OK+DPAD поддержка)');
})();