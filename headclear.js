// Ждём, пока surs.js загрузит текст
function removeSursText() {
    const headTitle = document.querySelector('div.head__title');
    if (headTitle && headTitle.textContent.includes(' - SURS')) {
        headTitle.textContent = headTitle.textContent.replace(' - SURS', '');
        console.log('[SURS Remover] Текст изменён:', headTitle.textContent);
        return true; // Успешно
    }
    return false;
}

// Вариант 1: MutationObserver (для динамического контента)
const observer = new MutationObserver(() => {
    if (removeSursText()) {
        observer.disconnect(); // Останавливаем, если нашли
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});

// Вариант 2: Интервал (на случай, если MutationObserver не сработает)
const interval = setInterval(() => {
    if (removeSursText()) {
        clearInterval(interval);
    }
}, 500);

// Если DOM уже готов, пробуем сразу
document.addEventListener('DOMContentLoaded', removeSursText);
removeSursText(); // Проверяем при загрузке скрипта