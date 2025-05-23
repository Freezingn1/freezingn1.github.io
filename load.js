(() => {
  // Создаем элементы прелоадера
  const preloader = document.createElement('div');
  preloader.id = 'preloader';
  
  const loader = document.createElement('div');
  loader.className = 'loader';
  
  // Стили
  const style = document.createElement('style');
  style.textContent = `
    #preloader {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #ffffff;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      transition: opacity 0.5s ease;
    }
    
    .loader {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  
  // Добавляем в DOM
  document.head.appendChild(style);
  preloader.appendChild(loader);
  document.body.insertBefore(preloader, document.body.firstChild);

  // Функция скрытия прелоадера
  const hidePreloader = () => {
    preloader.style.opacity = '0';
    preloader.addEventListener('transitionend', () => {
      preloader.remove();
      style.remove(); // Удаляем стили тоже
    });
  };

  // Таймаут на случай, если load не сработает
  const loadTimeout = setTimeout(() => {
    window.removeEventListener('load', hidePreloader);
    hidePreloader();
    console.warn('Прелоадер отключен по таймауту');
  }, 10000); // 10 секунд максимум

  // Основной обработчик загрузки
  window.addEventListener('load', () => {
    clearTimeout(loadTimeout);
    hidePreloader();
  });

  // Дополнительная проверка для SPA/асинхронного контента
  if (document.readyState === 'complete') {
    clearTimeout(loadTimeout);
    hidePreloader();
  }
})();