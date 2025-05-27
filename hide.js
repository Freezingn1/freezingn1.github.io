// Скрываем элементы по data-component
document.querySelectorAll('.settings-folder.selector[data-component="player"], .settings-folder.selector[data-component="parental_control"], .settings-folder.selector[data-component="filmix"]').forEach(el => {
    el.style.display = 'none';
});