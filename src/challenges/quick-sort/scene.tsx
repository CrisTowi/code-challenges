import { useEffect, useRef, useState } from "react";
import type { Snapshot } from "@framework";
import {
  playNoteForValue,
  playTone,
  ensureAudioRunning,
  setMuted,
  isMuted,
} from "@framework/audio";
import type { QuickSortState, Bar } from "./algorithm";

const BAR_GAP = 6;
const SCENE_HEIGHT = 320;
const TOP_PADDING_PCT = 14;
const PREVIEW_STEP_MS = 700;

export function QuickSortScene({
  snapshot,
  playbackSpeed = 1,
}: {
  snapshot: Snapshot<QuickSortState>;
  playbackSpeed?: number;
}) {
  const { bars, pivotId, pivotValue, partitionRange, j, sortedIds, callStack, phase } = snapshot.state;
  const label = snapshot.label;
  const max = Math.max(...bars.map((b) => b.value), 1);
  const min = Math.min(...bars.map((b) => b.value), 0);
  const n = bars.length;

  const sortedSet = new Set(sortedIds);

  const [previewingId, setPreviewingId] = useState<number | null>(null);
  const previewTimers = useRef<number[]>([]);

  // Audio: compare plays the candidate, pivot-placed plays a longer tone on the pivot.
  useEffect(() => {
    if (phase === "compare" && j != null && bars[j]) {
      void ensureAudioRunning();
      playNoteForValue(bars[j].value, min, max);
    } else if (phase === "pivot-placed" && pivotValue != null) {
      void ensureAudioRunning();
      playTone(valueToFreq(pivotValue, min, max), 360);
    }
  }, [snapshot, phase, j, bars, pivotValue, min, max]);

  useEffect(() => {
    return () => {
      previewTimers.current.forEach((t) => window.clearTimeout(t));
      previewTimers.current = [];
    };
  }, []);

  const playScale = () => {
    previewTimers.current.forEach((t) => window.clearTimeout(t));
    previewTimers.current = [];
    void ensureAudioRunning();
    const sorted = [...bars].sort((a, b) => a.value - b.value);
    const step = Math.max(15, PREVIEW_STEP_MS / playbackSpeed);
    sorted.forEach((bar, k) => {
      const timer = window.setTimeout(() => {
        setPreviewingId(bar.id);
        playNoteForValue(bar.value, min, max);
      }, k * step);
      previewTimers.current.push(timer);
    });
    const endTimer = window.setTimeout(() => {
      setPreviewingId(null);
    }, sorted.length * step + 100);
    previewTimers.current.push(endTimer);
  };

  // Partition range background span (lo..hi inclusive).
  const rangeStyle =
    partitionRange != null
      ? {
          left: `calc((${partitionRange[0]} * 100% + ${partitionRange[0] * BAR_GAP}px) / ${n})`,
          width: `calc(((${partitionRange[1] - partitionRange[0] + 1}) * 100% + ${(partitionRange[1] - partitionRange[0] + 1) * BAR_GAP}px) / ${n})`,
        }
      : null;

  const rangeLabel =
    partitionRange != null ? `[${partitionRange[0]}..${partitionRange[1]}]` : "—";
  const depth = callStack.length;
  const sortedCount = sortedIds.length;

  return (
    <div className="scene">
      <div
        style={{
          position: "relative",
          width: "100%",
          height: SCENE_HEIGHT,
          paddingBottom: "2.5rem",
        }}
      >
        {/* Partition range backdrop */}
        {rangeStyle && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: "2.5rem",
              ...rangeStyle,
              height: `calc(100% - 2.5rem - 28px)`,
              background: "rgba(255, 121, 198, 0.08)",
              border: "2px dashed rgba(255, 121, 198, 0.45)",
              borderRadius: 2,
              pointerEvents: "none",
              transition: "left 350ms cubic-bezier(0.65, 0, 0.35, 1), width 350ms cubic-bezier(0.65, 0, 0.35, 1)",
            }}
          />
        )}

        {bars.map((bar: Bar, idx: number) => {
          const isPivot = pivotId === bar.id;
          const isScan = j === idx && phase === "compare";
          const isSorted = sortedSet.has(bar.id);
          const isPreviewing = previewingId === bar.id;
          const colorClass = isPreviewing
            ? "bar--preview"
            : isPivot
              ? "bar--pivot"
              : isScan
                ? "bar--scan"
                : isSorted
                  ? "bar--sorted"
                  : "bar--default";

          const availableHeight = SCENE_HEIGHT - 40;
          const maxBarPx = availableHeight * (1 - TOP_PADDING_PCT / 100);
          const barHeightPx = (bar.value / max) * maxBarPx;

          return (
            <div
              key={bar.id}
              className={`bar ${colorClass}`}
              style={{
                position: "absolute",
                bottom: "2.5rem",
                left: `calc((${idx} * 100% + ${idx * BAR_GAP}px) / ${n})`,
                width: `calc((100% - ${(n - 1) * BAR_GAP}px) / ${n})`,
                height: `${barHeightPx}px`,
                transition:
                  "left 350ms cubic-bezier(0.65, 0, 0.35, 1), background 150ms ease, box-shadow 150ms ease",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                color: "#000",
                fontFamily: "var(--font-display)",
                fontSize: "0.6rem",
                paddingBottom: "0.4rem",
                border: "2px solid #000",
                boxShadow: "inset 0 -8px 0 rgba(0,0,0,0.15)",
              }}
            >
              {bar.value}
            </div>
          );
        })}

        {/* Pivot marker (▼) above the pivot bar */}
        {pivotId != null && (() => {
          const pivotIdx = bars.findIndex((b) => b.id === pivotId);
          if (pivotIdx < 0) return null;
          return (
            <div
              aria-hidden
              style={{
                position: "absolute",
                bottom: `calc(2.5rem + 100% - 28px - 14px)`,
                left: `calc((${pivotIdx} * 100% + ${pivotIdx * BAR_GAP}px) / ${n})`,
                width: `calc((100% - ${(n - 1) * BAR_GAP}px) / ${n})`,
                display: "flex",
                justifyContent: "center",
                pointerEvents: "none",
                color: "var(--accent)",
                fontFamily: "var(--font-display)",
                fontSize: "0.9rem",
                lineHeight: 1,
                textShadow: "0 0 8px var(--accent)",
              }}
            >
              ▼
            </div>
          );
        })()}

        {/* Footer */}
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
            padding: "0.5rem 0",
            gap: "0.75rem",
          }}
        >
          <span style={{ flex: "0 0 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {label ?? "—"}
          </span>
          <span style={{ flex: "0 0 auto", color: "var(--accent)" }} title="pivot">
            p:{pivotValue ?? "—"}
          </span>
          <span style={{ flex: "0 0 auto" }} title="partition range">
            r:{rangeLabel}
          </span>
          <span style={{ flex: "0 0 auto" }} title="call stack depth">
            d:{depth}
          </span>
          <span style={{ flex: "0 0 auto", color: "var(--sorted)" }} title="sorted positions">
            ✓{sortedCount}
          </span>
          <button className="btn btn--icon" onClick={playScale} style={{ fontSize: "0.5rem" }}>
            ▶ scale
          </button>
        </div>
      </div>
    </div>
  );
}

function valueToFreq(value: number, min: number, max: number): number {
  const range = Math.max(1, max - min);
  const t = (value - min) / range;
  const minFreq = 220;
  const maxFreq = 880;
  return minFreq + t * (maxFreq - minFreq);
}

export { setMuted, isMuted };