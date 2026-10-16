import { useMemo, useRef, useState } from "react";
import type { Snapshot } from "@framework";
import type { MaxCandyState } from "./algorithm";
import styles from "./scene.module.css";

const CELL_W = 96;
const KID_W  = 40;
const ARC_H  = 72;

type Costume = "witch" | "ghost" | "vampire" | "pumpkin";

const COSTUME_LABELS: Record<Costume, string> = {
  witch:   "🧙 Witch",
  ghost:   "👻 Ghost",
  vampire: "🧛 Vampire",
  pumpkin: "🎃 Pumpkin",
};

// ─── Haunted house ────────────────────────────────────────────────────────────

function HouseSvg({ active, collected }: { active: boolean; collected: boolean }) {
  const wall = active ? "#200830" : "#160820";
  const roof = active ? "#5b21b6" : collected ? "#3a2265" : "#2d1b4e";
  const eye  = active ? "#ffa500" : "#ff7800";
  const ring = "#6a3090";

  return (
    <svg width="64" height="68" viewBox="0 0 64 68" fill="none">
      {/* chimney */}
      <rect x="42" y="4" width="8" height="22" fill={roof} stroke={ring} strokeWidth="1" />
      {/* bat on chimney */}
      <g opacity="0.85">
        <ellipse cx="46" cy="4" rx="3.5" ry="2.5" fill="#0d0616" />
        <path d="M 40 4 Q 36 0 33 2 Q 37 5 40 5" fill="#3d1b5e" />
        <path d="M 52 4 Q 56 0 59 2 Q 55 5 52 5" fill="#3d1b5e" />
      </g>
      {/* jagged roof */}
      <polygon
        points="4,30 10,22 16,29 22,15 28,25 32,5 36,25 42,15 48,29 54,22 60,30"
        fill={roof} stroke={ring} strokeWidth="1"
      />
      {/* wall */}
      <rect x="6" y="28" width="52" height="40" fill={wall} stroke={ring} strokeWidth="1.5" />
      {/* spider web */}
      <g stroke={ring} strokeWidth="0.6" opacity="0.65" fill="none">
        <line x1="6"  y1="28" x2="19" y2="39" />
        <line x1="12" y1="28" x2="12" y2="39" />
        <line x1="19" y1="28" x2="7"  y2="38" />
        <path d="M 6 31 Q 12.5 33 19 31" />
        <path d="M 6 34 Q 12.5 36 19 34" />
        <path d="M 7 37 Q 12.5 39 18 37" />
      </g>
      {/* triangle window eyes */}
      <polygon points="9,44 18,44 13.5,34" fill={eye} opacity={collected ? 1 : 0.88} />
      <polygon points="46,44 55,44 50.5,34" fill={eye} opacity={collected ? 1 : 0.88} />
      {/* door mouth (jagged) */}
      <polygon points="22,68 25,60 28,65 32,56 36,65 39,60 42,68" fill={eye} opacity="0.82" />
      {/* pumpkin on doorstep */}
      <g transform="translate(26,58)">
        <rect x="5" y="-5" width="2" height="5" rx="1" fill="#2d5a1a" />
        <ellipse cx="6" cy="5" rx="5.5" ry="4.5" fill="#c04000" />
        <polygon points="3,4 7,4 5,7"   fill="#0a0818" />
        <polygon points="9,4 6,4 7.5,7" fill="#0a0818" />
        <path d="M 2 8 Q 6 10 10 8" stroke="#0a0818" strokeWidth="0.7" />
      </g>
      {/* collected glow ring (purple) — shown whenever the flag is shown */}
      {collected && (
        <rect x="5" y="27" width="54" height="41" fill="none" stroke="#a855f7" strokeWidth="1.5" opacity="0.55" rx="1" />
      )}
    </svg>
  );
}

// ─── Kid costumes ─────────────────────────────────────────────────────────────

function WitchSvg({ happy }: { happy: boolean }) {
  const skin = "#b8d060";
  return (
    <svg width="40" height="56" viewBox="0 0 40 56" fill="none">
      {/* hat */}
      <polygon points="20,0 10,13 30,13" fill="#1a0a2e" />
      <rect x="10" y="10" width="20" height="3" fill="#8b5cf6" />
      <rect x="7"  y="12" width="26" height="3" rx="1" fill="#1a0a2e" />
      {/* head */}
      <rect x="11" y="12" width="18" height="13" rx="3" fill={skin} />
      <rect x="14" y="16" width="3" height="3" rx="1" fill="#1a0a2e" />
      <rect x="23" y="16" width="3" height="3" rx="1" fill="#1a0a2e" />
      <rect x="15" y="16" width="1" height="1" fill="#fff" />
      <rect x="24" y="16" width="1" height="1" fill="#fff" />
      <polygon points="19,20 22,20 20,23" fill={skin} stroke="#8a7030" strokeWidth="0.5" />
      {happy
        ? <path d="M 14 23 Q 20 28 26 23" stroke="#1a0a2e" strokeWidth="1.5" strokeLinecap="round" />
        : <rect x="14" y="23" width="12" height="2" rx="1" fill="#1a0a2e" />
      }
      {/* neck */}
      <rect x="17" y="25" width="6" height="3" fill={skin} />
      {/* robe */}
      <rect x="10" y="28" width="20" height="11" rx="2" fill="#2d1b4e" />
      <circle cx="15" cy="32" r="1.5" fill="#8b5cf6" />
      <circle cx="25" cy="34" r="1.5" fill="#8b5cf6" />
      <circle cx="20" cy="30" r="1"   fill="#ffd700" />
      {/* skirt */}
      <polygon points="10,39 8,54 32,54 30,39" fill="#2d1b4e" />
      {/* arms */}
      {happy ? (
        <>
          <rect x="2"  y="19" width="10" height="5" rx="2.5" fill={skin} transform="rotate(-45 7 22)" />
          <rect x="28" y="19" width="10" height="5" rx="2.5" fill={skin} transform="rotate(45 33 22)" />
        </>
      ) : (
        <>
          <rect x="1"  y="28" width="10" height="4" rx="2" fill={skin} />
          <rect x="29" y="28" width="10" height="4" rx="2" fill={skin} />
        </>
      )}
      {/* boots */}
      <rect x="12" y="51" width="7" height="5" rx="1.5" fill="#0d0516" />
      <rect x="21" y="51" width="7" height="5" rx="1.5" fill="#0d0516" />
    </svg>
  );
}

function GhostSvg({ happy }: { happy: boolean }) {
  return (
    <svg width="40" height="56" viewBox="0 0 40 56" fill="none">
      {/* body */}
      <path
        d="M 8 30 Q 8 8 20 8 Q 32 8 32 30 L 32 46 Q 28 50 24 46 Q 22 50 20 46 Q 18 50 16 46 Q 12 50 8 46 Z"
        fill="#dce8f0" stroke="#b0c4d8" strokeWidth="1"
      />
      {/* inner highlight */}
      <ellipse cx="20" cy="20" rx="7" ry="5" fill="#eef4f8" opacity="0.45" />
      {/* eyes */}
      <ellipse cx="15" cy="26" rx="4"   ry={happy ? 2   : 4}   fill="#1a0a2e" />
      <ellipse cx="25" cy="26" rx="4"   ry={happy ? 2   : 4}   fill="#1a0a2e" />
      <circle  cx="13.5" cy="24.5" r="1.2" fill="#fff" />
      <circle  cx="23.5" cy="24.5" r="1.2" fill="#fff" />
      {/* mouth */}
      {happy
        ? <path d="M 15 34 Q 20 39 25 34" stroke="#8ab0c8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        : <ellipse cx="20" cy="33" rx="3" ry="2" fill="#8ab0c8" opacity="0.55" />
      }
      {/* arms */}
      {happy ? (
        <>
          <path d="M 8 24 Q 2 17 5 13 Q 8 18 8 24" fill="#dce8f0" stroke="#b0c4d8" strokeWidth="0.5" />
          <path d="M 32 24 Q 38 17 35 13 Q 32 18 32 24" fill="#dce8f0" stroke="#b0c4d8" strokeWidth="0.5" />
        </>
      ) : (
        <>
          <path d="M 8 28 Q 2 26 3 21 Q 7 24 8 28" fill="#dce8f0" />
          <path d="M 32 28 Q 38 26 37 21 Q 33 24 32 28" fill="#dce8f0" />
        </>
      )}
    </svg>
  );
}

function VampireSvg({ happy }: { happy: boolean }) {
  const skin = "#d8d0e0";
  return (
    <svg width="40" height="56" viewBox="0 0 40 56" fill="none">
      {/* cape */}
      {happy ? (
        <path d="M 20 23 L 1 10 L 3 46 L 20 50 L 37 46 L 39 10 Z" fill="#180010" />
      ) : (
        <path d="M 20 23 L 5 21 L 3 52 L 20 54 L 37 52 L 35 21 Z" fill="#180010" />
      )}
      {/* widow's peak hair */}
      <path d="M 11 9 Q 20 2 29 9 Q 25 13 20 11 Q 15 13 11 9" fill="#180010" />
      {/* head */}
      <rect x="11" y="8" width="18" height="14" rx="3" fill={skin} />
      {/* eyes */}
      <ellipse cx="15" cy="13" rx="2.5" ry={happy ? 1.5 : 2.5} fill="#6b0000" />
      <ellipse cx="25" cy="13" rx="2.5" ry={happy ? 1.5 : 2.5} fill="#6b0000" />
      <circle  cx="14" cy="12" r="1"  fill="#cc0000" />
      <circle  cx="24" cy="12" r="1"  fill="#cc0000" />
      {/* red collar */}
      <rect x="14" y="21" width="12" height="4" rx="1" fill="#8b0000" />
      {/* mouth + fangs */}
      {happy ? (
        <>
          <path d="M 14 19 Q 20 24 26 19" stroke="#180010" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <polygon points="16,19 18,19 17,23" fill="#fff" />
          <polygon points="22,19 24,19 23,23" fill="#fff" />
        </>
      ) : (
        <>
          <rect x="14" y="19" width="12" height="2" rx="1" fill="#180010" />
          <polygon points="16,19 18,19 17,23" fill="#fff" />
          <polygon points="22,19 24,19 23,23" fill="#fff" />
        </>
      )}
      {/* body under cape */}
      <rect x="15" y="25" width="10" height="13" fill="#0d0014" />
      {/* legs */}
      <rect x="13" y="38" width="6" height="14" rx="2" fill="#180010" />
      <rect x="21" y="38" width="6" height="14" rx="2" fill="#180010" />
      {/* shoes */}
      <rect x="11" y="50" width="9" height="6" rx="2" fill="#0d0010" />
      <rect x="20" y="50" width="9" height="6" rx="2" fill="#0d0010" />
    </svg>
  );
}

function PumpkinSvg({ happy }: { happy: boolean }) {
  return (
    <svg width="40" height="56" viewBox="0 0 40 56" fill="none">
      {/* stem */}
      <rect x="18" y="0" width="5" height="7" rx="2" fill="#2d5a1a" />
      <path d="M 16 4 Q 12 1 10 4 Q 13 6 16 5" fill="#3d7020" />
      {/* pumpkin body */}
      <ellipse cx="20" cy="25" rx="14" ry="18" fill="#d05000" />
      {/* ribs */}
      <path d="M 20 7 Q 24 12 24 25 Q 24 38 20 43" stroke="#a03000" strokeWidth="1.5" fill="none" />
      <path d="M 20 7 Q 16 12 16 25 Q 16 38 20 43" stroke="#a03000" strokeWidth="1.5" fill="none" />
      <path d="M 20 7 Q 28 13 29 25 Q 29 37 22 43" stroke="#a03000" strokeWidth="1"   fill="none" opacity="0.55" />
      <path d="M 20 7 Q 12 13 11 25 Q 11 37 18 43" stroke="#a03000" strokeWidth="1"   fill="none" opacity="0.55" />
      {/* face */}
      {happy ? (
        <>
          <path d="M 12 20 Q 15 17 18 20" stroke="#0a0818" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 22 20 Q 25 17 28 20" stroke="#0a0818" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 11 28 Q 14 34 17 29 Q 20 34 23 29 Q 26 34 29 28"
            stroke="#0a0818" strokeWidth="1.5" fill="#c04000" strokeLinecap="round" />
        </>
      ) : (
        <>
          <polygon points="12,23 16,23 14,19" fill="#0a0818" />
          <polygon points="28,23 24,23 26,19" fill="#0a0818" />
          <path d="M 12 28 Q 14 30 16 28 Q 18 30 20 28 Q 22 30 24 28 Q 26 30 28 28"
            stroke="#0a0818" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* arms */}
      {happy ? (
        <>
          <rect x="2"  y="15" width="10" height="5" rx="2.5" fill="#2d5a1a" transform="rotate(-42 7 18)" />
          <rect x="28" y="15" width="10" height="5" rx="2.5" fill="#2d5a1a" transform="rotate(42 33 18)" />
        </>
      ) : (
        <>
          <rect x="3"  y="24" width="10" height="5" rx="2.5" fill="#2d5a1a" />
          <rect x="27" y="24" width="10" height="5" rx="2.5" fill="#2d5a1a" />
        </>
      )}
      {/* legs */}
      <rect x="14" y="41" width="5" height="12" rx="2" fill="#2d5a1a" />
      <rect x="21" y="41" width="5" height="12" rx="2" fill="#2d5a1a" />
      {/* shoes */}
      <rect x="12" y="51" width="8" height="5" rx="2" fill="#1a3a10" />
      <rect x="20" y="51" width="8" height="5" rx="2" fill="#1a3a10" />
    </svg>
  );
}

function KidSvg({ happy, costume }: { happy: boolean; costume: Costume }) {
  switch (costume) {
    case "witch":   return <WitchSvg   happy={happy} />;
    case "ghost":   return <GhostSvg   happy={happy} />;
    case "vampire": return <VampireSvg happy={happy} />;
    case "pumpkin": return <PumpkinSvg happy={happy} />;
  }
}

// ─── Flag badge (on collected house) ─────────────────────────────────────────

function FlagSvg({ costume }: { costume: Costume }) {
  const flagColor: Record<Costume, string> = {
    witch:   "#5b21b6",
    ghost:   "#6a9ab8",
    vampire: "#6b0000",
    pumpkin: "#c05000",
  };
  const fc = flagColor[costume];
  return (
    <svg width="22" height="30" viewBox="0 0 22 30" fill="none">
      {/* pole */}
      <rect x="3" y="1" width="2" height="28" rx="1" fill="#998aaa" />
      {/* flag body */}
      <rect x="5" y="1" width="15" height="13" rx="1" fill={fc} />
      {/* costume symbol */}
      {costume === "witch" && (
        <>
          <polygon points="12.5,3 8.5,12 16.5,12" fill="#100620" />
          <rect x="7.5" y="11" width="10" height="2.5" rx="0.5" fill="#c084fc" />
        </>
      )}
      {costume === "ghost" && (
        <>
          <path d="M 8.5 8 Q 8.5 2 12.5 2 Q 16.5 2 16.5 8 L 16.5 13 Q 14.5 11 12.5 13 Q 10.5 11 8.5 13 Z"
            fill="#dce8f0" />
          <circle cx="11" cy="7.5" r="1.3" fill="#1a0a2e" />
          <circle cx="14" cy="7.5" r="1.3" fill="#1a0a2e" />
        </>
      )}
      {costume === "vampire" && (
        <>
          <polygon points="10.5,3 12,3 11.25,8" fill="#fff" />
          <polygon points="13,3 14.5,3 13.75,8" fill="#fff" />
          <ellipse cx="12.5" cy="11" rx="3" ry="2" fill="#1a0020" />
          <path d="M 9.5 10.5 Q 7 8 5 9 Q 7.5 11 9.5 10.5" fill="#300040" />
          <path d="M 15.5 10.5 Q 18 8 20 9 Q 17.5 11 15.5 10.5" fill="#300040" />
        </>
      )}
      {costume === "pumpkin" && (
        <>
          <ellipse cx="12.5" cy="8" rx="5" ry="5.5" fill="#d05000" />
          <polygon points="10,7 11.5,7 10.7,4.5" fill="#0a0818" />
          <polygon points="15,7 13.5,7 14.3,4.5" fill="#0a0818" />
          <path d="M 9 9.5 Q 10.5 11.5 12 9.5 Q 13.5 11.5 15 9.5 Q 15.5 10.5 16 9.5"
            stroke="#0a0818" strokeWidth="0.8" fill="none" />
        </>
      )}
    </svg>
  );
}

// ─── Pumpkin icon for candy counter ──────────────────────────────────────────

function PumpkinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <rect x="8" y="0" width="3" height="4" rx="1.5" fill="#2d5a1a" />
      <ellipse cx="9" cy="12" rx="7" ry="6" fill="#d05000" />
      <polygon points="4,11 7,11 5.5,8" fill="#0a0818" />
      <polygon points="14,11 11,11 12.5,8" fill="#0a0818" />
      <path d="M 3 14 Q 6 17 9 14 Q 12 17 15 14" stroke="#0a0818" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

// ─── Halloween shower ─────────────────────────────────────────────────────────

const HALLOWEEN_CHARS = ["🎃", "🦇", "💀", "🕷️", "🌙", "⭐", "🕸️", "🦴"];

interface ShowerPiece { id: number; left: number; delay: number; duration: number; size: number; }
function buildPieces(): ShowerPiece[] {
  return Array.from({ length: 32 }, (_, i) => ({
    id: i,
    left:     ((i * 37 + 11) % 97),
    delay:    ((i * 1237) % 220) / 100,
    duration: 1.8 + ((i * 997) % 200) / 100,
    size:     16 + ((i * 7) % 12),
  }));
}
const SHOWER_PIECES = buildPieces();

function HalloweenShower() {
  return (
    <div className={styles.shower} aria-hidden="true">
      {SHOWER_PIECES.map((p) => (
        <span
          key={p.id}
          className={styles.showerPiece}
          style={{
            left:              `${p.left}%`,
            animationDelay:    `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            fontSize:          `${p.size}px`,
          }}
        >
          {HALLOWEEN_CHARS[p.id % HALLOWEEN_CHARS.length]}
        </span>
      ))}
    </div>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────

export function MaxCandyScene({ snapshot }: { snapshot: Snapshot<MaxCandyState> }) {
  const [costume, setCostume] = useState<Costume>("witch");

  const { input, kidPosition, collectedHouses, totalCandies, phase } = snapshot.state;
  const label  = snapshot.label;
  const isDone = phase === "done";
  const isInit = phase === "init";

  // Latch celebration once done; only reset when a new run begins (init).
  const celebratedRef = useRef(false);
  if (phase === "done") celebratedRef.current = true;
  else if (phase === "init") celebratedRef.current = false;
  const celebrated = celebratedRef.current;
  const n      = input.length;
  const totalWidth = n * CELL_W;

  // Arc paths between consecutive collected houses
  const arcs = useMemo(() => {
    const out = [];
    for (let k = 0; k + 1 < collectedHouses.length; k++) {
      const a = collectedHouses[k];
      const b = collectedHouses[k + 1];
      const x1   = a * CELL_W + CELL_W / 2;
      const x2   = b * CELL_W + CELL_W / 2;
      const yBase = ARC_H - 2;
      const lift  = Math.min(56, 24 + (x2 - x1) * 0.28);
      out.push({ x1, x2, yBase, lift, key: `${a}-${b}` });
    }
    return out;
  }, [collectedHouses]);

  const kidLeft = kidPosition !== null
    ? kidPosition * CELL_W + (CELL_W - KID_W) / 2
    : (CELL_W - KID_W) / 2;

  const statusText = isInit
    ? "choose a costume · press play"
    : isDone
      ? `total: ${totalCandies} candies!`
      : kidPosition !== null
        ? `house #${kidPosition} · +${input[kidPosition]}`
        : "—";

  return (
    <div className="scene">
      <div className={styles.wrap}>

        {/* header */}
        <div className={styles.header}>
          <span className={styles.brand}>👻 MAX·CANDY</span>
          <div className={styles.counter}>
            <PumpkinIcon size={18} />
            <span className={styles.counterVal}>{totalCandies}</span>
            <span className={styles.counterLabel}>candies</span>
          </div>
        </div>

        {/* costume picker */}
        <div className={styles.costumePicker}>
          <span className={styles.costumePickerLabel}>costume:</span>
          {(Object.keys(COSTUME_LABELS) as Costume[]).map((c) => (
            <button
              key={c}
              className={[styles.costumeBtn, costume === c ? styles.costumeBtnActive : ""].join(" ")}
              onClick={() => setCostume(c)}
              title={COSTUME_LABELS[c]}
            >
              {COSTUME_LABELS[c]}
            </button>
          ))}
        </div>

        {/* visualization */}
        <div className={styles.vizScroll}>
          <div className={styles.viz} style={{ width: totalWidth }}>

            {/* arc layer */}
            <div className={styles.arcLayer}>
              <svg
                className={styles.arcSvg}
                width={totalWidth}
                height={ARC_H}
                viewBox={`0 0 ${totalWidth} ${ARC_H}`}
              >
                {arcs.map(({ x1, x2, yBase, lift, key }) => (
                  <g key={key}>
                    <path
                      d={`M ${x1} ${yBase} C ${x1} ${yBase - lift}, ${x2} ${yBase - lift}, ${x2} ${yBase}`}
                      stroke="#ff9500"
                      strokeWidth="2"
                      strokeDasharray="5 3"
                      fill="none"
                      opacity="0.8"
                    />
                    <polygon
                      points={`${x2},${yBase} ${x2 - 5},${yBase - 9} ${x2 + 5},${yBase - 9}`}
                      fill="#ff9500" opacity="0.8"
                    />
                  </g>
                ))}
                {/* candy count labels */}
                {input.map((val, i) => {
                  const cx = i * CELL_W + CELL_W / 2;
                  const isActive    = kidPosition === i;
                  const isCollected = collectedHouses.includes(i);
                  return (
                    <text
                      key={i} x={cx} y={ARC_H - 8}
                      textAnchor="middle"
                      className={[
                        styles.candyLabel,
                        isActive    ? styles.candyLabelActive    : "",
                        isCollected && !isActive ? styles.candyLabelCollected : "",
                      ].join(" ")}
                    >
                      {val}
                    </text>
                  );
                })}
              </svg>

              {/* kid */}
              <div
                className={[styles.kid, celebrated ? styles.kidHappy : ""].join(" ")}
                style={{ left: kidLeft, opacity: isInit ? 0 : 1 }}
              >
                <KidSvg happy={celebrated} costume={costume} />
              </div>
            </div>

            {/* houses */}
            <div className={styles.housesRow}>
              {input.map((_, i) => {
                const isActive    = kidPosition === i;
                const isCollected = collectedHouses.includes(i);
                return (
                  <div key={i} className={styles.houseCell}>
                    <div className={[
                      styles.houseWrap,
                      isActive ? styles.houseWrapActive : "",
                    ].join(" ")}>
                      <HouseSvg active={isActive} collected={isCollected} />
                      {isCollected && (
                        <div className={styles.flagBadge}>
                          <FlagSvg costume={costume} />
                        </div>
                      )}
                    </div>
                    <div className={[styles.houseIdx, isActive ? styles.houseIdxActive : ""].join(" ")}>
                      #{i}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* status bar */}
        <div className={styles.status}>
          <span className={styles.statusLabel}>{label ?? "init"}</span>
          <span className={[styles.statusText, isDone ? styles.statusTextDone : ""].join(" ")}>
            {statusText}
          </span>
        </div>

      </div>

      {celebrated && <HalloweenShower />}
    </div>
  );
}
