import { useState, useEffect } from 'react';

// Persian digits conversion helper
export const toPersianDigits = (num: number | string): string => {
  if (num === undefined || num === null) return '';
  const str = String(num);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/\d/g, (digit) => persianDigits[parseInt(digit, 10)]);
};

export const formatTimePersian = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
  const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;
  return `${toPersianDigits(formattedMins)}:${toPersianDigits(formattedSecs)}`;
};

// Convert numbers 1-100 to standard spoken Persian words
export const numberToPersianWords = (num: number): string => {
  if (num === 0) return 'صفر';
  if (num === 1) return 'یک';

  const ones: Record<number, string> = {
    1: 'یک',
    2: 'دو',
    3: 'سه',
    4: 'چهار',
    5: 'پنج',
    6: 'شش',
    7: 'هفت',
    8: 'هشت',
    9: 'نه',
    10: 'ده',
  };
  if (ones[num]) return ones[num];

  const teens: Record<number, string> = {
    11: 'یازده',
    12: 'دوازده',
    13: 'سیزده',
    14: 'چهارده',
    15: 'پانزده',
    16: 'شانزده',
    17: 'هفده',
    18: 'هجده',
    19: 'نوزده',
  };
  if (teens[num]) return teens[num];

  const tens: Record<number, string> = {
    20: 'بیست',
    30: 'سی',
    40: 'چهل',
    50: 'پنجاه',
    60: 'شصت',
    70: 'هفتاد',
    80: 'هشتاد',
    90: 'نود',
    100: 'صد',
  };
  if (tens[num]) return tens[num];

  if (num > 20 && num < 100) {
    const t = Math.floor(num / 10) * 10;
    const o = num % 10;
    return `${tens[t]} و ${ones[o]}`;
  }

  return String(num);
};

// Traditional Iranian Multiplication Rhythmic Phrasing
// Examples:
// 1 x 1 => "یکی یکی، یکی"
// 2 x 2 => "دو دوتا، چهارتا"
// 2 x 3 => "دو سه تا، شش تا"
// 3 x 3 => "سه سه تا، نه تا"
// 4 x 5 => "چهار پنج تا، بیست تا"
// 7 x 8 => "هفت هشت تا، پنجاه و شش تا"
// 9 x 9 => "نه نه تا، هشتاد و یک تا"
export const getTraditionalPersianMultiplicationPhrase = (f1: number, f2: number): string => {
  const result = f1 * f2;

  const f1Word = f1 === 1 ? 'یکی' : numberToPersianWords(f1);
  
  let f2Word = '';
  if (f2 === 1) {
    f2Word = 'یکی';
  } else if (f2 === 2) {
    f2Word = 'دوتا';
  } else if (f2 === 4) {
    f2Word = 'چهارتا';
  } else {
    f2Word = `${numberToPersianWords(f2)} تا`;
  }

  let resWord = '';
  if (result === 1) {
    resWord = 'یکی';
  } else if (result === 2) {
    resWord = 'دوتا';
  } else if (result === 4) {
    resWord = 'چهارتا';
  } else {
    resWord = `${numberToPersianWords(result)} تا`;
  }

  if (f1 === 1 && f2 === 1) {
    return 'یکی یکی، یکی';
  }

  return `${f1Word} ${f2Word}، ${resWord}`;
};

// Web Audio API & Cross-Platform Sound & Speech Engine (Zero Latency, Offline Ready)
class SoundEffects {
  private audioCtx: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentPlayingId: string | null = null;
  private listeners: Set<() => void> = new Set();
  private isUnlocked: boolean = false;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  private voiceVolume: number = 1.0;
  private sfxVolume: number = 1.0;
  private soundEnabled: boolean = true;

  constructor() {
    this.setupUnlockListeners();
  }

  public setSettings(soundEnabled: boolean, voiceVolume: number = 1.0, sfxVolume: number = 1.0) {
    this.soundEnabled = soundEnabled;
    this.voiceVolume = Math.max(0, Math.min(1, voiceVolume));
    this.sfxVolume = Math.max(0, Math.min(1, sfxVolume));
  }

  private setupUnlockListeners() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this.unlockAudioContext();
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);
    window.addEventListener('keydown', unlock);
  }

  public unlockAudioContext() {
    if (this.isUnlocked) return;
    try {
      const ctx = this.getContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      this.isUnlocked = true;
    } catch {
      // Ignore
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getCurrentlyPlayingId(): string | null {
    return this.currentPlayingId;
  }

  public isPlaying(id?: string): boolean {
    if (!id) return this.currentPlayingId !== null;
    return this.currentPlayingId === id;
  }

  public stopSpeech() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudio = null;
    }

    this.currentPlayingId = null;
    this.notify();
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  // Preload helper (only for core multiplication tables if desired)
  public preloadKeyAudio() {
    // Web Audio SFX are instant and require zero network preloading!
  }

  // Helper to play an MP3 path cleanly with ID and volume controls (used for learning tables)
  private playMp3File(mp3Path: string, id: string, volume: number = 1.0, onEndedCallback?: () => void): void {
    if (!this.soundEnabled) return;
    this.unlockAudioContext();

    // Stop current playing audio
    this.stopSpeech();

    this.currentPlayingId = id;
    this.notify();

    try {
      let audio = this.audioCache.get(mp3Path);
      if (!audio) {
        audio = new Audio(mp3Path);
        this.audioCache.set(mp3Path, audio);
      } else {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {
          // ignore
        }
      }

      audio.volume = Math.max(0, Math.min(1, volume));
      this.currentAudio = audio;

      audio.onended = () => {
        if (this.currentPlayingId === id) {
          this.currentPlayingId = null;
          this.currentAudio = null;
          this.notify();
        }
        if (onEndedCallback) onEndedCallback();
      };

      audio.onerror = (e) => {
        const err = audio?.error;
        console.warn(`[Zarbyar Audio] اطلاعات فایل صوتی: ${mp3Path}`, err?.message);
        if (this.currentPlayingId === id) {
          this.currentPlayingId = null;
          this.currentAudio = null;
          this.notify();
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (this.currentPlayingId === id) {
            this.currentPlayingId = null;
            this.currentAudio = null;
            this.notify();
          }
        });
      }
    } catch {
      if (this.currentPlayingId === id) {
        this.currentPlayingId = null;
        this.currentAudio = null;
        this.notify();
      }
    }
  }

  // 1. ✨ Short Pleasant Ding / Success SFX (for selections, revealing answers, tapping 'بلدم')
  public playDing() {
    if (!this.soundEnabled || this.sfxVolume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Dual harmonic bell frequencies (C6 + E6)
      [1046.5, 1318.51].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const vol = 0.16 * this.sfxVolume;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
      });
    } catch {
      // Ignore
    }
  }

  // 2. ✨ Short, Clean Correct Answer Sound (Triad Arpeggio)
  public playCorrectSound() {
    if (!this.soundEnabled || this.sfxVolume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.045);

        const vol = 0.18 * this.sfxVolume;
        gain.gain.setValueAtTime(0, now + idx * 0.045);
        gain.gain.linearRampToValueAtTime(vol, now + idx * 0.045 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.045);
        osc.stop(now + idx * 0.045 + 0.25);
      });
    } catch {
      // Ignore
    }
  }

  // 3. 🕊️ Soft, Gentle, Neutral Wrong Answer Sound (non-punitive, gentle warm tap)
  public playWrongSound() {
    if (!this.soundEnabled || this.sfxVolume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Soft sine drop with low amplitude
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

      const vol = 0.12 * this.sfxVolume;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Ignore
    }
  }

  // 4. 🎉 Short & Joyful Level / Deck Complete Fanfare (0.35s)
  public playLevelComplete() {
    if (!this.soundEnabled || this.sfxVolume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6

      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.06);

        const vol = 0.2 * this.sfxVolume;
        gain.gain.setValueAtTime(0, now + i * 0.06);
        gain.gain.linearRampToValueAtTime(vol, now + i * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.35);
      });
    } catch {
      // Ignore
    }
  }

  // 5. 🏆 Grand 36-Cards & Major Achievement Celebration Chime (0.6s)
  public playCelebrationSound() {
    if (!this.soundEnabled || this.sfxVolume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const melody = [
        { f: 523.25, t: 0.0 },   // C5
        { f: 659.25, t: 0.08 },  // E5
        { f: 783.99, t: 0.16 },  // G5
        { f: 1046.5, t: 0.24 },  // C6
        { f: 1318.51, t: 0.32 }, // E6
        { f: 1567.98, t: 0.40 }, // G6
      ];

      melody.forEach(({ f, t }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + t);

        const vol = 0.22 * this.sfxVolume;
        gain.gain.setValueAtTime(0, now + t);
        gain.gain.linearRampToValueAtTime(vol, now + t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + t);
        osc.stop(now + t + 0.4);
      });
    } catch {
      // Ignore
    }
  }

  // 6. ⚡ Streak Fanfare
  public playStreakSound() {
    this.playLevelComplete();
  }

  public playGameStart() {
    this.playDing();
  }

  public playRewardStar() {
    this.playDing();
  }

  public playRewardBadge() {
    this.playLevelComplete();
  }

  // 🎓 Authentic Multiplication Table Narrator (strictly for educational tables in LearnView & ConceptView)
  public speakTraditionalMultiplication(f1: number, f2: number, id?: string): void {
    const audioId = id || `table-mult-${f1}-${f2}`;
    const mp3Path = `/audio/multiplication/${f1}-${f2}.mp3`;
    this.playMp3File(mp3Path, audioId, this.voiceVolume);
  }

  public speakPersian(text: string, id: string = 'global-speech'): void {
    // If not multiplication audio, stop or do soft ding
    this.playDing();
  }
}

export const sounds = new SoundEffects();

export function useAudioState() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = sounds.subscribe(() => {
      setTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  return {
    currentlyPlayingId: sounds.getCurrentlyPlayingId(),
    isPlaying: (id?: string) => sounds.isPlaying(id),
    stopSpeech: () => sounds.stopSpeech(),
    speakPersian: (text: string, id?: string) => sounds.speakPersian(text, id),
    speakTraditionalMultiplication: (f1: number, f2: number, id?: string) =>
      sounds.speakTraditionalMultiplication(f1, f2, id),
    playDing: () => sounds.playDing(),
    playCorrectSound: () => sounds.playCorrectSound(),
    playWrongSound: () => sounds.playWrongSound(),
    playGameStart: () => sounds.playGameStart(),
    playLevelComplete: () => sounds.playLevelComplete(),
    playCelebrationSound: () => sounds.playCelebrationSound(),
    playRewardStar: () => sounds.playRewardStar(),
    playRewardBadge: () => sounds.playRewardBadge(),
    preloadKeyAudio: () => sounds.preloadKeyAudio(),
  };
}

