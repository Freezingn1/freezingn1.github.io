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

    // Функция для проверки видимости элемента
    function isElementVisible(el) {
      return el && el.offsetParent !== null && 
             el.offsetWidth > 0 && 
             el.offsetHeight > 0 &&
             window.getComputedStyle(el).visibility !== 'hidden';
    }

    // Улучшенная функция клика с проверками
    function performClick(element, attempts = 3, delay = 300) {
      if (attempts <= 0) {
        console.log('Превышено количество попыток клика');
        return;
      }

      if (!isElementVisible(element)) {
        console.log('Элемент не видим, повторная попытка...');
        setTimeout(() => performClick(element, attempts - 1, delay), delay);
        return;
      }

      // Создаем более полное событие клика
      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      
      const mouseUpEvent = new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });

      try {
        element.dispatchEvent(mouseDownEvent);
        element.dispatchEvent(mouseUpEvent);
        element.dispatchEvent(clickEvent);
        
        console.log('Успешный клик на:', 
          element.querySelector('.search-source__tab')?.textContent || 'источник');
      } catch (e) {
        console.log('Ошибка при клике:', e);
        setTimeout(() => performClick(element, attempts - 1, delay), delay);
      }
    }

    // Вызываем клик с задержкой
    setTimeout(() => performClick(firstInactive), 500);
  }

  // Обработчик нажатия Enter (TV-пульт)
  function handleEnterKey(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
      const activeElement = document.querySelector('.search-source.selector.active');
      if (activeElement) {
        // Используем улучшенный клик
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        activeElement.dispatchEvent(clickEvent);
        event.preventDefault();
      }
    }
  }

  // Наблюдаем за появлением open--search
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.classList.contains('open--search')) {
        setTimeout(switchSource, 500);
        
        // Добавляем обработчик Enter при открытии поиска
        document.addEventListener('keydown', handleEnterKey);
      } else {
        // Убираем обработчик при закрытии
        document.removeEventListener('keydown', handleEnterKey);
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