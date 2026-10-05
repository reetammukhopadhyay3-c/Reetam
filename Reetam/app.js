/**
 * Application Core Controller & GSAP Orchestrator
 * Portfolio of Reetam Mukhopadhyay | Creative Polymath
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 2. Initialize GSAP ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    initGSAPAnimations();
  }

  // 3. Initialize Interactive Components
  initCraftTabs();
  initCircuitWaveVisualizer();
  initVideoTimelineSimulator();
  initContactForm();
  initEmailCopy();
  initModal();
  initScenePresetsControl();
  initSoundToggle();
  initCardTiltEffects();
  initNavActiveTracking();
});

/* --------------------------------------------------------------------------
   GSAP & ScrollTrigger Entrance Animations
   -------------------------------------------------------------------------- */
function initGSAPAnimations() {
  // Hero Entrance Sequence
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  heroTl.from('.glass-nav-header', {
    y: -50,
    opacity: 0,
    duration: 1,
    delay: 0.2
  })
  .from('.gsap-hero-item', {
    y: 35,
    opacity: 0,
    duration: 0.9,
    stagger: 0.15
  }, '-=0.6');

  // ScrollTrigger for Section Reveals
  const revealElements = document.querySelectorAll('.gsap-reveal');
  revealElements.forEach((el) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 40,
      opacity: 0,
      duration: 0.85,
      ease: 'power2.out'
    });
  });
}

/* --------------------------------------------------------------------------
   Navigation Active Link Tracking
   -------------------------------------------------------------------------- */
function initNavActiveTracking() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('data-target') === current) {
        link.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Crafts & Disciplines Tabs
   -------------------------------------------------------------------------- */
function initCraftTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const panels = {
    ee: document.getElementById('craft-panel-ee'),
    video: document.getElementById('craft-panel-video'),
    science: document.getElementById('craft-panel-science'),
    software: document.getElementById('craft-panel-software')
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const craft = btn.getAttribute('data-craft');
      if (!panels[craft]) return;

      if (window.soundSynth) window.soundSynth.playClick();

      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      Object.values(panels).forEach(panel => {
        if (panel) panel.classList.remove('active');
      });

      panels[craft].classList.add('active');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  });
}

/* --------------------------------------------------------------------------
   Live Circuit Waveform Simulator (EE Focus)
   -------------------------------------------------------------------------- */
function initCircuitWaveVisualizer() {
  const canvas = document.getElementById('circuit-wave-canvas');
  const slider = document.getElementById('freq-slider');
  const freqDisplay = document.getElementById('freq-display');

  if (!canvas || !slider) return;

  const ctx = canvas.getContext('2d');
  let animationId;
  let phase = 0;
  let frequency = parseFloat(slider.value);

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth - 48;
    canvas.height = 140;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  slider.addEventListener('input', (e) => {
    frequency = parseFloat(e.target.value);
    if (freqDisplay) freqDisplay.textContent = `Freq: ${frequency} Hz`;
    if (window.soundSynth) window.soundSynth.playHover();
  });

  function drawWave() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const midY = h / 2;

    // Draw Subtle Grid
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
    ctx.lineWidth = 1;

    // Center line
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();

    // Waveform 1 (Primary Sine Signal - Cobalt Blue)
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0047ab';

    for (let x = 0; x < w; x++) {
      const rad = (x / w) * (frequency * 0.1) * Math.PI * 2 + phase;
      const y = midY + Math.sin(rad) * 45;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Waveform 2 (Secondary Harmonic - Bright Red)
    ctx.beginPath();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#ef233c';

    for (let x = 0; x < w; x++) {
      const rad = (x / w) * (frequency * 0.2) * Math.PI * 2 - phase * 1.5;
      const y = midY + Math.sin(rad) * 22;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    phase += 0.04;
    animationId = requestAnimationFrame(drawWave);
  }

  drawWave();
}

/* --------------------------------------------------------------------------
   Video Timeline Simulator (Video Editing Focus)
   -------------------------------------------------------------------------- */
function initVideoTimelineSimulator() {
  const scrubBtn = document.getElementById('timeline-scrub-btn');
  const timecodeVal = document.getElementById('timecode-val');
  const icon = document.getElementById('timeline-play-icon');

  if (!scrubBtn || !timecodeVal) return;

  let isPlaying = false;
  let frame = 18;
  let second = 22;
  let minute = 4;
  let interval = null;

  scrubBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;

    if (window.soundSynth) window.soundSynth.playClick();

    if (isPlaying) {
      scrubBtn.querySelector('span').textContent = 'Pause Simulation';
      if (icon) icon.setAttribute('data-lucide', 'pause');
      interval = setInterval(() => {
        frame++;
        if (frame >= 60) {
          frame = 0;
          second++;
          if (second >= 60) {
            second = 0;
            minute++;
          }
        }
        const fStr = frame.toString().padStart(2, '0');
        const sStr = second.toString().padStart(2, '0');
        const mStr = minute.toString().padStart(2, '0');
        timecodeVal.textContent = `00:${mStr}:${sStr}:${fStr}`;
      }, 1000 / 60);
    } else {
      scrubBtn.querySelector('span').textContent = 'Simulate Edit Scrub';
      if (icon) icon.setAttribute('data-lucide', 'play');
      clearInterval(interval);
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  });
}

/* --------------------------------------------------------------------------
   Contact Form Handler & Confetti Celebration
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const toast = document.getElementById('contact-toast');
  const submitBtn = document.getElementById('submit-contact-btn');

  if (!form || !toast) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('sender-name').value.trim();
    const email = document.getElementById('sender-email').value.trim();
    const msg = document.getElementById('sender-msg').value.trim();

    if (!name || !email || !msg) {
      alert('Please fill in all required fields!');
      return;
    }

    // Success Sound & Confetti
    if (window.soundSynth) window.soundSynth.playSuccess();

    if (typeof confetti !== 'undefined') {
      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.7 },
        colors: ['#0047ab', '#ef233c', '#0a1931', '#3b82f6', '#ffffff']
      });
    }

    // Show Toast
    toast.style.display = 'flex';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    // Reset Form
    form.reset();

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }, 4000);
  });
}

/* --------------------------------------------------------------------------
   Copy Email to Clipboard
   -------------------------------------------------------------------------- */
function initEmailCopy() {
  const copyBtn = document.getElementById('copy-email-btn');
  const emailText = document.getElementById('email-text');
  const copyIcon = document.getElementById('copy-icon');

  if (!copyBtn || !emailText) return;

  copyBtn.addEventListener('click', () => {
    const textToCopy = emailText.textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
      if (window.soundSynth) window.soundSynth.playSuccess();
      
      const origLabel = copyBtn.querySelector('.channel-label').textContent;
      copyBtn.querySelector('.channel-label').textContent = 'Copied to Clipboard! ✨';
      if (copyIcon) copyIcon.setAttribute('data-lucide', 'check');
      if (typeof lucide !== 'undefined') lucide.createIcons();

      setTimeout(() => {
        copyBtn.querySelector('.channel-label').textContent = origLabel;
        if (copyIcon) copyIcon.setAttribute('data-lucide', 'copy');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }, 2500);
    });
  });
}

/* --------------------------------------------------------------------------
   Modal: India Watch Inspector
   -------------------------------------------------------------------------- */
function initModal() {
  const trigger = document.getElementById('preview-modal-trigger');
  const modal = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modal) return;

  if (trigger) {
    trigger.addEventListener('click', () => {
      modal.style.display = 'flex';
      if (window.soundSynth) window.soundSynth.playClick();
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      if (window.soundSynth) window.soundSynth.playClick();
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}

/* --------------------------------------------------------------------------
   3D Scene Presets Control
   -------------------------------------------------------------------------- */
function initScenePresetsControl() {
  const btn = document.getElementById('scene-preset-btn');
  const heroBtn = document.getElementById('hero-3d-interact-btn');

  if (btn) {
    btn.addEventListener('click', () => {
      if (window.soundSynth) window.soundSynth.playClick();
      if (window.portfolio3D) {
        const nextName = window.portfolio3D.cyclePreset();
        const tooltip = btn.querySelector('.btn-tooltip');
        if (tooltip) tooltip.textContent = `3D: ${nextName}`;
      }
    });
  }

  if (heroBtn) {
    heroBtn.addEventListener('click', () => {
      if (window.soundSynth) window.soundSynth.playClick();
      if (window.portfolio3D) {
        window.portfolio3D.cyclePreset();
      }
    });
  }
}

/* --------------------------------------------------------------------------
   Sound Toggle
   -------------------------------------------------------------------------- */
function initSoundToggle() {
  const toggleBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    if (!window.soundSynth) return;
    const isEnabled = window.soundSynth.toggle();
    const tooltip = toggleBtn.querySelector('.btn-tooltip');

    if (isEnabled) {
      if (soundIcon) soundIcon.setAttribute('data-lucide', 'volume-2');
      if (tooltip) tooltip.textContent = 'Sound FX: ON';
      window.soundSynth.playClick();
    } else {
      if (soundIcon) soundIcon.setAttribute('data-lucide', 'volume-x');
      if (tooltip) tooltip.textContent = 'Sound FX: OFF';
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  });
}

/* --------------------------------------------------------------------------
   3D Perspective Tilt on Glass Cards
   -------------------------------------------------------------------------- */
function initCardTiltEffects() {
  const cards = document.querySelectorAll('.magnetic-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}
