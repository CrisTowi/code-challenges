import { useEffect, useRef, useState } from "react";
import type { Snapshot } from "@framework";
import { playTone } from "@framework/audio";
import type { TrimState } from "./algorithm";

const CELL_WIDTH = 48;
const CELL_HEIGHT = 64;
const PACMAN_SIZE = 32;
const SCENE_HEIGHT = 320;
const WAKA_NOTE_A = 440;
const WAKA_NOTE_B = 660;
const APPLY_NOTE = 880;

function playWaka(isLeft: boolean) {
  const a = isLeft ? WAKA_NOTE_A : WAKA_NOTE_B;
  const b = isLeft ? WAKA_NOTE_B : WAKA_NOTE_A;
  playTone(a, 55);
  window.setTimeout(() => playTone(b, 55), 55);
}

function Pacman({ faceLeft = false }: { faceLeft?: boolean }) {
  const [mouthOpen, setMouthOpen] = useState(true);
  useEffect(() => {
    const t = window.setInterval(() => setMouthOpen((o) => !o), 120);
    return () => window.clearInterval(t);
  }, []);

  const mouthPath = mouthOpen
    ? "M16 16 L30 10 L30 22 Z"
    : "M16 16 L31 15 L31 17 Z";

  return (
    <svg
      width={PACMAN_SIZE}
      height={PACMAN_SIZE}
      viewBox="0 0 32 32"
      style={{
        display: "block",
        transform: faceLeft ? "scaleX(-1)" : undefined,
        filter: "drop-shadow(0 0 4px rgba(255, 235, 59, 0.6))",
      }}
    >
      <circle cx="16" cy="16" r="15" fill="#ffeb3b" stroke="#000" strokeWidth="1.5" />
      <path d={mouthPath} fill="#000" />
      <circle cx="20" cy="11" r="1.8" fill="#000" />
    </svg>
  );
}

export function TrimScene({
  snapshot,
}: {
  snapshot: Snapshot<TrimState>;
}) {
  const { str, left, right, trimType } = snapshot.state;
  const label = snapshot.label;

  const shrunkLeft =
    label === "applyLeadingTrim" ||
    label === "moveRightPointer" ||
    label === "applyTrailingTrim";
  const shrunkRight = label === "applyTrailingTrim";
  const originalLength =
    str.length + (shrunkLeft ? left : 0) + (shrunkRight ? right : 0);

  const effectiveStr = str.slice(
    shrunkLeft ? 0 : left,
    shrunkRight ? str.length : str.length - right,
  );

  const cells = Array.from({ length: originalLength }, (_, idx) => {
    const origChar = shrunkLeft
      ? idx < left
        ? " "
        : idx < left + str.length
          ? str[idx - left]
          : " "
      : str[idx];
    const isSpace = origChar === " ";
    const eatenLeft = idx < left;
    const eatenRight = idx >= originalLength - right;
    return { idx, char: origChar, isSpace, eatenLeft, eatenRight };
  });

  const totalSpaces = cells.filter((c) => c.isSpace).length;
  const eatenSpaces = left + right;

  const showLeadingPacman =
    trimType !== "trailing" && label === "moveLeftPointer";
  const showTrailingPacman =
    trimType !== "leading" && label === "moveRightPointer";
  const leadingPacmanIndex = left - 1;
  const trailingPacmanIndex = originalLength - right;

  const prevLabelRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (label === prevLabelRef.current) return;
    prevLabelRef.current = label;
    if (label === "moveLeftPointer") playWaka(true);
    else if (label === "moveRightPointer") playWaka(false);
    else if (label === "applyLeadingTrim" || label === "applyTrailingTrim") {
      playTone(APPLY_NOTE, 140);
    }
  }, [snapshot, label]);

  const pacmanLeft = (idx: number) =>
    idx * CELL_WIDTH + CELL_WIDTH / 2 - PACMAN_SIZE / 2;

  const trailingInBounds =
    trailingPacmanIndex >= 0 && trailingPacmanIndex < originalLength;
  const leadingInBounds =
    leadingPacmanIndex >= 0 && leadingPacmanIndex < originalLength;

  return (
    <div className="scene">
      <div
        style={{
          position: "relative",
          width: "100%",
          height: SCENE_HEIGHT,
          paddingBottom: "3rem",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 16,
            fontFamily: "var(--font-display)",
            fontSize: "0.55rem",
            color: "var(--accent-2)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            textShadow: "0 0 6px rgba(139, 233, 253, 0.5)",
          }}
        >
          eaten {eatenSpaces} / {totalSpaces}
        </div>

        <div
          style={{
            position: "absolute",
            top: 56,
            left: 16,
            right: 16,
            height: CELL_HEIGHT,
            display: "flex",
            gap: 0,
            border: "2px solid var(--border-bright)",
            background: "rgba(0, 0, 30, 0.6)",
            boxShadow: "inset 0 0 12px rgba(111, 120, 196, 0.3)",
            overflow: "hidden",
          }}
        >
          {cells.map((c) => (
            <div
              key={c.idx}
              style={{
                width: CELL_WIDTH,
                height: CELL_HEIGHT,
                position: "relative",
                borderRight:
                  c.idx < cells.length - 1
                    ? "1px solid rgba(74, 82, 144, 0.5)"
                    : "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {!c.isSpace && (
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.55rem",
                    color: "var(--text)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {c.char}
                </span>
              )}
              {c.isSpace && (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    boxShadow:
                      "0 0 6px var(--accent), 0 0 12px rgba(255, 121, 198, 0.5)",
                    opacity: !c.eatenLeft && !c.eatenRight ? 1 : 0,
                    transform:
                      !c.eatenLeft && !c.eatenRight ? "scale(1)" : "scale(0.4)",
                    transition: "opacity 150ms ease, transform 150ms ease",
                  }}
                />
              )}
            </div>
          ))}

          {showLeadingPacman && leadingInBounds && (
            <div
              style={{
                position: "absolute",
                left: pacmanLeft(leadingPacmanIndex),
                top: CELL_HEIGHT / 2 - PACMAN_SIZE / 2,
                transition:
                  "left 350ms cubic-bezier(0.65, 0, 0.35, 1)",
                pointerEvents: "none",
              }}
            >
              <Pacman />
            </div>
          )}
          {showTrailingPacman && trailingInBounds && (
            <div
              style={{
                position: "absolute",
                left: pacmanLeft(trailingPacmanIndex),
                top: CELL_HEIGHT / 2 - PACMAN_SIZE / 2,
                transition:
                  "left 350ms cubic-bezier(0.65, 0, 0.35, 1)",
                pointerEvents: "none",
              }}
            >
              <Pacman faceLeft />
            </div>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "var(--font-display)",
            fontSize: "0.5rem",
            color: "var(--text-dim)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            borderTop: "2px dashed var(--border)",
            padding: "0.5rem 1rem",
            gap: "1rem",
          }}
        >
          <span style={{ flex: "0 0 auto" }}>{label ?? "—"}</span>
          <span
            style={{
              flex: "1 1 auto",
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              color: "var(--accent-2)",
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            result: "{effectiveStr}"
          </span>
          <span style={{ flex: "0 0 auto", color: "var(--accent)" }}>
            {trimType}
          </span>
        </div>
      </div>
    </div>
  );
}