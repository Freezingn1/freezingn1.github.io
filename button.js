// Находим контейнер с кнопками
const buttonsContainer = document.querySelector('.full-start-new__buttons');

// Находим кнопку "Смотреть"
const playButton = document.querySelector('.button--play');

// Перемещаем её в начало контейнера
if (buttonsContainer && playButton) {
  buttonsContainer.insertBefore(playButton, buttonsContainer.firstChild);
}