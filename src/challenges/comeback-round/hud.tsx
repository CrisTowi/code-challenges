import styles from "./scene.module.css";

export const KART_COLORS = ["#22d3ee", "#f472b6", "#facc15", "#a3e635", "#fb923c", "#c084fc", "#60a5fa", "#f87171"];
export const KART_NAMES = ["VOLT", "NOVA", "BLITZ", "MOSS", "EMBER", "HAZE", "TIDE", "RUBY"];

export const kartColor = (i: number) => KART_COLORS[i % KART_COLORS.length];
export const kartName = (i: number) => KART_NAMES[i % KART_NAMES.length];

// ─── drivers: original animal mascots, one per kart ──────────────────────────

export type Animal = "fox" | "cat" | "frog" | "panda" | "owl" | "bunny" | "shark" | "bot";
export type Mood = "race" | "cheer" | "sad";

export interface Driver {
  animal: Animal;
  fur: string;
  /** Second color: snout, belly, inner ears, beak. */
  accent: string;
  /** Scarf color. */
  scarf: string;
}

export const DRIVERS: Driver[] = [
  { animal: "fox", fur: "#fb923c", accent: "#fff7ed", scarf: "#f472b6" },
  { animal: "cat", fur: "#c4b5fd", accent: "#fbcfe8", scarf: "#22d3ee" },
  { animal: "frog", fur: "#4ade80", accent: "#fef9c3", scarf: "#f87171" },
  { animal: "panda", fur: "#f8fafc", accent: "#111827", scarf: "#facc15" },
  { animal: "owl", fur: "#a16207", accent: "#fde68a", scarf: "#22d3ee" },
  { animal: "bunny", fur: "#cbd5e1", accent: "#fbcfe8", scarf: "#a3e635" },
  { animal: "shark", fur: "#60a5fa", accent: "#f1f5f9", scarf: "#fb923c" },
  { animal: "bot", fur: "#94a3b8", accent: "#22d3ee", scarf: "#f472b6" },
];

export const driverOf = (i: number) => DRIVERS[i % DRIVERS.length];

const INK = "#0b0820";

/** One eye in 2D, drawn to match the mood. */
function Eye2D({ x, y, mood, light }: { x: number; y: number; mood: Mood; light?: boolean }) {
  const c = light ? "#f8fafc" : INK;
  if (mood === "cheer") return <path d={`M${x - 1.1} ${y + 0.5} L${x} ${y - 0.7} L${x + 1.1} ${y + 0.5}`} stroke={c} strokeWidth="0.8" fill="none" />;
  if (mood === "sad")
    return (
      <>
        <path d={`M${x - 1.1} ${y - 0.4} L${x + 1.1} ${y + 0.4}`} stroke={c} strokeWidth="0.8" />
        <path d={`M${x + 0.6} ${y + 1.2} q0.5 1 0 1.6 q-0.5 -0.6 0 -1.6`} fill="#60a5fa" />
      </>
    );
  return <circle cx={x} cy={y} r="0.9" fill={c} />;
}

/** Animal head facing right, centred on (0, 0), radius ≈ 6. */
export function DriverHead2D({ driver, mood }: { driver: Driver; mood: Mood }) {
  const { animal, fur, accent } = driver;
  const line = { stroke: INK, strokeWidth: 0.9 };
  const eyes = (light?: boolean, y = -0.4) => (
    <>
      <Eye2D x={1.2} y={y} mood={mood} light={light} />
      <Eye2D x={4} y={y} mood={mood} light={light} />
    </>
  );
  const goggles = (
    <>
      <path d="M-6 -3.6 L6 -3.6" stroke={INK} strokeWidth="1.6" />
      <circle cx="1.2" cy="-3.6" r="1.5" fill="#22d3ee" stroke={INK} strokeWidth="0.6" />
      <circle cx="4.3" cy="-3.6" r="1.5" fill="#22d3ee" stroke={INK} strokeWidth="0.6" />
    </>
  );

  switch (animal) {
    case "fox":
      return (
        <g>
          <path d="M-4.6 -2.5 L-5.6 -10 L-0.8 -5.2 Z M0.6 -5.4 L3.4 -10.4 L4.8 -3.6 Z" fill={fur} {...line} />
          <circle r="6" fill={fur} {...line} />
          <path d="M1 0.5 Q4 -1 8.2 1.2 Q5 4.6 0.6 3.4 Z" fill={accent} {...line} />
          <circle cx="8" cy="1.2" r="0.9" fill={INK} />
          {goggles}
          {eyes()}
        </g>
      );
    case "cat":
      return (
        <g>
          <path d="M-5 -2.4 L-4.6 -9.6 L-0.6 -5.4 Z M0.8 -5.6 L4.4 -9.4 L5 -2.8 Z" fill={fur} {...line} />
          <path d="M-4.2 -4 L-4 -7.6 L-2 -5.4 Z" fill={accent} />
          <circle r="6" fill={fur} {...line} />
          <path d="M5 1.6 L9.4 0.6 M5 2.4 L9.4 2.8" stroke={INK} strokeWidth="0.5" />
          <path d="M5.4 1.2 l0.9 0.8 l-0.9 0.6 z" fill="#f472b6" />
          {goggles}
          {eyes()}
        </g>
      );
    case "frog":
      return (
        <g>
          <ellipse rx="6.6" ry="5.4" fill={fur} {...line} />
          <circle cx="0.6" cy="-5" r="2.6" fill={fur} {...line} />
          <circle cx="4.6" cy="-4.6" r="2.4" fill={fur} {...line} />
          <circle cx="0.6" cy="-5.2" r="1.6" fill="#fff" />
          <circle cx="4.6" cy="-4.8" r="1.5" fill="#fff" />
          <Eye2D x={0.8} y={-5.2} mood={mood} />
          <Eye2D x={4.8} y={-4.8} mood={mood} />
          <path d={mood === "sad" ? "M0 3.4 Q3.5 1.6 6.4 3" : "M-0.4 1.6 Q3 4.6 6.4 1.4"} stroke={INK} strokeWidth="0.9" fill="none" />
          <ellipse cx="-2.6" cy="2" rx="1.2" ry="0.7" fill="#f472b6" opacity="0.7" />
        </g>
      );
    case "panda":
      return (
        <g>
          <circle cx="-3.6" cy="-4.8" r="2.4" fill={accent} />
          <circle cx="2.8" cy="-5.4" r="2.2" fill={accent} />
          <circle r="6" fill={fur} {...line} />
          <ellipse cx="1.2" cy="-0.2" rx="1.6" ry="2" fill={accent} transform="rotate(-20 1.2 -0.2)" />
          <ellipse cx="4.2" cy="-0.2" rx="1.4" ry="1.9" fill={accent} transform="rotate(20 4.2 -0.2)" />
          <circle cx="6" cy="2.2" r="0.9" fill={accent} />
          {goggles}
          {eyes(true)}
        </g>
      );
    case "owl":
      return (
        <g>
          <path d="M-5 -3 L-5.8 -9 L-1.6 -5.4 Z M1.6 -5.6 L4.6 -9.4 L5.4 -3 Z" fill={fur} {...line} />
          <circle r="6" fill={fur} {...line} />
          <circle cx="1.2" cy="-0.6" r="2.2" fill={accent} />
          <circle cx="4.4" cy="-0.6" r="2" fill={accent} />
          <path d="M2.4 1.4 L4 1.4 L3.2 3.8 Z" fill="#f97316" stroke={INK} strokeWidth="0.4" />
          <Eye2D x={1.2} y={-0.6} mood={mood} />
          <Eye2D x={4.4} y={-0.6} mood={mood} />
        </g>
      );
    case "bunny":
      return (
        <g>
          <ellipse cx="-3" cy="-9" rx="1.8" ry="5" fill={fur} {...line} transform="rotate(-18 -3 -9)" />
          <ellipse cx="1" cy="-10" rx="1.8" ry="5.2" fill={fur} {...line} transform="rotate(8 1 -10)" />
          <ellipse cx="1" cy="-10" rx="0.8" ry="3.6" fill={accent} transform="rotate(8 1 -10)" />
          <circle r="6" fill={fur} {...line} />
          <circle cx="6.2" cy="1.2" r="0.9" fill="#f472b6" />
          <ellipse cx="2.6" cy="2.6" rx="1.1" ry="0.6" fill="#f472b6" opacity="0.6" />
          {goggles}
          {eyes()}
        </g>
      );
    case "shark":
      return (
        <g>
          <path d="M-3 -4.6 L-1 -12 L2.4 -5.2 Z" fill={fur} {...line} />
          <circle r="6" fill={fur} {...line} />
          <path d="M-5.6 2 Q0 1 6 0.6 Q4 5.6 -2 5.6 Q-5 4.8 -5.6 2 Z" fill={accent} />
          <path d="M0.4 2 l0.8 1 l0.8 -1 l0.8 1 l0.8 -1 l0.8 1" stroke={INK} strokeWidth="0.5" fill="none" />
          {goggles}
          {eyes()}
        </g>
      );
    case "bot":
      return (
        <g>
          <path d="M-1 -6 L-1.6 -10" stroke={INK} strokeWidth="0.9" />
          <circle cx="-1.6" cy="-10.6" r="1.3" fill="#f472b6" />
          <rect x="-6" y="-6" width="12" height="11" rx="2.4" fill={fur} {...line} />
          <rect x="0" y="-2.6" width="5.6" height="3" rx="1" fill={INK} />
          {mood === "sad" ? (
            <path d="M0.8 -0.6 L2.4 -1.6 M3.4 -1.6 L5 -0.6" stroke={accent} strokeWidth="0.8" />
          ) : mood === "cheer" ? (
            <path d="M0.8 -0.6 L1.6 -1.8 L2.4 -0.6 M3.2 -0.6 L4 -1.8 L4.8 -0.6" stroke={accent} strokeWidth="0.7" fill="none" />
          ) : (
            <>
              <rect x="0.9" y="-1.8" width="1.4" height="1.4" fill={accent} />
              <rect x="3.3" y="-1.8" width="1.4" height="1.4" fill={accent} />
            </>
          )}
          <path d="M1 2.6 h4" stroke={INK} strokeWidth="0.6" strokeDasharray="0.8 0.6" />
        </g>
      );
  }
}

/** Original side-view kart sprite facing right, with its animal driver. */
export function Kart({ index, boost, ghost, mood = "race" }: { index: number; boost?: boolean; ghost?: boolean; mood?: Mood }) {
  const color = kartColor(index);
  const driver = driverOf(index);
  const cheer = mood === "cheer";
  return (
    <svg className={`${styles.kartSvg} ${ghost ? styles.kartGhost : ""}`} viewBox="0 0 56 32" aria-hidden>
      {boost && (
        <g className={styles.flame}>
          <path d="M3 19 L-9 16 L-4 20 L-11 23 L3 22 Z" fill="#fde047" />
          <path d="M3 19.5 L-4 18 L-1 20.5 L-5 22 L3 21.5 Z" fill="#fb923c" />
        </g>
      )}
      <ellipse cx="28" cy="29.5" rx="24" ry="2" fill="rgba(0,0,0,0.45)" />
      {/* spoiler */}
      <rect x="3" y="7" width="9" height="3" rx="1" fill={color} />
      <rect x="6.5" y="9" width="2" height="7" fill="#1e1b4b" />
      {/* scarf (behind the driver) */}
      <path
        className={`${styles.scarf} ${boost ? styles.scarfFast : ""}`}
        d="M20 13.5 Q14 11 8 13.5 Q11 14.5 9 16.8 Q15 15.4 20 16.2 Z"
        fill={driver.scarf}
        stroke={INK}
        strokeWidth="0.6"
      />
      {/* body + arms */}
      <path d="M21 15 Q21 12.5 25 12.5 Q29 12.5 29 15 Z" fill={color} stroke={INK} strokeWidth="0.8" />
      {cheer ? (
        <g className={styles.cheerArms}>
          <path d="M22 14 L14 3 M28 14 L36 2.5" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="14" cy="2.7" r="1.8" fill={driver.fur} stroke={INK} strokeWidth="0.6" />
          <circle cx="36" cy="2.2" r="1.8" fill={driver.fur} stroke={INK} strokeWidth="0.6" />
        </g>
      ) : (
        <>
          <path d="M33 10.5 L33.6 15.5" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M27 14 L32.6 13" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx="32.8" cy="13" r="1.2" fill={driver.fur} stroke={INK} strokeWidth="0.5" />
        </>
      )}
      {/* chassis */}
      <path d="M4 22 L9 15 L33 14 L46 17 L53 21 L51 24 L6 24 Z" fill={color} stroke={INK} strokeWidth="1.2" />
      <path d="M12 18 L44 18" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
      {/* driver head */}
      <g transform="translate(25 6) scale(1.25)" className={mood === "sad" ? styles.headShake : cheer ? styles.headBounce : undefined}>
        <DriverHead2D driver={driver} mood={mood} />
      </g>
      {/* wheels */}
      <g className={boost ? styles.wheelSpin : undefined}>
        <circle cx="13" cy="24.5" r="5.5" fill={INK} />
        <circle cx="13" cy="24.5" r="2.2" fill="#94a3b8" />
        <circle cx="44" cy="24.5" r="5" fill={INK} />
        <circle cx="44" cy="24.5" r="2" fill="#94a3b8" />
      </g>
      <text x="37" y="22.6" fontSize="6" fontFamily="monospace" fontWeight="bold" fill={INK} textAnchor="middle">
        {index + 1}
      </text>
    </svg>
  );
}

/** Synthwave sun with horizontal cut bands. */
export function Sun() {
  return (
    <svg className={styles.sun} viewBox="0 0 120 60" aria-hidden>
      <defs>
        <linearGradient id="cr-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="55%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#c026d3" />
        </linearGradient>
        <clipPath id="cr-sun-cut">
          <rect x="0" y="0" width="120" height="30" />
          <rect x="0" y="33" width="120" height="5" />
          <rect x="0" y="41" width="120" height="4" />
          <rect x="0" y="48" width="120" height="3" />
          <rect x="0" y="54" width="120" height="2" />
        </clipPath>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(#cr-sun)" clipPath="url(#cr-sun-cut)" />
    </svg>
  );
}

export function Mountains() {
  return (
    <svg className={styles.mountains} viewBox="0 0 640 60" preserveAspectRatio="none" aria-hidden>
      <path d="M0 60 L0 38 L60 14 L110 34 L170 6 L240 40 L300 20 L360 44 L420 10 L490 36 L560 18 L640 40 L640 60 Z" fill="#2e1065" />
      <path
        d="M0 38 L60 14 L110 34 L170 6 L240 40 L300 20 L360 44 L420 10 L490 36 L560 18 L640 40"
        fill="none"
        stroke="#e879f9"
        strokeWidth="1.5"
        opacity="0.8"
      />
    </svg>
  );
}

/** Top-3 podium for the finish overlay. */
export function Podium({ order, totals }: { order: number[]; totals: number[] }) {
  const slots = [order[1], order[0], order[2]];
  const heights = [44, 64, 30];
  const places = [2, 1, 3];
  return (
    <div className={styles.podium}>
      {slots.map((k, s) =>
        k === undefined ? (
          <div key={s} className={styles.podiumSlot} />
        ) : (
          <div key={s} className={styles.podiumSlot} style={{ animationDelay: `${0.15 * places[s]}s` }}>
            <div className={styles.podiumKart}>
              <Kart index={k} mood={places[s] === 1 ? "cheer" : "race"} />
              <span className={styles.podiumScore} style={{ color: kartColor(k) }}>
                {totals[k]}
              </span>
            </div>
            <div className={styles.podiumStep} style={{ height: heights[s], borderColor: kartColor(k) }}>
              {places[s]}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
