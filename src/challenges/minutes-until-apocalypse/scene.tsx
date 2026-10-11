import { useEffect, useMemo, useRef, useState } from "react";
import type { Snapshot } from "@framework";
import {
  ensureAudioRunning,
  playFailure,
  playSundayFanfare,
  playTone,
} from "@framework/audio";
import type { MinutesUntilApocalypseState } from "./algorithm";
import styles from "./scene.module.css";

const CELL_SIZE = 58;
const GAP = 6;
const TICK_TONE_HZ = 1320;
const TICK_TONE_MS = 32;

type CellKind = "wall" | "human" | "zombie-active" | "zombie-spent";

function kindOf(value: number): CellKind {
  switch (value) {
    case 1:
      return "human";
    case 2:
      return "zombie-active";
    case 3:
      return "zombie-spent";
    default:
      return "wall";
  }
}

function iconOf(kind: CellKind): string {
  switch (kind) {
    case "human":
      return "\u{1F9D1}";
    case "zombie-active":
    case "zombie-spent":
      return "\u{1F9DF}";
    case "wall":
      return "\u{1F9F1}";
  }
}

const CONFETTI_COLORS = ["#ff79c6", "#8be9fd", "#50fa7b", "#ffb86c", "#f1fa8c", "#bd93f9"];

function buildConfetti() {
  return Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.4,
    duration: 1.8 + Math.random() * 1.6,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rotate: Math.random() * 360,
    size: 6 + Math.random() * 8,
  }));
}

function Confetti() {
  const [pieces] = useState(buildConfetti);
  return (
    <div className={styles.confetti} aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className={styles.confettiPiece}
          style={{
            left: `${p.left}%`,
            animationDelay: `-${p.delay}s`,
            animationDuration: `${p.duration}s`,
            background: p.color,
            width: `${p.size}px`,
            height: `${p.size * 0.5}px`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

const ASH_COLORS = [
  "#9aa0c6",
  "#666a91",
  "#3b3f6b",
  "rgba(255, 85, 85, 0.85)",
  "rgba(255, 121, 198, 0.7)",
];

function buildDoomParticles() {
  return Array.from({ length: 70 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3.5,
    duration: 2.4 + Math.random() * 2.6,
    color: ASH_COLORS[i % ASH_COLORS.length],
    rotate: Math.random() * 360,
    size: 3 + Math.random() * 6,
    drift: -22 + Math.random() * 44,
  }));
}

function DoomOverlay() {
  const [pieces] = useState(buildDoomParticles);
  return (
    <div className={styles.doomOverlay} aria-hidden="true">
      <div className={styles.doomFlash} />
      <div className={styles.doomVignette} />
      <div className={styles.doomScanlines} />
      {pieces.map((p) => (
        <span
          key={p.id}
          className={styles.ashParticle}
          style={{
            left: `${p.left}%`,
            animationDelay: `-${p.delay}s`,
            animationDuration: `${p.duration}s`,
            background: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            ["--drift" as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

export function MinutesUntilApocalypseScene({ snapshot }: { snapshot: Snapshot<MinutesUntilApocalypseState> }) {
  const { town, minutes } = snapshot.state;
  const label = snapshot.label;

  const width = town[0]?.length ?? 1;
  const height = town.length;

  const isInit = label === "init" || label === undefined;
  const isTick = label === "tick";
  const isSurvived = label === "survived";
  const isDone = label === "done";

  const labelRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (label === labelRef.current) return;
    labelRef.current = label;
    if (!label) return;
    void ensureAudioRunning();
    if (isTick) {
      playTone(TICK_TONE_HZ, TICK_TONE_MS);
    } else if (isSurvived) {
      playSundayFanfare();
    } else if (isDone) {
      playFailure();
    }
  }, [label, isTick, isSurvived, isDone]);

  const prevSnapshotRef = useRef<Snapshot<MinutesUntilApocalypseState> | null>(null);
  const newlyBitten = useMemo(() => {
    const prev = prevSnapshotRef.current;
    prevSnapshotRef.current = snapshot;
    const set = new Set<string>();
    if (!prev) return set;
    const prevTown = prev.state.town;
    for (let y = 0; y < town.length; y++) {
      for (let x = 0; x < town[y].length; x++) {
        const before = prevTown[y]?.[x];
        const after = town[y][x];
        if (before === 1 && (after === 2 || after === 3)) {
          set.add(`${x},${y}`);
        }
      }
    }
    return set;
  }, [snapshot, town]);

  const counts = useMemo(() => {
    let human = 0;
    let active = 0;
    let spent = 0;
    let wall = 0;
    for (const row of town) {
      for (const v of row) {
        if (v === 1) human += 1;
        else if (v === 2) active += 1;
        else if (v === 3) spent += 1;
        else wall += 1;
      }
    }
    return { human, active, spent, wall };
  }, [town]);

  const survived = isSurvived || minutes < 0;
  const apocalypseDone = isDone;
  const resultValue = survived ? -1 : minutes;

  const statusText = isInit
    ? "ready · press play"
    : survived
      ? "★ humans survived"
      : apocalypseDone
        ? `apocalypse in ${minutes} minute${minutes === 1 ? "" : "s"}`
        : isTick
          ? `minute ${String(minutes).padStart(2, "0")} elapsed`
          : "running";

  return (
    <div className="scene">
      <div className={styles.sceneContent}>
        <div className={styles.brand}>
          <span className={styles.brand__title}>☠ zombie outbreak</span>
          <span className={styles.brand__sub}>▸ minutes until apocalypse</span>
        </div>

        <div className={styles.statusRow}>
          <div className={styles.clock}>
            <div
              className={[
                styles.clockFace,
                survived ? styles["clockFace--survived"] : "",
                apocalypseDone ? styles["clockFace--done"] : "",
              ].join(" ")}
            >
              <span className={styles.clockMinute}>
                {survived ? "★" : String(minutes)}
              </span>
            </div>
            <span className={styles.clockLabel}>
              {survived ? "survived" : apocalypseDone ? "apocalypse" : `minute${minutes === 1 ? "" : "s"}`}
            </span>
          </div>

          <div className={styles.legend}>
            <span className={`${styles.chip} ${styles["chip--human"]}`}>
              <span className={styles.chipIcon} aria-hidden="true">{iconOf("human")}</span>human
            </span>
            <span className={`${styles.chip} ${styles["chip--zombie"]}`}>
              <span className={styles.chipIcon} aria-hidden="true">{iconOf("zombie-active")}</span>zombie
            </span>
            <span className={`${styles.chip} ${styles["chip--wall"]}`}>
              <span className={styles.chipIcon} aria-hidden="true">{"\u{1F9F1}"}</span>wall
            </span>
          </div>
        </div>

        <div
          className={[
            styles.gridWrap,
            survived ? styles["gridWrap--survived"] : "",
            apocalypseDone ? styles["gridWrap--done"] : "",
          ].join(" ")}
        >
          <div
            className={styles.grid}
            style={{ gridTemplateColumns: `repeat(${width}, ${CELL_SIZE}px)` }}
          >
            {town.map((row, y) =>
              row.map((cell, x) => {
                const kind = kindOf(cell);
                const icon = iconOf(kind);
                const isJustBitten = newlyBitten.has(`${x},${y}`);
                const cls = [styles.cell, styles[`cell--${kind}`]];
                if (isJustBitten && (kind === "zombie-active" || kind === "zombie-spent")) {
                  cls.push(styles["cell--justBitten"]);
                }
                return (
                  <div
                    key={`${x}-${y}`}
                    className={cls.join(" ")}
                    style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
                  >
                    {icon && <span className={styles.cellIcon}>{icon}</span>}
                    <span className={styles.cellCoord}>{x},{y}</span>
                  </div>
                );
              }),
            )}
          </div>
          {apocalypseDone && <DoomOverlay />}
        </div>

        <div className={styles.footer}>
          <span className={styles.footer__label}>{label ?? "—"}</span>
          <span className={`${styles.footer__chip} ${styles["footer__chip--sort"]}`}>
            🧑 {counts.human}
          </span>
          <span className={`${styles.footer__chip} ${styles["footer__chip--active"]}`}>
            🧟 {counts.active + counts.spent}
          </span>
          <span className={styles.footer__chip}>🧱 {counts.wall}</span>
          <span
            className={[
              styles.footer__chip,
              survived ? styles["footer__chip--success"] : styles["footer__chip--accent"],
            ].join(" ")}
          >
            {statusText}
          </span>
          <span className={styles.footer__chip}>
            grid {width}×{height}
          </span>
          {survived ? (
            <span className={`${styles.footer__chip} ${styles["footer__chip--success"]}`}>
              result: -1
            </span>
          ) : apocalypseDone ? (
            <span className={`${styles.footer__chip} ${styles["footer__chip--active"]}`}>
              result: {resultValue}
            </span>
          ) : null}
        </div>
      </div>

      {survived && <Confetti />}
    </div>
  );
}
