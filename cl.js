(function () {
  'use strict';

  // Находим кнопку CUB
  const cubButtons = Array.from(document.querySelectorAll('.search-source__tab'));
  const cubButton = cubButtons.find(btn => btn.textContent.trim() === 'CUB');

  if (!cubButton) {
    console.error('Кнопка CUB не найдена!');
    return;
  }

  // Устанавливаем фокус
  if (typeof Controller !== 'undefined' && Controller.collectionFocus) {
    // Если есть Controller с методом collectionFocus
    Controller.collectionFocus(cubButton, typeof _this2 !== 'undefined' ? _this2.render() : null);
  } else {
    // Стандартный способ фокусировки
    cubButton.focus();
    
    // Добавляем tabindex если элемент не фокусируемый по умолчанию
    if (!cubButton.hasAttribute('tabindex')) {
      cubButton.setAttribute('tabindex', '-1');
    }
  }

  // Эмулируем нажатие (пробуем разные методы)
  try {
    // 1. Просто click()
    cubButton.click();
    
    // 2. Создаем событие мыши (для более полной эмуляции)
    const mouseEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    cubButton.dispatchEvent(mouseEvent);
    
    // 3. KeyboardEvent для TV-приложений
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      keyCode: 13,
      code: 'Enter',
      bubbles: true
    });
    cubButton.dispatchEvent(enterEvent);
    
  } catch (e) {
    console.error('Ошибка при эмуляции нажатия:', e);
  }

  // Дополнительно для SmartTV платформ
  if (typeof webapis !== 'undefined') {
    try {
      webapis.tvinputdevice.triggerKey("Enter");
    } catch (e) {
      console.warn('Не удалось использовать TV WebAPI:', e);
    }
  }
})();