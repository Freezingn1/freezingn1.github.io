// Функция для замены текста и добавления стилей
function modifyCardType() {
  document.querySelectorAll('.card__type').forEach(el => {
    if (el.textContent.trim() === 'TV') el.textContent = 'Сериал';
    
    el.style.background = '#c22222';
    el.style.marginLeft = '0.1em';
  });
}

// Применяем сразу
modifyCardType();

// Отслеживаем изменения DOM (если контент подгружается динамически)
const observer = new MutationObserver(modifyCardType);
observer.observe(document.body, { childList: true, subtree: true });