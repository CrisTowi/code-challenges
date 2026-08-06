import { useEffect, useMemo, useRef } from "react";
import type { Snapshot } from "@framework";
import {
  ensureAudioRunning,
  playTone,
  playSuccess,
  playFailure,
  valueToFrequency,
  setMuted,
  isMuted,
} from "@framework/audio";
import type { ReorderState } from "./algorithm";
import styles from "./scene.module.css";

const CELL_W = 52;
const CELL_H = 52;
const CELL_GAP = 10;
const ROW_GAP = 110;
const HAND_W = 52;
const HAND_H = 52;
const PADDING = 24;

const PULSE_STAGGER_MS = 90;
const PLACE_TONE_MS = 130;

type CellState =
  | "idle"
  | "settled"
  | "currentTarget"
  | "currentTargetSettled";

function cellLeft(i: number) {
  return PADDING + i * (CELL_W + CELL_GAP);
}

function cellCenterX(i: number) {
  return cellLeft(i) + CELL_W / 2;
}

function layerWidth(n: number) {
  return 2 * PADDING + n * CELL_W + (n - 1) * CELL_GAP;
}

function arrowPathD(x1: number, y1: number, x2: number, y2: number) {
  const cpOffset = Math.min(40, Math.abs(x2 - x1) * 0.4 + 20);
  const cp1x = x1;
  const cp1y = y1 - cpOffset;
  const cp2x = x2;
  const cp2y = y2 + cpOffset;
  return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
}

function arrowHeadD(x: number, y: number, fromX: number, fromY: number) {
  const angle = Math.atan2(y - fromY, x - fromX);
  const size = 6;
  const a1 = angle - Math.PI / 2.2;
  const a2 = angle + Math.PI / 2.2;
  const x1 = x - Math.cos(a1) * size;
  const y1 = y - Math.sin(a1) * size;
  const x2 = x - Math.cos(a2) * size;
  const y2 = y - Math.sin(a2) * size;
  return `M ${x1} ${y1} L ${x} ${y} L ${x2} ${y2} Z`;
}

function cellStateClass(state: CellState): string {
  switch (state) {
    case "settled":
      return styles["cell--settled"];
    case "currentTarget":
      return styles["cell--currentTarget"];
    case "currentTargetSettled":
      return styles["cell--currentTargetSettled"];
    default:
      return styles["cell--idle"];
  }
}

export function ReorderScene({ snapshot }: { snapshot: Snapshot<ReorderState> }) {
  const { arrayA, arrayB, currentStrValue, currentIndexValue, visited } = snapshot.state;
  const label = snapshot.label;
  const n = arrayA.length;
  const width = layerWidth(n);
  const aRowY = PADDING;
  const bRowY = PADDING + CELL_H + ROW_GAP;
  const arrowTopY = aRowY + CELL_H;
  const arrowBottomY = bRowY;

  const isDone = visited.length === n;
  const effTarget = isDone ? -1 : currentIndexValue;
  const effHand = isDone ? "" : currentStrValue;
  const showHand = effTarget >= 0 && label !== "init" && label !== undefined;
  const showArrows = label !== "init" && label !== undefined;
  const handCenterX = showHand ? cellCenterX(effTarget) : 0;
  const handCenterY = (arrowTopY + arrowBottomY) / 2;

  const visitedSet = useMemo(() => new Set(visited), [visited]);
  const isVisited = (i: number) => visitedSet.has(i);

  const cellStateOf = (i: number, row: "A" | "B"): CellState => {
    const isTarget = i === effTarget && row === "A";
    if (isVisited(i) && isTarget) return "currentTargetSettled";
    if (isVisited(i)) return "settled";
    if (isTarget) return "currentTarget";
    return "idle";
  };

  const labelRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (labelRef.current === label) return;
    labelRef.current = label;

    if (label === "foundCycle") {
      void ensureAudioRunning();
      playFailure();
    } else if (label === "swapped") {
      void ensureAudioRunning();
      const freq = valueToFrequency(currentIndexValue, 0, Math.max(1, n - 1));
      playTone(freq, PLACE_TONE_MS);
      if (visited.length === n) {
        playSuccess();
      }
    }
  }, [label, currentIndexValue, n, visited]);

  const visitedCount = visitedSet.size;
  const isFoundCycle = label === "foundCycle" && !isDone;
  const isFindNewStart = label === "findNewStartingPoint";

  return (
    <div className="scene">
      <div className={styles.sceneContent}>
        <div
          className={styles.layout}
          style={
            {
              "--row-h": `${CELL_H}px`,
              "--cell-w": `${CELL_W}px`,
              "--cell-h": `${CELL_H}px`,
              "--layer-w": `${width}px`,
              "--arrow-h": `${ROW_GAP}px`,
              "--hand-w": `${HAND_W}px`,
              "--hand-h": `${HAND_H}px`,
              width: `${width}px`,
            } as React.CSSProperties
          }
        >
          <div
            className={styles.row}
            style={{ left: 0, top: aRowY, width: `${width}px` }}
          >
            <span className={styles.rowLabel}>A</span>
            {arrayA.map((value, i) => {
              const state = cellStateOf(i, "A");
              const blocked = isFoundCycle && i === currentIndexValue;
              return (
                <div
                  key={i}
                  className={`${styles.cell} ${cellStateClass(state)} ${blocked ? styles["cell--blocked"] : ""}`}
                  style={{ left: `${cellLeft(i)}px` }}
                >
                  {value}
                  {isVisited(i) && state !== "currentTargetSettled" && (
                    <span className={styles.settledBadge}>✓</span>
                  )}
                  {state === "currentTarget" && (
                    <span
                      className={styles.settledBadge}
                      style={{ background: "var(--accent)", top: -8, right: -8 }}
                    >
                      ▸
                    </span>
                  )}
                  {state === "currentTargetSettled" && (
                    <span
                      className={styles.settledBadge}
                      style={{ background: "var(--accent)" }}
                    >
                      ✓
                    </span>
                  )}
                  <span className={styles.cellIndex}>[{i}]</span>
                </div>
              );
            })}
          </div>

          <div
            className={styles.arrowLayer}
            style={{ left: 0, top: aRowY + CELL_H, width: `${width}px` }}
          >
            <svg
              width={width}
              height={ROW_GAP}
              viewBox={`0 0 ${width} ${ROW_GAP}`}
              style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
            >
              {showArrows &&
                arrayB.map((dest, i) => {
                  const isActive = i === effTarget && dest !== effTarget;
                  const fromX = cellCenterX(i);
                  const fromY = arrowBottomY - (aRowY + CELL_H);
                  const toX = cellCenterX(dest);
                  const toY = 0;
                  return (
                    <g key={i}>
                      <path
                        className={`${styles.arrow} ${isActive ? styles["arrow--active"] : styles["arrow--idle"]}`}
                        d={arrowPathD(fromX, fromY, toX, toY)}
                      />
                      <path
                        className={`${styles.arrowHead} ${isActive ? styles["arrowHead--active"] : ""}`}
                        d={arrowHeadD(toX, toY, fromX, fromY)}
                      />
                    </g>
                  );
                })}
            </svg>

            {isFindNewStart &&
              visited.map((cellIdx, k) => (
                <div
                  key={`pulse-${cellIdx}-${k}`}
                  className={styles.pulseRing}
                  style={{
                    top: `${aRowY - 4}px`,
                    left: `${cellLeft(cellIdx) - 4}px`,
                    width: `${CELL_W + 8}px`,
                    height: `${CELL_H + 8}px`,
                    animationDelay: `${k * PULSE_STAGGER_MS}ms`,
                  }}
                />
              ))}

            {showHand && (
              <div
                className={`${styles.hand} ${effHand === "" ? styles["hand--empty"] : ""}`}
                style={{ left: `${handCenterX}px`, top: `${handCenterY}px` }}
                title="In hand"
              >
                <span key={effHand} className={styles.handValue}>
                  {effHand}
                </span>
                <span className={styles.handLabel}>hand</span>
              </div>
            )}
          </div>

          <div
            className={styles.row}
            style={{ left: 0, top: bRowY, width: `${width}px` }}
          >
            <span className={styles.rowLabel}>B</span>
            {arrayB.map((value, i) => {
              const state = cellStateOf(i, "B");
              return (
                <div
                  key={i}
                  className={`${styles.cell} ${cellStateClass(state)}`}
                  style={{ left: `${cellLeft(i)}px` }}
                >
                  {value}
                  {isVisited(i) && <span className={styles.settledBadge}>✓</span>}
                  <span className={styles.cellIndex}>[{i}]</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.footer}>
          <span className={styles.footer__label}>{label ?? "—"}</span>
          <span className={`${styles.footer__chip} ${styles["footer__chip--carrier"]}`}>
            hand {effHand === "" ? "—" : effHand}
          </span>
          <span className={`${styles.footer__chip} ${styles["footer__chip--accent"]}`}>
            target [{effTarget}]
          </span>
          <span className={`${styles.footer__chip} ${styles["footer__chip--settled"]}`}>
            ✓ {visitedCount}/{n}
          </span>
        </div>
      </div>
    </div>
  );
}

export { setMuted, isMuted };
