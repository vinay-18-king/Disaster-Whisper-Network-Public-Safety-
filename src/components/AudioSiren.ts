/**
 * Web Audio API synthesizer for Emergency Alert System (EAS) sirens
 * Generates warning tone (853 Hz + 960 Hz dual frequency) or emergency whoop
 */

class SirenSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  public playEmergencyBeep(durationMs = 800) {
    this.initContext();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + durationMs / 1000);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + durationMs / 1000);
  }

  public toggleSiren(onStateChange?: (active: boolean) => void) {
    this.initContext();
    if (!this.ctx) return;

    if (this.isPlaying) {
      this.stop();
      if (onStateChange) onStateChange(false);
      return;
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;
    const now = this.ctx.currentTime;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.1, now);
    this.gainNode.connect(this.ctx.destination);

    // Dual-tone EAS alert (853 Hz + 960 Hz)
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sine';
    this.osc1.frequency.setValueAtTime(853, now);

    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = 'sine';
    this.osc2.frequency.setValueAtTime(960, now);

    this.osc1.connect(this.gainNode);
    this.osc2.connect(this.gainNode);

    this.osc1.start(now);
    this.osc2.start(now);

    if (onStateChange) onStateChange(true);
  }

  public stop() {
    if (this.osc1) {
      try { this.osc1.stop(); this.osc1.disconnect(); } catch {}
      this.osc1 = null;
    }
    if (this.osc2) {
      try { this.osc2.stop(); this.osc2.disconnect(); } catch {}
      this.osc2 = null;
    }
    this.isPlaying = false;
  }
}

export const sirenSynth = new SirenSynthesizer();
