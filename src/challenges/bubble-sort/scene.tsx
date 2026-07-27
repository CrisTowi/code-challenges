import { useEffect, useRef, useState } from "react";
import type { Snapshot } from "@framework";
import {
  playNoteForValue,
  ensureAudioRunning,
  setMuted,
  isMuted,
} from "@framework/audio";
import type { BubbleSortState, Bar } from "./algorithm";

const BAR_GAP = 6;
const SCENE_HEIGHT = 320;
const TOP_PADDING_PCT = 8;
const PREVIEW_STEP_MS = 700;

export function BubbleSortScene({
  snapshot,
  playbackSpeed = 1,
}: {
  snapshot: Snapshot<BubbleSortState>;
  playbackSpeed?: number;
}) {
  const { bars, comparing, swapped } = snapshot.state;
  const max = Math.max(...bars.map((b) => b.value), 1);
  const min = Math.min(...bars.map((b) => b.value), 0);
  const n = bars.length;

  const [previewingId, setPreviewingId] = useState<number | null>(null);
  const previewTimers = useRef<number[]>([]);

  useEffect(() => {
    if (!comparing) return;
    const a = bars[comparing[0]];
    const b = bars[comparing[1]];
    if (!a || !b) return;
    void ensureAudioRunning();
    if (snapshot.label === "swap" || snapshot.label === "compare") {
      playNoteForValue(a.value, min, max);
      window.setTimeout(() => playNoteForValue(b.value, min, max), 70);
    }
  }, [snapshot, comparing, bars, min, max]);

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
        {bars.map((bar: Bar, idx: number) => {
          const isComparing = comparing !== null && (comparing[0] === idx || comparing[1] === idx);
          const isPreviewing = previewingId === bar.id;
          const colorClass = isPreviewing
            ? "bar--preview"
            : isComparing
              ? "bar--compare"
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
                transition: "left 350ms cubic-bezier(0.65, 0, 0.35, 1), background 150ms ease, box-shadow 150ms ease",
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
          <span>{snapshot.label ?? "—"}</span>
          <button
            className="btn btn--icon"
            onClick={playScale}
            style={{ fontSize: "0.5rem" }}
          >
            ▶ scale
          </button>
          <span>{swapped ? "swapped" : "no swap"}</span>
        </div>
      </div>
    </div>
  );
}

export { setMuted, isMuted };
