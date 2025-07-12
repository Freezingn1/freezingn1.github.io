// Находим все элементы с классом head__title
const headTitles = document.querySelectorAll('div.head__title');

// Перебираем найденные элементы
headTitles.forEach(element => {
  // Проверяем, содержит ли элемент текст "Главная - SURS"
  if (element.textContent.includes('Главная - SURS')) {
    // Заменяем текст, удаляя "- SURS"
    element.textContent = element.textContent.replace(' - SURS', '');
    
    // Альтернативный вариант, если нужно точно "Главная - SURS"
    // element.textContent = 'Главная';
  }
});