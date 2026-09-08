import { useEffect, useRef } from "react";
import type { Snapshot } from "@framework";
import { ensureAudioRunning, playTone, playSuccess } from "@framework/audio";
import type { MinMovesState, RotationDirection } from "./algorithm";
import styles from "./scene.module.css";

const DIAL_H = 76;

function buildStrip(initial: number, direction: RotationDirection): number[] {
  const strip: number[] = [];
  for (let k = 0; k < 10; k++) {
    const d = direction === "up"
      ? (initial + k) % 10
      : (initial - k + 10) % 10;
    strip.push(d);
  }
  return strip;
}

function stripPosition(initial: number, current: number, direction: RotationDirection): number {
  return direction === "up"
    ? (current - initial + 10) % 10
    : (initial - current + 10) % 10;
}

interface DialProps {
  initial: number;
  current: number;
  goal: number;
  direction: RotationDirection;
  reached: boolean;
  justReached: boolean;
}

function Dial({ initial, current, goal, direction, reached, justReached }: DialProps) {
  const strip = buildStrip(initial, direction);
  const position = stripPosition(initial, current, direction);
  const translateY = -position * DIAL_H;

  return (
    <div className={styles.dial}>
      <div
        className={[
          styles.dialFrame,
          reached ? styles["dialFrame--reached"] : "",
          justReached ? styles["dialFrame--justReached"] : "",
        ].join(" ")}
      >
        <div
          className={styles.strip}
          style={{ transform: `translateY(${translateY}px)` }}
        >
          {strip.map((d, idx) => (
            <div
              key={idx}
              className={[
                styles.cell,
                d === goal ? styles["cell--goal"] : "",
                d === current ? styles["cell--active"] : "",
              ].join(" ")}
            >
              {d}
            </div>
          ))}
        </div>
      </div>
      {reached && (
        <div className={styles.checkmark} aria-label="reached">
          ✓
        </div>
      )}
      <div className={styles.dialGoal}>{goal}</div>
    </div>
  );
}

const CONFETTI_COLORS = ["#ff79c6", "#8be9fd", "#50fa7b", "#ffb86c", "#f1fa8c", "#bd93f9"];

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  rotate: number;
  size: number;
}

function buildConfetti(): ConfettiPiece[] {
  const pieces: ConfettiPiece[] = [];
  for (let i = 0; i < 60; i++) {
    pieces.push({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.4,
      duration: 1.6 + Math.random() * 1.6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotate: Math.random() * 360,
      size: 6 + Math.random() * 8,
    });
  }
  return pieces;
}

function Confetti() {
  const pieces = buildConfetti();
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

export function MinMovesScene({ snapshot }: { snapshot: Snapshot<MinMovesState> }) {
  const { initial, goal, current, total, directions } = snapshot.state;
  const label = snapshot.label;

  const reached = initial.split("").map((_, i) => current[i] === goal[i]);
  const allReached = reached.every(Boolean);

  const prevCurrentRef = useRef<string | null>(null);
  const prev = prevCurrentRef.current;
  const justReachedIdx = prev === null
    ? -1
    : initial.split("").findIndex((_, i) =>
        current[i] === goal[i] && prev[i] !== goal[i],
      );
  useEffect(() => {
    prevCurrentRef.current = current;
  }, [current]);

  const prevLabelRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (label === prevLabelRef.current) return;
    prevLabelRef.current = label;
    if (!label) return;
    void ensureAudioRunning();
    if (label.startsWith("rotate-")) {
      playTone(660, 50);
    } else if (justReachedIdx >= 0) {
      playTone(1046.5, 140);
    } else if (allReached) {
      playSuccess();
    }
  }, [label, justReachedIdx, allReached]);

  const statusText = !label || label === "init"
    ? "ready"
    : allReached
      ? "✓ unlocked"
      : label.startsWith("rotate-")
        ? `rotating dial ${Number(label.split("-")[1])}`
        : "running";

  return (
    <div className="scene">
      <div
        className={[
          styles.lockBody,
          allReached ? styles["lockBody--unlocked"] : "",
        ].join(" ")}
      >
        <div className={styles.lockHeader}>
          <span className={styles.lockBrand}>MIN·MOVES</span>
          <span className={styles.lockCombo}>
            <span className={styles.lockComboLabel}>GOAL</span>
            <span className={styles.lockComboValue}>{goal}</span>
          </span>
        </div>

        <div className={styles.dials}>
          {initial.split("").map((d, i) => (
            <Dial
              key={i}
              initial={parseInt(d, 10)}
              current={parseInt(current[i], 10)}
              goal={parseInt(goal[i], 10)}
              direction={directions[i] ?? "up"}
              reached={reached[i]}
              justReached={justReachedIdx === i}
            />
          ))}
        </div>

        <div className={styles.lockFooter}>
          <div className={styles.legendRow}>
            <span className={styles.legendChip}>
              <span className={styles.legendKey}>initial</span>
              <span className={styles.legendValue}>{initial}</span>
            </span>
          </div>
          <div className={styles.totalChip}>
            moves <strong>{total}</strong>
          </div>
        </div>
      </div>

      <div className={styles.statusBar}>
        <span className={styles.statusLabel}>{label ?? "init"}</span>
        <span className={styles.statusText}>{statusText}</span>
      </div>

      {allReached && <Confetti />}
    </div>
  );
}