// Найти все элементы с обоими классами
const elements = document.querySelectorAll('.full-descr__text.selector');

// Удалить класс 'selector' у каждого элемента
elements.forEach(el => {
    el.classList.remove('selector');
});