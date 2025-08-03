document.addEventListener('DOMContentLoaded', function() {
  // Встраиваем необходимые CSS стили
  const style = document.createElement('style');
  style.textContent = `
    .scroll__container {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }
    
    .scroll__body {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      will-change: transform;
      transform: translate3d(0, 0, 0);
    }
    
    .items-line {
      width: 100%;
      min-height: 100vh;
      position: relative;
    }
    
    /* Анимация для плавного скролла */
    .scroll-transition {
      transition: transform 0.5s ease-out !important;
    }
  `;
  document.head.appendChild(style);

  // Основной класс кастомного скролла
  class CustomScroll {
    constructor() {
      this.scrollBody = document.querySelector('.scroll__body');
      if (!this.scrollBody) {
        console.error('Элемент .scroll__body не найден');
        return;
      }

      this.isFirstScroll = true;
      this.currentPosition = 0;
      this.sectionPositions = [];
      this.emToPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
      this.targetFirstPosition = -42; // в em
      this.animationDuration = 500; // ms
      this.isAnimating = false;
      this.touchStartY = 0;

      this.init();
    }

    init() {
      this.calculateEmToPx();
      this.calculateSectionPositions();
      this.setupEventListeners();
      this.setInitialPosition();
    }

    calculateEmToPx() {
      this.emToPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    }

    calculateSectionPositions() {
      const sections = document.querySelectorAll('.items-line');
      this.sectionPositions = Array.from(sections).map(section => section.offsetTop);
    }

    setInitialPosition() {
      // Устанавливаем начальную позицию без анимации
      const targetPx = this.targetFirstPosition * this.emToPx;
      this.scrollBody.style.transition = 'none';
      this.scrollBody.style.transform = `translate3d(0, ${targetPx}px, 0)`;
      this.currentPosition = targetPx;
      
      // Через небольшой таймаут включаем анимации
      setTimeout(() => {
        this.scrollBody.classList.add('scroll-transition');
      }, 50);
    }

    setupEventListeners() {
      window.addEventListener('wheel', this.handleScroll.bind(this), { passive: false });
      window.addEventListener('resize', this.handleResize.bind(this));
      window.addEventListener('keydown', this.handleKeyDown.bind(this));
      
      // Для мобильных устройств
      document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
      document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
      
      // Пересчет позиций при изменении DOM
      const observer = new MutationObserver(this.calculateSectionPositions.bind(this));
      observer.observe(document.body, { childList: true, subtree: true });
    }

    handleScroll(e) {
      if (this.isAnimating) return;
      e.preventDefault();
      
      const direction = e.deltaY > 0 ? 1 : -1;
      this.scrollToDirection(direction);
    }

    scrollToDirection(direction) {
      if (this.isFirstScroll) {
        this.isFirstScroll = false;
        return;
      }
      
      const nextPosition = this.findNextPosition(direction);
      this.animateScrollTo(nextPosition);
    }

    findNextPosition(direction) {
      if (this.sectionPositions.length === 0) {
        return this.currentPosition + (direction * window.innerHeight);
      }
      
      // Находим ближайшую секцию в направлении скролла
      let targetIndex = 0;
      let minDiff = Infinity;
      
      for (let i = 0; i < this.sectionPositions.length; i++) {
        const sectionPos = this.sectionPositions[i];
        const diff = sectionPos - Math.abs(this.currentPosition);
        
        if (direction > 0 && diff > 0 && diff < minDiff) {
          minDiff = diff;
          targetIndex = i;
        } else if (direction < 0 && diff < 0 && Math.abs(diff) < minDiff) {
          minDiff = Math.abs(diff);
          targetIndex = i;
        }
      }
      
      // Если не нашли подходящую секцию, скроллим на 90% экрана
      if (minDiff === Infinity) {
        return this.currentPosition + (direction * window.innerHeight * 0.9);
      }
      
      return -this.sectionPositions[targetIndex];
    }

    animateScrollTo(targetPx) {
      if (this.isAnimating) return;
      
      this.isAnimating = true;
      this.scrollBody.style.transform = `translate3d(0, ${targetPx}px, 0)`;
      this.currentPosition = targetPx;
      
      setTimeout(() => {
        this.isAnimating = false;
      }, this.animationDuration);
    }

    // Мобильные обработчики
    handleTouchStart(e) {
      this.touchStartY = e.touches[0].clientY;
    }

    handleTouchMove(e) {
      if (this.isAnimating) return;
      e.preventDefault();
      
      const touchY = e.touches[0].clientY;
      const direction = touchY < this.touchStartY ? 1 : -1;
      this.scrollToDirection(direction);
    }

    // Обработчик клавиатуры
    handleKeyDown(e) {
      if (this.isAnimating) return;
      
      if ([32, 33, 34, 35, 36, 38, 40].includes(e.keyCode)) {
        e.preventDefault();
      }
      
      if (e.keyCode === 40 || e.keyCode === 34) { // Стрелка вниз или Page Down
        this.scrollToDirection(1);
      } else if (e.keyCode === 38 || e.keyCode === 33) { // Стрелка вверх или Page Up
        this.scrollToDirection(-1);
      } else if (e.keyCode === 36) { // Home
        this.animateScrollTo(0);
      } else if (e.keyCode === 35) { // End
        if (this.sectionPositions.length > 0) {
          this.animateScrollTo(-this.sectionPositions[this.sectionPositions.length - 1]);
        }
      }
    }

    // Обработчик ресайза
    handleResize() {
      this.calculateEmToPx();
      this.calculateSectionPositions();
      
      // Корректируем текущую позицию после ресайза
      this.scrollBody.style.transition = 'none';
      this.scrollBody.style.transform = `translate3d(0, ${this.currentPosition}px, 0)`;
      
      // Возвращаем анимацию после рефлоу
      setTimeout(() => {
        this.scrollBody.classList.add('scroll-transition');
      }, 50);
    }
  }

  // Инициализация скролла
  new CustomScroll();
});