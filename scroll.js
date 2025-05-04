// Add this code to ensure consistent scrolling behavior
(function() {
    'use strict';

    // Function to scroll to "Подробно" section
    function scrollToDetails() {
        const detailsElement = document.querySelector('.cardify__details');
        if (detailsElement) {
            // Calculate the position to scroll to
            const elementRect = detailsElement.getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.pageYOffset;
            const middlePosition = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2);
            
            // Smooth scroll to the position
            window.scrollTo({
                top: middlePosition,
                behavior: 'smooth'
            });
            
            // Hide everything above the details section
            const elementsAbove = document.querySelectorAll('.cardify__left, .full-start-new__head, .full-start-new__title');
            elementsAbove.forEach(el => {
                el.style.opacity = '0';
                el.style.transition = 'opacity 0.3s';
            });
        }
    }

    // Listen for scroll events
    let lastScrollPosition = 0;
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        
        // Detect scroll direction
        const currentScrollPosition = window.pageYOffset;
        const scrollDirection = currentScrollPosition > lastScrollPosition ? 'down' : 'up';
        lastScrollPosition = currentScrollPosition;
        
        // Only trigger on downward scroll
        if (scrollDirection === 'down') {
            scrollTimeout = setTimeout(() => {
                scrollToDetails();
            }, 100); // Small delay to ensure it's a deliberate scroll
        }
    });

    // Also trigger when the page loads if needed
    document.addEventListener('DOMContentLoaded', function() {
        // Check if we need to scroll to details immediately
        if (window.location.hash === '#details') {
            scrollToDetails();
        }
    });
})();