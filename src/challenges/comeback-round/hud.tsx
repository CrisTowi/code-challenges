import styles from "./scene.module.css";

export const KART_COLORS = ["#22d3ee", "#f472b6", "#facc15", "#a3e635", "#fb923c", "#c084fc", "#60a5fa", "#f87171"];
export const KART_NAMES = ["VOLT", "NOVA", "BLITZ", "MOSS", "EMBER", "HAZE", "TIDE", "RUBY"];

export const kartColor = (i: number) => KART_COLORS[i % KART_COLORS.length];
export const kartName = (i: number) => KART_NAMES[i % KART_NAMES.length];

/** Original side-view kart sprite facing right. */
export function Kart({ index, boost, ghost }: { index: number; boost?: boolean; ghost?: boolean }) {
  const color = kartColor(index);
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
      {/* chassis */}
      <path d="M4 22 L9 15 L33 14 L46 17 L53 21 L51 24 L6 24 Z" fill={color} stroke="#0b0820" strokeWidth="1.2" />
      <path d="M12 18 L44 18" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
      {/* driver */}
      <circle cx="25" cy="10.5" r="6" fill="#f8fafc" stroke="#0b0820" strokeWidth="1.2" />
      <path d="M26 8 h5.5 a2 2 0 0 1 0 4 H26 Z" fill="#0b0820" />
      <path d="M19.5 9.5 h5" stroke={color} strokeWidth="2" />
      {/* wheels */}
      <g className={boost ? styles.wheelSpin : undefined}>
        <circle cx="13" cy="24.5" r="5.5" fill="#0b0820" />
        <circle cx="13" cy="24.5" r="2.2" fill="#94a3b8" />
        <circle cx="44" cy="24.5" r="5" fill="#0b0820" />
        <circle cx="44" cy="24.5" r="2" fill="#94a3b8" />
      </g>
      <text x="37" y="22.6" fontSize="6" fontFamily="monospace" fontWeight="bold" fill="#0b0820" textAnchor="middle">
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
              <Kart index={k} />
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
