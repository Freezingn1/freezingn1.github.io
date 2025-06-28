// Функция для замены текста и добавления стилей
function modifyCardType() {
  const isVerticalCards = document.querySelector('.new-interface')?.classList.contains('vertical-cards');
  const fontSize = isVerticalCards ? '0.7em' : '0.9em';

  document.querySelectorAll('.card__type').forEach(el => {
    if (el.textContent.trim() === 'TV') el.textContent = 'Сериал';
    
    el.style.marginLeft = '0.1em';
    el.style.fontSize = fontSize;
  });
}

// Применяем сразу
modifyCardType();

// Отслеживаем изменения DOM (если контент подгружается динамически)
const observer = new MutationObserver(modifyCardType);
observer.observe(document.body, { childList: true, subtree: true });

// Также отслеживаем изменения в настройках ориентации карточек
Lampa.Storage.listener.follow('change', (e) => {
  if (e.name === 'card_orientation') {
    modifyCardType();
  }
});