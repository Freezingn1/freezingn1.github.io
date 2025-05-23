// Создаем элементы прелоадера
const preloader = document.createElement('div');
preloader.id = 'preloader';

const loader = document.createElement('div');
loader.className = 'loader';

// Добавляем стили
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

// Добавляем элементы в DOM
document.head.appendChild(style);
preloader.appendChild(loader);
document.body.appendChild(preloader);

// Функция для скрытия прелоадера
function hidePreloader() {
    preloader.style.opacity = '0';
    preloader.addEventListener('transitionend', () => {
        preloader.remove();
    });
}

// Ждем полной загрузки страницы
window.addEventListener('load', () => {
    // Искусственная задержка для демонстрации (можно убрать)
    setTimeout(hidePreloader, 1000);
});

// Альтернатива: скрывать, когда DOM готов (но ресурсы могут еще грузиться)
// document.addEventListener('DOMContentLoaded', hidePreloader);