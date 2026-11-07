// Original pixel-art hero, and HUD pieces for the elapsed-minutes scene.

// ─── pixel sprite helpers ─────────────────────────────────────────────────────

const PALETTE: Record<string, string> = {
  K: "#1a1028", // outline
  H: "#9a3412", // hood
  h: "#6b210b", // hood shade
  S: "#f2c79b", // skin
  E: "#1a1028", // eyes
  T: "#16a34a", // tunic
  t: "#14532d", // tunic shade
  B: "#78350f", // belt
  G: "#fbbf24", // gold
  L: "#d6c7a1", // trousers
  O: "#4a2a10", // boots
  W: "#e5e7eb", // blade
  D: "#7e22ce", // shield
  C: "#f8fafc", // shield center
  F: "#7dd3fc", // flute
  R: "#ef4444", // heart
  r: "#3f1d2b", // empty heart
};

type Layer = { y: number; rows: string[] };

const HERO_BASE: string[] = [
  "......KKK.........", // elf hat, tip drooping left
  "....KKTTTK........",
  "...KTTTTTTK.......",
  "..KTTKKTTTK.......",
  "..KTK..KTTTK......",
  ".KTK...KTTTK......",
  "..K...KTTTTTK.....",
  "...KtttttttttK....",
  "....KhSSSSShK.....",
  "....KSESSSESK.....",
  "....KSSSSSSSK.....",
  ".....KSSSSSK......",
  "....KTTTGTTTK.....",
  "....KTTTTTTTK.....",
  "....KBBBGBBBK.....",
  "....KTTTTTTTK.....",
  "....KtTTTTTtK.....",
  ".....KLL.LLK......",
  ".....KLL.LLK......",
  ".....KOO.OOK......",
  "....KOOO.OOOK.....",
  "....KKKK.KKKK.....",
];

export type HeroPose = "guard" | "flute" | "scratch" | "shield";

const HERO_POSES: Record<HeroPose, Layer[]> = {
  guard: [
    {
      y: 0,
      rows: [
        "..............W...",
        "..............W...",
        "..............W...",
        "..............W...",
        "..............W...",
        "..............W...",
        "..............W...",
        ".............DDD..",
        ".KDDK........KSK..",
        "KDCDDK......KTK...",
        "KDCCDK......KK....",
        "KDCDDK............",
        ".KDDK.............",
        "..KK..............",
      ],
    },
  ],
  flute: [
    {
      y: 5,
      rows: [
        "....KShSShSK......", // eyes closed
        "..................",
        ".........FFFFFFF..",
        "...........KSKSK..",
        "...........KTTK...",
        "..........KTK.....",
      ],
    },
    { y: 9, rows: ["..KDDK", ".KDCDK", ".KDDK.", "..KK.."] },
  ],
  scratch: [
    {
      y: 2,
      rows: [
        "............KSK...",
        "............KSK...",
        "............KTK...",
        "............KTK...",
        "............KTK...",
        "............KTK...",
        "..KDDK............",
        ".KDCDDK...........",
        ".KDCCDK...........",
        ".KDCDDK...........",
        "..KDDK............",
        "...KK.............",
      ],
    },
  ],
  shield: [
    {
      y: 2,
      rows: [
        "............KDDK..",
        "...........KDCCDK.",
        "...........KDCDDK.",
        "...........KDCCDK.",
        "...........KDCDDK.",
        "...........KDDDDK.",
        "..........KTKDDK..",
        "..........KTK.KK..",
        "...W......KK......",
        "..KSK.............",
        "..KK..............",
      ],
    },
  ],
};

function compose(base: string[], layers: Layer[]): string[][] {
  const grid = base.map((r) => r.split(""));
  for (const { y, rows } of layers) {
    rows.forEach((row, dy) => {
      row.split("").forEach((c, x) => {
        if (c !== "." && grid[y + dy] && x < grid[y + dy].length) grid[y + dy][x] = c;
      });
    });
  }
  return grid;
}

function PixelGrid({ grid, px, className }: { grid: string[][]; px: number; className?: string }) {
  const h = grid.length;
  const w = Math.max(...grid.map((r) => r.length));
  return (
    <svg className={className} width={w * px} height={h * px} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges">
      {grid.flatMap((row, y) =>
        row.map((c, x) => (c === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={PALETTE[c]} />)),
      )}
    </svg>
  );
}

// Rows the hat adds above the original head; pose layers are authored without it.
const HAT_ROWS = 4;

export function HeroSprite({ pose, px = 3 }: { pose: HeroPose; px?: number }) {
  const layers = HERO_POSES[pose].map((l) => ({ ...l, y: l.y + HAT_ROWS }));
  return <PixelGrid grid={compose(HERO_BASE, layers)} px={px} />;
}

// ─── hearts ───────────────────────────────────────────────────────────────────

const HEART = [".RR.RR.", "RRRRRRR", "RRRRRRR", ".RRRRR.", "..RRR..", "...R..."];

function heartGrid(fill: 0 | 1 | 2): string[][] {
  return HEART.map((row) =>
    row.split("").map((c, x) => (c === "." ? "." : fill === 2 || (fill === 1 && x <= 3) ? "R" : "r")),
  );
}

/** Three hearts; `halves` goes from 6 (full) to 0 (empty). */
export function Hearts({ halves }: { halves: number }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[0, 1, 2].map((i) => {
        const left = halves - i * 2;
        const fill = (left >= 2 ? 2 : left === 1 ? 1 : 0) as 0 | 1 | 2;
        return <PixelGrid key={i} grid={heartGrid(fill)} px={3} />;
      })}
    </div>
  );
}

// ─── gem counter icon ─────────────────────────────────────────────────────────

const GEM = ["..KKK..", ".KGWGK.", "KGGWGGK", "KGGGGGK", ".KGGGK.", "..KGK..", "...K..."];

export function GemIcon() {
  return <PixelGrid grid={GEM.map((r) => r.split(""))} px={3} />;
}

// ─── countdown arc gauge ──────────────────────────────────────────────────────

/** Half-ring that empties as time runs out (`left` goes 1 → 0). */
export function ArcGauge({ left }: { left: number }) {
  const r = 30;
  const len = Math.PI * r;
  const clamped = Math.max(0, Math.min(1, left));
  return (
    <svg width="76" height="44" viewBox="0 0 76 44" fill="none">
      <path d={`M 8 38 A ${r} ${r} 0 0 1 68 38`} stroke="#1a1028" strokeWidth="9" strokeLinecap="round" />
      <path
        d={`M 8 38 A ${r} ${r} 0 0 1 68 38`}
        stroke={clamped > 0.3 ? "#fbbf24" : "#ef4444"}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${len * clamped} ${len}`}
        style={{ transition: "stroke-dasharray 0.6s ease, stroke 0.3s ease" }}
      />
      {/* sun at the start, moon at the end */}
      <circle cx="8" cy="38" r="4" fill="#fde68a" stroke="#1a1028" />
      <circle cx="68" cy="38" r="4" fill="#e2b867" stroke="#1a1028" />
      <circle cx="66.5" cy="37" r="1" fill="#1a1028" />
    </svg>
  );
}
