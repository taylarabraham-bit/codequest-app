import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { DESKTOP } from '../edition';

export type Cue = 'tap' | 'correct' | 'wrong' | 'complete';

let ctx: AudioContext | null = null;

function tone(freqs: number[], step = 0.09, type: OscillatorType = 'sine') {
  try {
    ctx ??= new AudioContext();
    const t0 = ctx.currentTime;
    freqs.forEach((f, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = type;
      osc.frequency.value = f;
      const start = t0 + i * step;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + step * 1.6);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(start);
      osc.stop(start + step * 1.8);
    });
  } catch {
    // No audio available.
  }
}

const SOUNDS: Record<Cue, () => void> = {
  tap: () => tone([660], 0.04, 'triangle'),
  correct: () => tone([660, 880], 0.08, 'triangle'),
  wrong: () => tone([220, 180], 0.11, 'sawtooth'),
  complete: () => tone([523, 659, 784, 1047], 0.1, 'triangle'),
};

async function buzz(cue: Cue) {
  try {
    if (Capacitor.isNativePlatform()) {
      if (cue === 'tap') await Haptics.impact({ style: ImpactStyle.Light });
      else if (cue === 'correct') await Haptics.notification({ type: NotificationType.Success });
      else if (cue === 'wrong') await Haptics.notification({ type: NotificationType.Error });
      else await Haptics.impact({ style: ImpactStyle.Heavy });
    } else if ('vibrate' in navigator) {
      navigator.vibrate(cue === 'wrong' ? [40, 40, 40] : cue === 'tap' ? 8 : 25);
    }
  } catch {
    // Haptics unavailable.
  }
}

export function feedback(cue: Cue, settings: { sound: boolean; haptics: boolean }): void {
  if (settings.sound) SOUNDS[cue]();
  if (settings.haptics && !DESKTOP) void buzz(cue);
}
