// Находим все элементы с классом card__type и применяем изменения
document.querySelectorAll('.card__type').forEach(el => {
  if (el.textContent.trim() === 'TV') el.textContent = 'Сериал';
  
  // Добавляем стили
  el.style.background = '#c22222';
  el.style.marginLeft = '0.1em';
});