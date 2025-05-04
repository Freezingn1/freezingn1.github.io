// Функция для улучшения качества фона в карточке до w1920
function improveBackgroundQuality() {
  // Находим все элементы с фоновым изображением в карточках
  const cards = document.querySelectorAll('[style*="background-image"]');
  
  cards.forEach(card => {
    // Получаем текущий URL фонового изображения
    const style = card.getAttribute('style');
    const urlMatch = style.match(/url\(["']?(.*?)["']?\)/);
    
    if (urlMatch && urlMatch[1]) {
      let imageUrl = urlMatch[1];
      
      // Заменяем параметры качества/размера в URL
      // Вариант 1: если URL содержит параметры размера (например w300)
      if (imageUrl.includes('w300') || imageUrl.includes('w600')) {
        imageUrl = imageUrl.replace(/w\d+/, 'w1920');
      } 
      // Вариант 2: если URL содержит параметр качества (например q50)
      else if (imageUrl.includes('q50') || imageUrl.includes('q75')) {
        imageUrl = imageUrl.replace(/q\d+/, 'q95');
      }
      // Вариант 3: просто добавляем параметр w1920, если нет других параметров
      else {
        // Проверяем, есть ли уже query-параметры
        const separator = imageUrl.includes('?') ? '&' : '?';
        imageUrl += `${separator}w1920`;
      }
      
      // Обновляем фоновое изображение с новым URL
      card.style.backgroundImage = `url("${imageUrl}")`;
    }
  });
}

// Вызываем функцию сразу и при загрузке нового контента (если есть динамическая подгрузка)
improveBackgroundQuality();

// Для динамически подгружаемого контента можно использовать MutationObserver
const observer = new MutationObserver(improveBackgroundQuality);
observer.observe(document.body, { childList: true, subtree: true });