// Добавьте этот код в ваш JavaScript файл или в тег <script>

let isFirstScroll = true; // Флаг для отслеживания первого скролла

window.addEventListener('wheel', function(e) {
    // Проверяем, что это первый скролл вниз
    if (isFirstScroll && e.deltaY > 0) {
        isFirstScroll = false; // Устанавливаем флаг в false, чтобы больше не срабатывало
        
        // Находим элемент, к которому нужно прокрутить
        const targetElement = document.querySelector('.items-line__title');
        
        if (targetElement) {
            e.preventDefault(); // Отменяем стандартное поведение скролла
            
            // Плавная прокрутка к элементу
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Сброс флага при открытии новой карточки
// (нужно вызывать этот код при каждом открытии новой карточки)
function resetScrollBehavior() {
    isFirstScroll = true;
}
