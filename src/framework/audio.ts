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

export function playSuccess() {
  if (muted) return;
  const audio = getAudioContext();
  if (audio.state === "suspended") {
    void audio.resume();
  }
  const now = audio.currentTime;
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const start = now + i * 0.06;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.08, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(start);
    osc.stop(start + 0.22);
  });
}

export function playSundayFanfare() {
  if (muted) return;
  const audio = getAudioContext();
  if (audio.state === "suspended") {
    void audio.resume();
  }
  const now = audio.currentTime;
  const notes: Array<{ freq: number; start: number; dur: number; type: OscillatorType; gain: number }> = [
    { freq: 523.25, start: 0.00, dur: 0.18, type: "triangle", gain: 0.16 },
    { freq: 659.25, start: 0.09, dur: 0.18, type: "triangle", gain: 0.16 },
    { freq: 783.99, start: 0.18, dur: 0.20, type: "triangle", gain: 0.16 },
    { freq: 1046.50, start: 0.27, dur: 0.42, type: "triangle", gain: 0.18 },
  ];
  for (const n of notes) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = n.type;
    osc.frequency.value = n.freq;
    gain.gain.setValueAtTime(0, now + n.start);
    gain.gain.linearRampToValueAtTime(n.gain, now + n.start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.dur);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now + n.start);
    osc.stop(now + n.start + n.dur + 0.03);
  }
  const shimmer = audio.createOscillator();
  const shimmerGain = audio.createGain();
  shimmer.type = "sine";
  shimmer.frequency.setValueAtTime(2093.0, now + 0.27);
  shimmer.frequency.exponentialRampToValueAtTime(2637.0, now + 0.65);
  shimmerGain.gain.setValueAtTime(0, now + 0.27);
  shimmerGain.gain.linearRampToValueAtTime(0.05, now + 0.30);
  shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
  shimmer.connect(shimmerGain);
  shimmerGain.connect(audio.destination);
  shimmer.start(now + 0.27);
  shimmer.stop(now + 0.70);
}

export function playWoodKnock() {
  if (muted) return;
  const audio = getAudioContext();
  if (audio.state === "suspended") {
    void audio.resume();
  }
  const now = audio.currentTime;
  const dur = 0.14;
  // Two stacked sine bursts emulate the resonant body of wood being tapped.
  const partials = [
    { freq: 185, gain: 0.16, decay: dur },
    { freq: 92, gain: 0.13, decay: dur * 1.6 },
    { freq: 370, gain: 0.05, decay: dur * 0.5 },
  ];
  for (const p of partials) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = p.freq;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(p.gain, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + p.decay);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + p.decay + 0.02);
  }
}

export function playFailure() {
  if (muted) return;
  const audio = getAudioContext();
  if (audio.state === "suspended") {
    void audio.resume();
  }
  const now = audio.currentTime;
  const notes = [392.0, 329.63, 261.63];
  notes.forEach((freq, i) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    const start = now + i * 0.12;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.06, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(start);
    osc.stop(start + 0.35);
  });
}
