(function autoSwitchSource() {
  try {
    // 1. Находим все неактивные элементы
    const inactiveSources = Array.from(document.querySelectorAll('.search-source.selector:not(.active)'));
    
    if (inactiveSources.length === 0) {
      console.warn('Все источники уже активны или элементы не найдены');
      return null;
    }

    // 2. Выбираем первый неактивный
    const targetElement = inactiveSources[0];
    
    // 3. Деактивируем все остальные
    document.querySelectorAll('.search-source.selector.active').forEach(el => {
      el.classList.remove('active');
    });

    // 4. Активируем выбранный
    targetElement.classList.add('active');
    
    // 5. Получаем название вкладки для логов
    const tabName = targetElement.querySelector('.search-source__tab')?.textContent?.trim() || 'неизвестный источник';
    
    // 6. Создаём кастомное событие клика с дополнительными параметрами
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
      composed: true,
      detail: 1, // количество кликов
      buttons: 1 // левая кнопка мыши
    });

    // 7. Добавляем небольшой таймаут для надёжности
    setTimeout(() => {
      // 8. Диспатчим событие
      const clickResult = targetElement.dispatchEvent(clickEvent);
      
      // 9. Логируем результат
      console.log(`✅ Успешно: ${tabName}`, {
        element: targetElement,
        eventDispatched: clickResult,
        timestamp: new Date().toISOString()
      });
    }, 50);

    return targetElement;
  } catch (error) {
    console.error('Ошибка при автоматическом переключении:', error);
    return null;
  }
})();