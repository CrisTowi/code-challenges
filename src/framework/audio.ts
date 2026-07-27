let ctx: AudioContext | null = null;
let muted = false;

export function getAudioContext(): AudioContext {
  if (typeof window === "undefined") {
    throw new Error("AudioContext is only available in the browser");
  }
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
  }
  return ctx;
}

export async function ensureAudioRunning() {
  const audio = getAudioContext();
  if (audio.state === "suspended") {
    await audio.resume();
  }
}

export function setMuted(value: boolean) {
  muted = value;
}

export function isMuted() {
  return muted;
}

export function playTone(freq: number, durationMs = 220) {
  if (muted) return;
  const audio = getAudioContext();
  if (audio.state === "suspended") {
    void audio.resume();
  }
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "square";
  osc.frequency.value = freq;
  const now = audio.currentTime;
  const dur = durationMs / 1000;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}

export function valueToFrequency(value: number, min: number, max: number): number {
  const range = Math.max(1, max - min);
  const t = (value - min) / range;
  const minFreq = 220;
  const maxFreq = 880;
  return minFreq + t * (maxFreq - minFreq);
}

export function playNoteForValue(value: number, min: number, max: number) {
  playTone(valueToFrequency(value, min, max));
}
