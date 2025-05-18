(function() {
  // 1. Находим первый неактивный элемент
  const firstInactive = document.querySelector('.search-source.selector:not(.active)');
  
  if (!firstInactive) {
    console.error('Не найдено неактивных элементов');
    return;
  }

  // 2. Удаляем active у всех
  document.querySelectorAll('.search-source.selector.active').forEach(el => {
    el.classList.remove('active');
  });

  // 3. Добавляем active к найденному элементу
  firstInactive.classList.add('active');

  // 4. Эмулируем полноценный клик
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  
  firstInactive.dispatchEvent(clickEvent);

  // 5. Результат в консоль
  const tabName = firstInactive.querySelector('.search-source__tab')?.textContent || 'источник';
  console.log(`✔ Сделан клик по "${tabName}"`);
  return firstInactive;
})();