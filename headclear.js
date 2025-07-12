function removeSursText() {
    const headTitle = document.querySelector('div.head__title');
    if (headTitle && headTitle.textContent.includes(' - SURS')) {
        headTitle.textContent = headTitle.textContent.replace(' - SURS', '');
        console.log('[Lampa Extension] Removed "- SURS"');
    }
}

// Запуск после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeSursText);
} else {
    removeSursText(); // DOM уже загружен
}