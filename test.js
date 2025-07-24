document.addEventListener('DOMContentLoaded', function() {
  const filtersContainer = document.querySelector('.b-collection-filters');
  if (!filtersContainer) return;

  // Создаем кнопку
  const toggleBtn = document.createElement('div');
  toggleBtn.textContent = 'Показать фильтры ▼';
  toggleBtn.style.cssText = 'padding: 10px; background: #f0f0f0; text-align: center; cursor: pointer; margin-bottom: 10px;';
  
  filtersContainer.prepend(toggleBtn);

  // Вешаем обработчик
  toggleBtn.addEventListener('click', function() {
    const isExpanded = filtersContainer.classList.toggle('filters-expanded');
    toggleBtn.textContent = isExpanded ? 'Скрыть фильтры ▲' : 'Показать фильтры ▼';
    
    // Показываем/скрываем блоки
    const blocks = filtersContainer.querySelectorAll('.block');
    blocks.forEach(block => {
      block.style.display = isExpanded ? 'block' : 'none';
    });
  });
});