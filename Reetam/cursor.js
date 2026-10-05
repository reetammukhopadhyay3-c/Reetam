/**
 * Custom Interactive Magnetic Cursor & Physics Follower
 * Portfolio of Reetam Mukhopadhyay
 */

class InteractiveCursor {
  constructor() {
    this.dot = document.getElementById('custom-cursor');
    this.follower = document.getElementById('custom-cursor-follower');

    if (!this.dot || !this.follower) return;

    // Positions
    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Lerp factor for smooth trailing
    this.ease = 0.15;
    this.isHovering = false;

    this.init();
  }

  init() {
    // Hide cursor on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      if (this.dot) this.dot.style.display = 'none';
      if (this.follower) this.follower.style.display = 'none';
      return;
    }

    // Track mouse
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      // Update center dot instantly
      this.dot.style.transform = `translate(${this.mouse.x}px, ${this.mouse.y}px)`;
    });

    // Magnetic hover effects
    this.attachMagneticListeners();

    // Start requestAnimationFrame loop for follower
    this.render();
  }

  attachMagneticListeners() {
    const interactives = document.querySelectorAll('a, button, .magnetic-item, .glass-card, input, textarea, select');

    interactives.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        this.follower.classList.add('cursor-hover');
        this.isHovering = true;
      });

      el.addEventListener('mouseleave', () => {
        this.follower.classList.remove('cursor-hover');
        this.isHovering = false;
        el.style.transform = '';
      });

      // Subtle magnetic pull for elements marked with .magnetic-item
      if (el.classList.contains('magnetic-item')) {
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          const deltaX = (e.clientX - centerX) * 0.25;
          const deltaY = (e.clientY - centerY) * 0.25;

          el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });
      }
    });
  }

  render() {
    // Interpolate follower towards mouse
    this.pos.x += (this.mouse.x - this.pos.x) * this.ease;
    this.pos.y += (this.mouse.y - this.pos.y) * this.ease;

    this.follower.style.transform = `translate(${this.pos.x}px, ${this.pos.y}px)`;

    requestAnimationFrame(this.render.bind(this));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.interactiveCursor = new InteractiveCursor();
});
