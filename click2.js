function switchToFirstSearchSource() {
  const searchSources = document.querySelectorAll('.search-source.selector');
  
  if (searchSources.length > 0) {
    searchSources.forEach(source => {
      source.classList.remove('active');
    });
    
    searchSources[0].classList.add('active');
    console.log('Автоматически переключились на первый источник:', searchSources[0].textContent.trim());
    return searchSources[0]; // Возвращаем выбранный элемент при необходимости
  } else {
    console.log('Не найдено элементов с классом "search-source selector"');
    return null;
  }
}

// Вызываем функцию при загрузке страницы
window.addEventListener('DOMContentLoaded', switchToFirstSearchSource);

// Или по клику на кнопку, например:
// document.getElementById('someButton').addEventListener('click', switchToFirstSearchSource);