/**
 * Web Audio API Crystalline Sound Synthesizer
 * Subtle tactile feedback for interactive glassmorphism UI
 */

class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initAudioContext();
  }

  initAudioContext() {
    // Lazy initialize on first user gesture
    const init = () => {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      window.removeEventListener('click', init);
      window.removeEventListener('keydown', init);
    };

    window.addEventListener('click', init, { once: false });
    window.addEventListener('keydown', init, { once: false });
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playGlassChime(frequency = 880, type = 'sine') {
    if (!this.enabled || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + 0.15);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      // Audio context might be restricted
    }
  }

  playClick() {
    this.playGlassChime(1046.5, 'triangle'); // C6 note
  }

  playHover() {
    this.playGlassChime(523.25, 'sine'); // C5 note soft
  }

  playSuccess() {
    if (!this.enabled || !this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playGlassChime(freq, 'sine');
        }, idx * 70);
      });
    } catch (e) {}
  }
}

window.soundSynth = new AudioSynthesizer();
