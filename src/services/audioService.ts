/**
 * High-fidelity Audio Synthesizer for PS5-inspired UI/UX.
 * Generates organic UI ticks, focus swooshes, confirm chimes, launch boots,
 * and an authentic calming harmonic ambient soundscape using Web Audio API.
 */

class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isAmbientPlaying: boolean = false;
  private ambientGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isAmbientPlaying) {
      this.stopAmbient();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public isAmbientEnabled(): boolean {
    return this.isAmbientPlaying;
  }

  /**
   * PS5 Carousel Navigation Tick:
   * Quick, delicate sine-pulse with high-pass filtered decay.
   */
  public playNavTick() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch {
      // Audio playback fails gracefully if context not resumed
    }
  }

  /**
   * Category Bumper Shift (L1 / R1):
   * Fluid dual-pitch swoosh.
   */
  public playBumper() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(320, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.08);

      osc2.frequency.setValueAtTime(160, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.095);
      osc2.stop(ctx.currentTime + 0.095);
    } catch {}
  }

  /**
   * Confirmation / Select Chime:
   * Two crisp resonant bell tones reminiscent of PlayStation confirm button.
   */
  public playSelect() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const freqs = [587.33, 880.0]; // D5, A5
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.035);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.035 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.035);
        osc.stop(ctx.currentTime + idx * 0.035 + 0.2);
      });
    } catch {}
  }

  /**
   * Cancel / Back Sound (Circle / ESC)
   */
  public playBack() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {}
  }

  /**
   * Game Launch Fanfare / Emulator Boot Chord:
   * PS5-style ascending multi-oscillator chord with lush reverb simulation.
   */
  public playLaunch() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const chord = [220.0, 329.63, 440.0, 554.37, 659.25]; // A major 9th
      chord.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f * 0.8, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(f, ctx.currentTime + 0.2);

        const startTime = ctx.currentTime + i * 0.04;
        gain.gain.setValueAtTime(0.09, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.25);
      });
    } catch {}
  }

  /**
   * Ambient PlayStation Home Screen Music (harmonic atmospheric pad)
   */
  public toggleAmbient() {
    if (this.isAmbientPlaying) {
      this.stopAmbient();
    } else {
      this.startAmbient();
    }
    return this.isAmbientPlaying;
  }

  public startAmbient() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      this.stopAmbient();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 1.5);
      masterGain.connect(ctx.destination);
      this.ambientGain = masterGain;

      // Filter for warm, deep PS5 atmospheric wash
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.connect(masterGain);

      // 3 detuned subtle sine/triangle chords (D major triad with slow beating)
      const baseFreqs = [146.83, 220.0, 293.66, 369.99]; // D3, A3, D4, F#4
      this.ambientOscillators = [];

      baseFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq + (Math.random() * 1.5 - 0.75), ctx.currentTime);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.25, ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start();
        this.ambientOscillators.push(osc);
      });

      this.isAmbientPlaying = true;
    } catch {
      this.isAmbientPlaying = false;
    }
  }

  public stopAmbient() {
    try {
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
      }
      setTimeout(() => {
        this.ambientOscillators.forEach(osc => {
          try { osc.stop(); osc.disconnect(); } catch {}
        });
        this.ambientOscillators = [];
        this.ambientGain = null;
      }, 700);
      this.isAmbientPlaying = false;
    } catch {}
  }
}

export const audioService = new AudioService();
