class SimpleSlider {
  constructor(container, options = {}) {
    this.container = container;
    this.wrapper = container.querySelector('.slider-wrapper');
    this.slides = Array.from(this.wrapper.children);
    this.currentIndex = 0;

    // Configuration options
    this.slidesPerView = options.slidesPerView || 1;
    this.autoplay = options.autoplay || false;
    this.autoplayInterval = options.autoplayInterval || 3000;
    this.loop = options.loop || false;
    this.gap = options.gap || '0px';
    this.totalSlides = options.totalSlides || this.slides.length;
    this.breakpoints = options.breakpoints || {}; // Breakpoints configuration

    this.prevButton = container.querySelector('.prev');
    this.nextButton = container.querySelector('.next');
    this.dotsContainer = container.querySelector('.dots');
    this.dots = [];
    this.autoplayTimer = null;

    this.init();
    this.handleResize(); // Handle breakpoints on initialization
    window.addEventListener('resize', () => this.handleResize()); // Handle resizing
  }

  init() {
    this.createDots();
    this.updateSlider();
    this.attachEventListeners();

    if (this.autoplay) {
      this.startAutoplay();
    }

    document.documentElement.style.setProperty(
      '--slides-per-view',
      this.slidesPerView
    );
    document.documentElement.style.setProperty('--gap', this.gap);
  }

  createDots() {
    this.dotsContainer.innerHTML = ''; // Clear existing dots
    this.dots = []; // Reset dots array

    const dotCount = this.totalSlides - this.slidesPerView + 1;
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (i === this.currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => this.goToSlide(i));
      this.dotsContainer.appendChild(dot);
      this.dots.push(dot);
    }
  }

  attachEventListeners() {
    this.prevButton.addEventListener('click', () => this.prevSlide());
    this.nextButton.addEventListener('click', () => this.nextSlide());
  }

  prevSlide() {
    if (this.currentIndex === 0) {
      if (this.loop) {
        this.currentIndex = this.totalSlides - this.slidesPerView;
      } else {
        return;
      }
    } else {
      this.currentIndex--;
    }
    this.updateSlider();
  }

  nextSlide() {
    if (this.currentIndex >= this.totalSlides - this.slidesPerView) {
      if (this.loop) {
        this.currentIndex = 0;
      } else {
        return;
      }
    } else {
      this.currentIndex++;
    }
    this.updateSlider();
  }

  goToSlide(index) {
    this.currentIndex = index;
    this.updateSlider();
  }

  updateSlider() {
    const slideWidth =
      (this.container.offsetWidth -
        parseInt(this.gap.substring(0, this.gap.indexOf('px') + 1)) *
          (this.slidesPerView - 1)) /
      this.slidesPerView;

    const offset =
      -(this.currentIndex * slideWidth) -
      parseInt(this.gap.substring(0, this.gap.indexOf('px') + 1)) *
        this.currentIndex;

    this.wrapper.style.transform = `translateX(${offset}px)`;

    this.dots.forEach((dot) => dot.classList.remove('active'));
    if (this.dots[this.currentIndex]) {
      this.dots[this.currentIndex].classList.add('active');
    }
  }

  startAutoplay() {
    if (this.autoplay) {
      this.autoplayTimer = setInterval(
        () => this.nextSlide(),
        this.autoplayInterval
      );
    }
  }

  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
    }
  }

  // Method to refresh the slider when passed a new slidesPerView value
  refresh(newSlidesPerView) {
    this.slidesPerView = newSlidesPerView; // Update the number of slides per view
    document.documentElement.style.setProperty(
      '--slides-per-view',
      this.slidesPerView
    );

    this.createDots(); // Recreate the dots as per the new slidesPerView
    this.updateSlider(); // Recalculate the slider's layout

    if (this.autoplay) {
      this.stopAutoplay();
      this.startAutoplay(); // Restart autoplay if it's enabled
    }
  }

  // Method to handle breakpoints
  handleResize() {
    const windowWidth = window.innerWidth;
    let matchedSlidesPerView = this.slidesPerView; // Default value

    // Check for the appropriate breakpoint based on window width
    for (const breakpoint in this.breakpoints) {
      if (windowWidth >= breakpoint) {
        matchedSlidesPerView = this.breakpoints[breakpoint];
      }
    }

    // Update slidesPerView if the matched value is different
    if (matchedSlidesPerView !== this.slidesPerView) {
      this.refresh(matchedSlidesPerView);
    }
  }
}
