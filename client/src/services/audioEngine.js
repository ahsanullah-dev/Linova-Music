/**
 * Studio Audio Engine
 * Automatically applies studio broadcast gain & acoustic equalization
 * for loud, punchy sound output across all headphones and laptop speakers.
 */

class AudioEngine {
  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.crossOrigin = 'anonymous';

    this.audioCtx = null;
    this.sourceNode = null;
    this.gainNode = null;
    this.limiter = null;
    this.bassFilter = null;
    this.vocalFilter = null;
    this.airFilter = null;
    this.isInitialized = false;

    this.baseLoudnessMultiplier = 1.4; // 140% clean broadcast studio loudness
  }

  initWebAudio() {
    if (this.isInitialized) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      this.audioCtx = new AudioContextClass();

      // Create DSP nodes
      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
      this.gainNode = this.audioCtx.createGain();
      this.limiter = this.audioCtx.createDynamicsCompressor();

      // Transparent broadcast limiter: prevents clipping at high volume while preserving dynamics
      this.limiter.threshold.setValueAtTime(-2, this.audioCtx.currentTime);
      this.limiter.knee.setValueAtTime(6, this.audioCtx.currentTime);
      this.limiter.ratio.setValueAtTime(3.0, this.audioCtx.currentTime);
      this.limiter.attack.setValueAtTime(0.003, this.audioCtx.currentTime);
      this.limiter.release.setValueAtTime(0.08, this.audioCtx.currentTime);

      // Acoustic EQ: Warm tight bass punch
      this.bassFilter = this.audioCtx.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.setValueAtTime(100, this.audioCtx.currentTime);
      this.bassFilter.gain.setValueAtTime(2.5, this.audioCtx.currentTime); // +2.5dB clean punch

      // Vocal presence & clarity filter
      this.vocalFilter = this.audioCtx.createBiquadFilter();
      this.vocalFilter.type = 'peaking';
      this.vocalFilter.frequency.setValueAtTime(3000, this.audioCtx.currentTime);
      this.vocalFilter.Q.setValueAtTime(1.0, this.audioCtx.currentTime);
      this.vocalFilter.gain.setValueAtTime(1.8, this.audioCtx.currentTime); // +1.8dB vocal clarity

      // High-frequency air & sparkle
      this.airFilter = this.audioCtx.createBiquadFilter();
      this.airFilter.type = 'highshelf';
      this.airFilter.frequency.setValueAtTime(9000, this.audioCtx.currentTime);
      this.airFilter.gain.setValueAtTime(2.0, this.audioCtx.currentTime); // +2dB air

      // Signal Flow: Source -> Bass -> Vocal -> Air -> Gain -> Limiter -> Destination
      this.sourceNode.connect(this.bassFilter);
      this.bassFilter.connect(this.vocalFilter);
      this.vocalFilter.connect(this.airFilter);
      this.airFilter.connect(this.gainNode);
      this.gainNode.connect(this.limiter);
      this.limiter.connect(this.audioCtx.destination);

      this.setVolume(1.0);
      this.isInitialized = true;
    } catch (e) {
      console.warn('[Audio Engine] Web Audio API init fallback:', e.message);
    }
  }

  resumeContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  setVolume(vol = 1.0) {
    const clamped = Math.max(0, Math.min(1.0, vol));
    const targetGain = clamped * this.baseLoudnessMultiplier;

    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(targetGain, this.audioCtx.currentTime);
    }
    // Always keep native element volume in sync as backup
    this.audio.volume = clamped;
  }
}

export const audioEngine = new AudioEngine();
