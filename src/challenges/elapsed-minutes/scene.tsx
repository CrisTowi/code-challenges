import { useEffect, useMemo, useState } from "react";
import type { Snapshot } from "@framework";
import { getAudioContext, isMuted, playTone } from "@framework/audio";
import { ElapsedMinutes, type ElapsedMinutesState } from "./algorithm";
import styles from "./scene.module.css";
import { ArcGauge, GemIcon, Hearts, HeroSprite, type HeroPose } from "./hud";

// ─── helpers (display only) ───────────────────────────────────────────────────

function parse(t: string): [number, number] {
  const [h, m] = t.split(":").map(Number);
  return [h, m];
}

function clockMinutes(t: string): number {
  const [h, m] = parse(t);
  return h * 60 + m;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Text of the formula the algorithm applies to one pair, mirroring its branches. */
function formulaFor(a: string, b: string): { text: string; note: string } {
  const [h1, m1] = parse(a);
  const [h2, m2] = parse(b);
  if (m2 >= m1) {
    return {
      text: `(${h2} − ${h1}) × 60 + (${m2} − ${m1})`,
      note: "minutes moved forward → plain difference",
    };
  }
  if (h1 !== h2) {
    return {
      text: `(60 − ${m1}) + ${m2} + (${h2} − ${h1 + 1}) × 60`,
      note: "minutes wrapped past :00 → carry into the next hour",
    };
  }
  return {
    text: `(60 − ${m1}) + ${m2}`,
    note: "same hour but earlier minutes → the clock fell back 1 h",
  };
}

// ─── audio ────────────────────────────────────────────────────────────────────

/** Original 5-note "rewind" melody on a soft, vibrato flute voice. */
const REWIND_MELODY = [587.33, 880, 783.99, 659.25, 587.33];

function playFluteNote(freq: number, start: number, dur: number) {
  const audio = getAudioContext();
  const osc = audio.createOscillator();
  const vib = audio.createOscillator();
  const vibGain = audio.createGain();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  vib.frequency.value = 5.5;
  vibGain.gain.value = freq * 0.012;
  vib.connect(vibGain);
  vibGain.connect(osc.frequency);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(0.12, start + 0.04);
  gain.gain.setValueAtTime(0.1, start + dur * 0.7);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(start);
  vib.start(start);
  osc.stop(start + dur + 0.05);
  vib.stop(start + dur + 0.05);
}

function playRewindMelody() {
  if (isMuted()) return;
  const audio = getAudioContext();
  if (audio.state === "suspended") void audio.resume();
  const now = audio.currentTime;
  REWIND_MELODY.forEach((f, i) => playFluteNote(f, now + i * 0.2, i === REWIND_MELODY.length - 1 ? 0.5 : 0.22));
}

function playRumble(intensity: number) {
  if (isMuted()) return;
  const audio = getAudioContext();
  if (audio.state === "suspended") void audio.resume();
  const now = audio.currentTime;
  const dur = 0.25 + intensity * 0.35;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(70 + intensity * 30, now);
  osc.frequency.exponentialRampToValueAtTime(38, now + dur);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.04 + intensity * 0.07, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + dur + 0.05);
}

function playImpact() {
  if (isMuted()) return;
  const audio = getAudioContext();
  if (audio.state === "suspended") void audio.resume();
  const now = audio.currentTime;
  const len = Math.floor(audio.sampleRate * 1.6);
  const buffer = audio.createBuffer(1, len, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
  const noise = audio.createBufferSource();
  noise.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1800, now);
  filter.frequency.exponentialRampToValueAtTime(120, now + 1.5);
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audio.destination);
  noise.start(now);
  playRumble(1);
}

// ─── moon ─────────────────────────────────────────────────────────────────────

type Mood = "menace" | "confused" | "impact";

function MoonSvg({ mood }: { mood: Mood }) {
  return (
    <svg width="170" height="170" viewBox="0 0 170 170" fill="none">
      <defs>
        <radialGradient id="emMoonBody" cx="38%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#fbe7b0" />
          <stop offset="55%" stopColor="#e2b867" />
          <stop offset="100%" stopColor="#8f5a2b" />
        </radialGradient>
        <radialGradient id="emEyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff7c2" />
          <stop offset="60%" stopColor="#ffb02e" />
          <stop offset="100%" stopColor="#c2410c" />
        </radialGradient>
      </defs>

      {/* lumpy body */}
      <path
        d="M 85 6 C 120 4 152 28 160 60 C 167 88 160 122 136 145 C 112 166 70 168 44 152 C 16 135 4 104 8 74 C 12 40 46 8 85 6 Z"
        fill="url(#emMoonBody)" stroke="#5c3416" strokeWidth="2"
      />
      {/* craters */}
      <g fill="#a8733a" opacity="0.55">
        <ellipse cx="40" cy="44" rx="10" ry="7" />
        <ellipse cx="132" cy="120" rx="12" ry="8" />
        <ellipse cx="122" cy="32" rx="6" ry="4" />
        <ellipse cx="30" cy="112" rx="7" ry="5" />
        <ellipse cx="88" cy="150" rx="9" ry="4" />
      </g>

      {mood === "menace" && (
        <g>
          {/* heavy angry brows */}
          <path d="M 34 52 L 76 66 L 74 74 L 32 60 Z" fill="#4a2a10" />
          <path d="M 136 52 L 94 66 L 96 74 L 138 60 Z" fill="#4a2a10" />
          {/* glowing eyes */}
          <ellipse cx="56" cy="80" rx="15" ry="11" fill="#2b1406" />
          <ellipse cx="114" cy="80" rx="15" ry="11" fill="#2b1406" />
          <circle cx="58" cy="81" r="6.5" fill="url(#emEyeGlow)" className={styles.eyeGlow} />
          <circle cx="112" cy="81" r="6.5" fill="url(#emEyeGlow)" className={styles.eyeGlow} />
          {/* gritted-teeth grimace */}
          <path d="M 46 116 Q 85 104 124 116 L 120 132 Q 85 124 50 132 Z" fill="#2b1406" />
          <path d="M 50 118 Q 85 108 120 118 L 118 128 Q 85 120 52 128 Z" fill="#f5ecd3" />
          <g stroke="#6b4423" strokeWidth="1.5">
            <line x1="62" y1="115" x2="63" y2="127" />
            <line x1="74" y1="112" x2="74" y2="124" />
            <line x1="85" y1="111" x2="85" y2="123" />
            <line x1="96" y1="112" x2="96" y2="124" />
            <line x1="108" y1="115" x2="107" y2="127" />
            <path d="M 51 123 Q 85 115 119 123" fill="none" />
          </g>
        </g>
      )}

      {mood === "confused" && (
        <g>
          {/* mismatched brows */}
          <path d="M 36 50 Q 56 36 76 50" stroke="#4a2a10" strokeWidth="6" strokeLinecap="round" />
          <path d="M 96 66 L 136 62" stroke="#4a2a10" strokeWidth="6" strokeLinecap="round" />
          {/* one big spiral eye, one squint */}
          <circle cx="56" cy="78" r="15" fill="#f5ecd3" stroke="#2b1406" strokeWidth="2" />
          <path
            className={styles.spiral}
            d="M 56 78 m 0 -2 a 2 2 0 1 1 -2 2 a 4 4 0 1 1 4 4 a 6.5 6.5 0 1 1 -6.5 -6.5 a 9 9 0 1 1 9 9"
            stroke="#2b1406" strokeWidth="1.8" fill="none" strokeLinecap="round"
          />
          <path d="M 100 80 Q 114 74 128 80" stroke="#2b1406" strokeWidth="4" strokeLinecap="round" />
          {/* wobbly mouth */}
          <path d="M 54 122 Q 64 114 74 122 Q 84 130 94 122 Q 104 114 114 122" stroke="#2b1406" strokeWidth="4" strokeLinecap="round" />
          {/* sweat drop */}
          <path d="M 142 72 Q 150 86 142 92 Q 134 86 142 72 Z" fill="#7dd3fc" stroke="#0369a1" strokeWidth="1" className={styles.sweat} />
        </g>
      )}

      {mood === "impact" && (
        <g>
          <path d="M 30 44 L 76 60" stroke="#4a2a10" strokeWidth="7" strokeLinecap="round" />
          <path d="M 140 44 L 94 60" stroke="#4a2a10" strokeWidth="7" strokeLinecap="round" />
          <circle cx="56" cy="80" r="17" fill="#2b1406" />
          <circle cx="114" cy="80" r="17" fill="#2b1406" />
          <circle cx="56" cy="80" r="9" fill="url(#emEyeGlow)" />
          <circle cx="114" cy="80" r="9" fill="url(#emEyeGlow)" />
          <path d="M 44 108 Q 85 96 126 108 Q 120 150 85 150 Q 50 150 44 108 Z" fill="#2b1406" />
          <path d="M 48 109 Q 85 99 122 109 L 120 116 Q 85 107 50 116 Z" fill="#f5ecd3" />
          <path d="M 60 146 Q 85 138 110 146 Q 85 152 60 146 Z" fill="#f5ecd3" />
        </g>
      )}
    </svg>
  );
}

// ─── clock tower ──────────────────────────────────────────────────────────────

function ClockTower({ minutes, rewinding }: { minutes: number; rewinding: boolean }) {
  // Unwound angles so CSS transitions spin forward or backward naturally.
  const minuteDeg = minutes * 6;
  const hourDeg = minutes * 0.5;
  return (
    <svg className={styles.tower} width="132" height="210" viewBox="0 0 132 210" fill="none">
      {/* spire */}
      <polygon points="66,0 40,46 92,46" fill="#3b2a52" stroke="#1a1028" strokeWidth="2" />
      <rect x="62" y="0" width="8" height="10" fill="#fbbf24" opacity="0.7" />
      {/* body */}
      <rect x="22" y="44" width="88" height="166" fill="#2a1f3d" stroke="#1a1028" strokeWidth="2" />
      <g stroke="#1a1028" strokeWidth="1" opacity="0.6">
        <line x1="22" y1="150" x2="110" y2="150" />
        <line x1="22" y1="178" x2="110" y2="178" />
        <line x1="66" y1="150" x2="66" y2="178" />
        <line x1="44" y1="178" x2="44" y2="210" />
        <line x1="88" y1="178" x2="88" y2="210" />
      </g>
      {/* door */}
      <path d="M 54 210 L 54 188 Q 66 176 78 188 L 78 210 Z" fill="#120a1c" />
      {/* clock face */}
      <circle cx="66" cy="96" r="38" fill="#1a1028" />
      <circle
        cx="66" cy="96" r="34"
        fill={rewinding ? "#dbeafe" : "#f5ecd3"}
        stroke={rewinding ? "#60a5fa" : "#b45309"}
        strokeWidth="3"
        className={styles.clockFace}
      />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const r1 = i % 3 === 0 ? 25 : 28;
        return (
          <line
            key={i}
            x1={66 + Math.sin(a) * r1} y1={96 - Math.cos(a) * r1}
            x2={66 + Math.sin(a) * 31} y2={96 - Math.cos(a) * 31}
            stroke="#3b2a52" strokeWidth={i % 3 === 0 ? 3 : 1.5}
          />
        );
      })}
      <g className={styles.hand} style={{ transform: `rotate(${hourDeg}deg)`, transformOrigin: "66px 96px" }}>
        <line x1="66" y1="96" x2="66" y2="76" stroke="#1a1028" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g className={styles.hand} style={{ transform: `rotate(${minuteDeg}deg)`, transformOrigin: "66px 96px" }}>
        <line x1="66" y1="100" x2="66" y2="68" stroke={rewinding ? "#2563eb" : "#b91c1c"} strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <circle cx="66" cy="96" r="3" fill="#1a1028" />
    </svg>
  );
}

// ─── backdrop ─────────────────────────────────────────────────────────────────

const STARS = Array.from({ length: 34 }, (_, i) => ({
  id: i,
  left: (i * 37 + 7) % 100,
  top: (i * 53 + 11) % 62,
  size: 1 + (i % 3),
  delay: ((i * 211) % 300) / 100,
}));

const DEBRIS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  dx: Math.cos((i / 14) * Math.PI * 2) * (140 + (i % 4) * 40),
  dy: Math.sin((i / 14) * Math.PI * 2) * (90 + (i % 3) * 30) - 40,
  size: 6 + (i % 4) * 4,
  delay: (i % 5) * 0.04,
}));

function Town() {
  return (
    <svg className={styles.town} viewBox="0 0 640 80" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M 0 80 L 0 46 L 30 46 L 30 30 L 52 18 L 74 30 L 74 50 L 110 50 L 110 36 L 140 36 L 140 54 L 190 54 L 190 28 L 214 14 L 238 28 L 238 52
           L 402 52 L 402 32 L 430 18 L 458 32 L 458 48 L 500 48 L 500 26 L 524 26 L 524 44 L 566 44 L 566 30 L 590 16 L 614 30 L 614 50 L 640 50 L 640 80 Z"
        fill="#140c22"
      />
      <g fill="#fbbf24" opacity="0.55">
        <rect x="44" y="34" width="6" height="6" />
        <rect x="120" y="42" width="5" height="5" />
        <rect x="206" y="34" width="6" height="7" />
        <rect x="424" y="36" width="6" height="6" />
        <rect x="508" y="32" width="5" height="5" />
        <rect x="584" y="36" width="6" height="7" />
      </g>
    </svg>
  );
}

// ─── dialog (RPG text box) ────────────────────────────────────────────────────

function useTypewriter(text: string, resetKey: string) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(0);
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, 22);
    return () => clearInterval(id);
  }, [text, resetKey]);
  return { shown: text.slice(0, count), finished: count >= text.length };
}

function hourLabel(remaining: number) {
  if (remaining <= 0) return "The Final Moment";
  if (remaining <= 30) return "Final Minutes";
  if (remaining <= 60) return "The Last Hour";
  return "Final Hours";
}

const NOTES = [
  { glyph: "♪", dx: 10, delay: 0 },
  { glyph: "♫", dx: 34, delay: 0.25 },
  { glyph: "♪", dx: 20, delay: 0.5 },
  { glyph: "♬", dx: 44, delay: 0.75 },
];

// ─── scene ────────────────────────────────────────────────────────────────────

export function ElapsedMinutesScene({ snapshot }: { snapshot: Snapshot<ElapsedMinutesState> }) {
  const { log, index, elapsed, stepMinutes, phase } = snapshot.state;
  const logKey = log.join(",");

  // Use the real algorithm to know the final total and each segment's minutes.
  const total = useMemo(() => new ElapsedMinutes({ log }).run(), [logKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const segments = useMemo(
    () =>
      log.slice(0, -1).map((t, i) => ({
        from: t,
        to: log[i + 1],
        minutes: new ElapsedMinutes({ log: [t, log[i + 1]] }).run(),
        rollback: clockMinutes(log[i + 1]) < clockMinutes(t),
      })),
    [logKey], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const isInit = phase === "init";
  const isDone = phase === "done";
  const isConfused = phase === "confused";
  const current = index !== null ? segments[index] : null;
  const isRecovery = phase === "falling" && !!current?.rollback;

  const clockTime = isInit || log.length === 0 ? log[0] ?? "00:00" : isDone ? log[log.length - 1] : current!.to;
  const clockDelta = current ? clockMinutes(current.to) - clockMinutes(current.from) : 0;

  // How far the moon has fallen: real elapsed minutes over the final total.
  // While confused, it trusts the clock and backs off by the (negative) clock delta.
  const believed = isConfused ? elapsed + clockDelta : elapsed;
  const rawDoom = isInit ? 0 : total > 0 ? believed / total : 1;
  const doom = Math.max(-0.35, Math.min(1, rawDoom));
  const heat = Math.max(0, doom);

  const moonY = isDone ? 205 : lerp(60, 150, doom);
  const moonScale = isDone ? 2.5 : Math.max(0.3, lerp(0.42, 1.35, doom));
  const mood: Mood = isDone ? "impact" : isConfused ? "confused" : "menace";
  const remaining = total - elapsed;
  const believedRemaining = total - believed;
  const timeLeft = isInit ? 1 : total > 0 ? believedRemaining / total : 0;
  const hearts = isDone ? 0 : Math.max(1, Math.ceil(6 * (1 - heat)));

  // ── ending: play the melody to go back to the first minute ──
  const [rewinding, setRewinding] = useState(false);
  useEffect(() => setRewinding(false), [phase, index, logKey]);
  const pose: HeroPose = rewinding ? "flute" : isDone ? "shield" : isConfused ? "flute" : isRecovery ? "scratch" : "guard";

  const rewindToStart = () => {
    setRewinding(true);
    playRewindMelody();
    setTimeout(() => {
      // Drive the shared Player back to the first snapshot.
      document.querySelector<HTMLButtonElement>('button[aria-label="reset"]')?.click();
    }, 1500);
  };

  // ── sound per step ──
  useEffect(() => {
    if (phase === "falling") {
      playTone(isRecovery ? 330 : 1320, 40);
      playRumble(heat);
    } else if (phase === "confused") {
      playRewindMelody();
    } else if (phase === "done") {
      playImpact();
    }
  }, [phase, index]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── dialog content ──
  const formula = current ? formulaFor(current.from, current.to) : null;
  const dialog: { speaker: string; text: string; detail?: React.ReactNode } = isInit
    ? {
        speaker: "Hero",
        text: `The moon is falling! ${total} minutes until it hits... every clock reading brings it closer.`,
      }
    : isDone
      ? {
          speaker: "Moon",
          text: `${total} minutes have passed. Your time... is up!`,
          detail: (
            <>
              {segments.map((s) => s.minutes).join(" + ")} = <b className={styles.pos}>{total}</b>
            </>
          ),
        }
      : isConfused
        ? {
            speaker: "Moon",
            text: `${current!.to}...? The clock went back ${-clockDelta} minutes? Did the hero turn back time?!`,
            detail: (
              <>
                {current!.from} ↺ {current!.to} · the clock says <b className={styles.neg}>{clockDelta} min</b>
              </>
            ),
          }
        : isRecovery
          ? {
              speaker: "Hero",
              text: `Hm... the clock fell back an hour, but time never went back. Only ${stepMinutes} real minutes passed.`,
              detail: (
                <>
                  {formula!.text} = <b className={styles.pos}>+{stepMinutes}</b>
                </>
              ),
            }
          : {
              speaker: "Clock Tower",
              text: `${current!.from} → ${current!.to}: ${formula!.note}.`,
              detail: (
                <>
                  {formula!.text} = <b className={styles.pos}>+{stepMinutes}</b>
                </>
              ),
            };
  const { shown, finished } = useTypewriter(dialog.text, `${phase}-${index}-${logKey}`);

  const bannerKey = `${phase}-${index}`;
  const shakeClass = isDone ? styles.shakeHard : heat > 0.55 ? styles.shake : "";

  return (
    <div className="scene">
      <div className={styles.wrap}>
        {/* header */}
        <div className={styles.header}>
          <span className={styles.brand}>🌕 ELAPSED·MINUTES</span>
          <div className={styles.counter}>
            <GemIcon />
            <span className={styles.counterVal}>{elapsed}</span>
            <span className={styles.counterLabel}>min elapsed</span>
          </div>
        </div>

        {/* stage */}
        <div
          className={[styles.stage, shakeClass, rewinding ? styles.stageRewinding : ""].join(" ")}
          style={{ ["--heat" as string]: heat, ["--shake" as string]: `${1 + heat * 3}px` }}
        >
          <div className={styles.skyHeat} />
          {STARS.map((s) => (
            <span
              key={s.id}
              className={styles.star}
              style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, opacity: 1 - heat * 0.8 }}
            />
          ))}

          {/* HUD */}
          <div className={styles.hud}>
            <Hearts halves={hearts} />
            <div className={styles.gauge}>
              <ArcGauge left={timeLeft} />
              <span className={styles.gaugeLabel}>{isDone ? 0 : Math.max(0, believedRemaining)}′</span>
            </div>
          </div>

          {/* the moon */}
          <div
            className={[styles.moon, isConfused ? styles.moonConfused : ""].join(" ")}
            style={{ transform: `translate(-50%, ${moonY}px) scale(${moonScale})` }}
          >
            <div className={isConfused ? styles.wobble : isDone ? "" : styles.hover}>
              <MoonSvg mood={mood} />
            </div>
            {isConfused && <span className={styles.question}>?</span>}
          </div>

          {/* rewind ripple */}
          {isConfused && (
            <div key={`ripple-${bannerKey}`} className={styles.ripple}>
              <span />
              <span />
              <span />
            </div>
          )}

          <Town />
          <ClockTower minutes={clockMinutes(rewinding ? log[0] : clockTime)} rewinding={isConfused || rewinding} />
          <div className={[styles.digital, isConfused ? styles.digitalRewind : ""].join(" ")}>{clockTime}</div>

          {/* hero */}
          <div
            className={[
              styles.hero,
              pose === "guard" ? styles.heroGuard : "",
              pose === "scratch" ? styles.heroScratch : "",
              pose === "shield" ? styles.heroShield : "",
            ].join(" ")}
          >
            <HeroSprite pose={pose} px={4} />
            {pose === "scratch" && <span className={styles.heroThink}>?</span>}
            {(isConfused || rewinding) &&
              NOTES.map((n, i) => (
                <span
                  key={`${bannerKey}-${i}`}
                  className={styles.note}
                  style={{ left: n.dx, animationDelay: `${n.delay}s` }}
                >
                  {n.glyph}
                </span>
              ))}
          </div>

          {/* title card */}
          <div key={bannerKey} className={[styles.banner, isDone ? styles.bannerDone : ""].join(" ")}>
            {isInit && (
              <>
                <div className={styles.bannerKicker}>— Dawn of —</div>
                <div className={styles.bannerTitle}>The First Minute</div>
                <div className={styles.bannerSub}>{total} minutes remain</div>
              </>
            )}
            {phase === "falling" && current && (
              <>
                <div className={styles.bannerKicker}>— {hourLabel(remaining)} —</div>
                <div className={styles.bannerTitle}>{current.to}</div>
                <div className={styles.bannerSub}>
                  {remaining} minute{remaining === 1 ? "" : "s"} remain
                </div>
              </>
            )}
            {isConfused && current && (
              <>
                <div className={[styles.bannerKicker, styles.bannerKickerBlue].join(" ")}>♪ the melody of rewinding ♪</div>
                <div className={[styles.bannerTitle, styles.bannerConfused].join(" ")}>{current.to}?!</div>
                <div className={styles.bannerSub}>the clock fell back an hour…</div>
              </>
            )}
            {isDone && (
              <>
                <div className={styles.bannerTitle}>{total} minutes</div>
                <div className={styles.bannerSub}>have truly elapsed</div>
              </>
            )}
          </div>

          {isDone && (
            <>
              <div className={styles.flash} />
              {DEBRIS.map((d) => (
                <span
                  key={d.id}
                  className={styles.debris}
                  style={{
                    width: d.size,
                    height: d.size,
                    animationDelay: `${d.delay}s`,
                    ["--dx" as string]: `${d.dx}px`,
                    ["--dy" as string]: `${d.dy}px`,
                  }}
                />
              ))}
              <div className={styles.ending}>
                <div className={styles.endingTitle}>Return to the first minute?</div>
                <button className={styles.endingBtn} onClick={rewindToStart} disabled={rewinding}>
                  {rewinding ? "♪ ♫ ♪ …" : "♪ Play the melody of rewinding"}
                </button>
              </div>
            </>
          )}
          {rewinding && <div className={styles.rewindVeil} />}
        </div>

        {/* RPG dialog box */}
        <div className={[styles.dialog, isConfused ? styles.dialogConfused : ""].join(" ")}>
          <span className={styles.speaker}>{dialog.speaker}</span>
          <p className={styles.dialogText}>
            {shown}
            {finished && <span className={styles.caret}>▼</span>}
          </p>
          {dialog.detail && <div className={styles.dialogDetail}>{dialog.detail}</div>}
        </div>

        {/* timeline ribbon */}
        <div className={styles.ribbon}>
          {segments.map((s, i) => {
            const state =
              isDone || (index !== null && (i < index || (i === index && phase === "falling")))
                ? styles.segPast
                : i === index
                  ? styles.segCurrent
                  : "";
            return (
              <div
                key={i}
                className={[styles.seg, state, s.rollback ? styles.segRollback : "", i === index ? styles.segActive : ""].join(" ")}
                style={{ flexGrow: Math.max(1, s.minutes) }}
                title={`${s.from} → ${s.to}: ${s.minutes} min`}
              >
                <span className={styles.segLabel}>
                  {s.rollback && "↺ "}
                  {s.minutes}
                </span>
              </div>
            );
          })}
        </div>
        <div className={styles.ribbonTimes}>
          {log.map((t, i) => {
            const weights = segments.map((s) => Math.max(1, s.minutes));
            const sum = weights.reduce((a, b) => a + b, 0) || 1;
            const left = (weights.slice(0, i).reduce((a, b) => a + b, 0) / sum) * 100;
            return (
              <span
                key={i}
                className={[styles.time, index !== null && (i === index || i === index + 1) ? styles.timeActive : ""].join(" ")}
                style={{ left: `${left}%` }}
              >
                {t}
              </span>
            );
          })}
        </div>

        {/* status */}
        <div className={styles.status}>
          <span className={styles.statusLabel}>{snapshot.label ?? "init"}</span>
          <span className={[styles.statusText, isDone ? styles.statusTextDone : ""].join(" ")}>
            {isInit
              ? "the moon waits"
              : isDone
                ? `impact · ${total} minutes`
                : isConfused
                  ? "the moon is confused"
                  : `+${stepMinutes} · ${remaining} left`}
          </span>
        </div>
      </div>
    </div>
  );
}
