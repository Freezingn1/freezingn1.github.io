const observer = new MutationObserver(() => {
    const elements = document.querySelectorAll('.settings-folder.selector[data-component="player"], .settings-folder.selector[data-component="parental_control"], .settings-folder.selector[data-component="filmix"]');
    
    if (elements.length) {
        elements.forEach(el => el.style.display = 'none');
        observer.disconnect(); // Останавливаем после скрытия
    }
});

observer.observe(document.body, { childList: true, subtree: true });