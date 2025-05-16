/**
 * Скрывает блок с выбором источника поиска при входе в open--search
 */
function hideSearchSource() {
    // Проверяем, находимся ли в разделе open--search
    if (!window.location.hash.includes('open--search')) return;

    // Ищем элемент
    const searchSourceElement = document.querySelector('.search-source.selector');
    
    // Если элемент найден — скрываем его
    if (searchSourceElement) {
        searchSourceElement.style.display = 'none';
        return true; // Успешно скрыто
    }
    
    return false; // Элемент не найден (возможно, ещё не загружен)
}

// Пытаемся скрыть сразу при загрузке страницы
hideSearchSource();

// Если Lampa подгружает контент динамически, используем MutationObserver
const observer = new MutationObserver((mutations) => {
    const isHidden = hideSearchSource();
    if (isHidden) observer.disconnect(); // Останавливаем, если элемент скрыт
});

// Начинаем наблюдение за изменениями в DOM
observer.observe(document.body, {
    childList: true,
    subtree: true,
});