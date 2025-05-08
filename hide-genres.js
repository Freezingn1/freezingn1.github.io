(function() {
    if (typeof Lampa === 'undefined') return;

    const observer = new MutationObserver(() => {
        const genreBlock = document.querySelector('.full-start-new__details-item:nth-child(2)');
        if (genreBlock) genreBlock.style.display = 'none';
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();