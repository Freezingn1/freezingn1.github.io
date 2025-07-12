// Функция для удаления "- SURS"
function removeSursText() {
    const headTitle = document.querySelector('div.head__title');
    if (headTitle && headTitle.textContent.includes(' - SURS')) {
        headTitle.textContent = headTitle.textContent.replace(' - SURS', '');
        console.log('[SURS Remover] Текст изменён:', headTitle.textContent);
        return true;
    }
    return false;
}

// 1. MutationObserver — следит за изменениями в DOM
const observer = new MutationObserver((mutations) => {
    removeSursText();
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});

// 2. Проверяем каждые 500 мс (на случай, если Observer не сработает)
const interval = setInterval(removeSursText, 500);

// 3. Запускаем сразу при загрузке
removeSursText();

// 4. Следим за событиями SPA (например, переходы в Vue/React)
window.addEventListener('popstate', removeSursText); // Назад/Вперёд
window.addEventListener('pushState', removeSursText); // Если сайт использует History API