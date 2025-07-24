// Ждём загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  const filtersContainer = document.querySelector('.b-collection-filters');
  
  // Проверяем, что контейнер существует
  if (!filtersContainer) {
    console.error('Контейнер фильтров не найден!');
    return;
  }

  // Создаём кнопку
  const toggleBtn = document.createElement('div');
  toggleBtn.textContent = 'Показать фильтры ▼';
  toggleBtn.style.cssText = `
    padding: 10px;
    background: #f0f0f0;
    text-align: center;
    cursor: pointer;
    margin-bottom: 10px;
    border-radius: 4px;
    font-weight: bold;
    user-select: none;
  `;

  // Вставляем кнопку перед фильтрами
  filtersContainer.insertBefore(toggleBtn, filtersContainer.firstChild);

  // Обработчик клика
  toggleBtn.addEventListener('click', function() {
    const isExpanded = filtersContainer.classList.toggle('filters-expanded');
    
    // Меняем текст кнопки
    toggleBtn.textContent = isExpanded ? 'Скрыть фильтры ▲' : 'Показать фильтры ▼';
    
    // Переключаем видимость всех блоков
    const blocks = filtersContainer.querySelectorAll('.block');
    blocks.forEach(block => {
      block.style.display = isExpanded ? 'block' : 'none';
    });
  });

  // Скрываем фильтры при загрузке
  filtersContainer.querySelectorAll('.block').forEach(block => {
    block.style.display = 'none';
  });
});