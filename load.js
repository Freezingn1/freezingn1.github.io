(() => {
  // Проверяем, не завершилась ли уже загрузка
  if (document.readyState === 'complete') {
    return;
  }

  // Создаем элементы прелоадера
  const preloader = document.createElement('div');
  preloader.id = 'preloader-overlay';
  
  const loader = document.createElement('div');
  loader.className = 'preloader-spinner';

  // Добавляем стили
  const style = document.createElement('style');
  style.textContent = `
    #preloader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      transition: opacity 0.5s ease;
    }
    
    .preloader-spinner {
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
    
    body.loaded #preloader-overlay {
      opacity: 0;
      pointer-events: none;
    }
  `;

  // Добавляем элементы в DOM
  document.head.appendChild(style);
  preloader.appendChild(loader);
  document.body.appendChild(preloader);

  // Функция для завершения загрузки
  const completeLoading = () => {
    document.body.classList.add('loaded');
    setTimeout(() => {
      preloader.remove();
      style.remove();
    }, 500); // Совпадает с временем transition
  };

  // Таймаут на случай проблем
  const failSafeTimeout = setTimeout(completeLoading, 10000);

  // Основные события загрузки
  const handleLoad = () => {
    clearTimeout(failSafeTimeout);
    completeLoading();
  };

  window.addEventListener('load', handleLoad);
  document.addEventListener('DOMContentLoaded', handleLoad);

  // Дополнительная проверка для SPA
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    handleLoad();
  }
})();