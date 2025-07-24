// Создаем кнопку
const toggleBtn = document.createElement('div');
toggleBtn.className = 'filters-toggle-btn';
toggleBtn.textContent = 'Показать фильтры ▼';

// Вставляем кнопку перед фильтрами
const filtersContainer = document.querySelector('.b-collection-filters');
filtersContainer?.parentNode.insertBefore(toggleBtn, filtersContainer);

// Обработчик клика
toggleBtn.addEventListener('click', function() {
  const isExpanded = filtersContainer.classList.toggle('filters-expanded');
  this.textContent = isExpanded ? 'Скрыть фильтры ▲' : 'Показать фильтры ▼';
});

// Инициализация - скрываем фильтры при загрузке
if (filtersContainer) {
  filtersContainer.classList.remove('filters-expanded');
}