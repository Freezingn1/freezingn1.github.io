document.querySelector('.b-collection-filters').addEventListener('click', function(e) {
  if (e.target === this || e.target === this.querySelector('::before')) {
    const blocks = this.querySelectorAll('.block');
    const isHidden = blocks[0].style.display === 'none';
    
    blocks.forEach(block => {
      block.style.display = isHidden ? 'block' : 'none';
    });
    
    this.setAttribute('data-collapsed', !isHidden);
  }
});