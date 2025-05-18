(function() {
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

    // Создаем более надежное событие клика
    setTimeout(() => {
      // Попробуем разные методы клика
      if (typeof firstInactive.click === 'function') {
        firstInactive.click();
        console.log('Использован нативный метод click()');
      } else {
        // Создаем более полное событие
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: firstInactive.getBoundingClientRect().left + 10,
          clientY: firstInactive.getBoundingClientRect().top + 10
        });
        
        // Добавляем дополнительные свойства для TV
        clickEvent.isTrusted = true;
        
        // Диспатчим событие
        const result = firstInactive.dispatchEvent(clickEvent);
        
        console.log('Событие клика отправлено, результат:', result);
      }
      
      console.log('Автоматически переключено на:', 
        firstInactive.querySelector('.search-source__tab')?.textContent || 'источник');
    }, 500); // Увеличим задержку
  }

  // Альтернативный подход для TV
  function checkAndSwitch() {
    const searchOpen = document.querySelector('.open--search');
    if (searchOpen) {
      switchSource();
    } else {
      setTimeout(checkAndSwitch, 1000);
    }
  }

  // Наблюдатель + таймер для надежности
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.classList.contains('open--search')) {
        setTimeout(switchSource, 800);
      }
    });
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
    subtree: true
  });

  // Запускаем проверку через таймер на случай проблем с MutationObserver
  setTimeout(checkAndSwitch, 3000);

  console.log('Скрипт активирован, ожидание открытия поиска...');
})();