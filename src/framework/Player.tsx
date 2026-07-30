import { useState, useEffect, useCallback } from "react";
import { ensureAudioRunning, setMuted, isMuted } from "./audio";
import type { Snapshot, Trace, Example } from "./trace";

type ChallengeModule = {
  challenge: {
    Scene: React.ComponentType<{ snapshot: Snapshot<unknown>; playbackSpeed?: number }>;
    Algorithm: new (input: unknown) => { run: () => void; getTrace: () => Trace<unknown> };
    parseInput?: (raw: string) => unknown | { error: string };
    inputPlaceholder?: string;
    customInputs?: Record<string, { input: unknown; description?: string }>;
    formatInput?: (input: unknown) => string;
  };
};

const challengeModules = import.meta.glob<ChallengeModule>("/src/challenges/*/index.ts");

interface PlayerProps {
  slug: string;
  initialTrace: Trace<unknown>;
  examples: Example<unknown>[];
}

export function Player({ slug, initialTrace, examples }: PlayerProps) {
  const [trace, setTrace] = useState<Trace<unknown>>(initialTrace);
  const [Scene, setScene] = useState<ChallengeModule["challenge"]["Scene"] | null>(null);
  const [Algorithm, setAlgorithm] = useState<ChallengeModule["challenge"]["Algorithm"] | null>(null);
  const [parseInput, setParseInput] = useState<ChallengeModule["challenge"]["parseInput"] | undefined>(undefined);
  const [inputPlaceholder, setInputPlaceholder] = useState<string>("");
  const [customInputs, setCustomInputs] = useState<ChallengeModule["challenge"]["customInputs"]>(undefined);
  const [formatInput, setFormatInput] = useState<ChallengeModule["challenge"]["formatInput"]>(undefined);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedExample, setSelectedExample] = useState<string>(examples[0]?.name ?? "");
  const [regenerating, setRegenerating] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [customRaw, setCustomRaw] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);

  const total = trace.snapshots.length;
  const snapshot = trace.snapshots[index];

  useEffect(() => {
    const modulePath = `/src/challenges/${slug}/index.ts`;
    const load = challengeModules[modulePath];
    if (!load) return;
    load()
      .then((mod) => {
        setScene(() => mod.challenge.Scene);
        setAlgorithm(() => mod.challenge.Algorithm);
        setParseInput(() => mod.challenge.parseInput);
        setInputPlaceholder(mod.challenge.inputPlaceholder ?? "");
        setCustomInputs(mod.challenge.customInputs);
        setFormatInput(() => mod.challenge.formatInput);
      })
      .catch((err) => {
        console.error(`Player: failed to load ${modulePath}`, err);
      });
  }, [slug]);

  useEffect(() => {
    if (!isPlaying) return;
    if (index >= total - 1) {
      setIsPlaying(false);
      return;
    }
    const delay = Math.max(15, 700 / speed);
    const t = setTimeout(() => setIndex((i) => i + 1), delay);
    return () => clearTimeout(t);
  }, [isPlaying, index, speed, total]);

  const reset = useCallback(() => {
    setIndex(0);
    setIsPlaying(false);
  }, []);

  const stepBack = useCallback(() => {
    setIsPlaying(false);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const stepForward = useCallback(() => {
    setIsPlaying(false);
    setIndex((i) => Math.min(total - 1, i + 1));
  }, [total]);

  const handleRegen = useCallback(async () => {
    if (!Algorithm || !selectedExample) return;
    const example = examples.find((e) => e.name === selectedExample);
    if (!example) return;
    setRegenerating(true);
    try {
      const algo = new Algorithm(example.input);
      algo.run();
      setTrace(algo.getTrace());
      setIndex(0);
      setIsPlaying(false);
    } finally {
      setRegenerating(false);
    }
  }, [Algorithm, selectedExample, examples]);

  const togglePlay = useCallback(() => {
    void ensureAudioRunning();
    setIsPlaying((p) => !p);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  }, [muted]);

  const runCustom = useCallback(() => {
    if (!Algorithm || !parseInput) return;
    const parsed = parseInput(customRaw);
    if (parsed && typeof parsed === "object" && "error" in parsed) {
      setCustomError((parsed as { error: string }).error);
      return;
    }
    setCustomError(null);
    const algo = new Algorithm(parsed);
    algo.run();
    setTrace(algo.getTrace());
    setIndex(0);
    setIsPlaying(false);
    setSelectedExample("");
  }, [Algorithm, parseInput, customRaw]);

  const runCustomInput = useCallback((input: unknown, name: string) => {
    if (!Algorithm) return;
    const algo = new Algorithm(input);
    algo.run();
    setTrace(algo.getTrace());
    setIndex(0);
    setIsPlaying(false);
    setSelectedExample("");
    setCustomError(null);
    if (formatInput) {
      setCustomRaw(formatInput(input));
    }
  }, [Algorithm, formatInput]);

  if (!Scene) {
    return (
      <div className="panel" style={{ textAlign: "center", padding: "2rem" }}>
        <span className="subtitle">Loading scene…</span>
      </div>
    );
  }

  return (
    <div>
      <Scene snapshot={snapshot} playbackSpeed={speed} />

      <div className="player">
        <div className="player__row">
          <button className="btn btn--icon" onClick={reset} aria-label="reset">
            ⟪
          </button>
          <button className="btn btn--icon" onClick={stepBack} aria-label="step back">
            ◀
          </button>
          <button
            className={`btn ${isPlaying ? "" : "btn--primary"}`}
            onClick={togglePlay}
            style={{ minWidth: "5rem" }}
          >
            {isPlaying ? "❚❚ Pause" : "▶ Play"}
          </button>
          <button className="btn btn--icon" onClick={stepForward} aria-label="step forward">
            ▶
          </button>

          <input
            className="player__scrubber"
            type="range"
            min={0}
            max={total - 1}
            value={index}
            onChange={(e) => {
              setIndex(Number(e.target.value));
              setIsPlaying(false);
            }}
          />

          <span className="player__counter">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        <div className="player__row">
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "var(--font-display)",
              fontSize: "0.5rem",
              textTransform: "uppercase",
              color: "var(--text-dim)",
              letterSpacing: "1px",
            }}
          >
            speed
            <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
              <option value={0.5}>0.5×</option>
              <option value={1}>1×</option>
              <option value={2}>2×</option>
              <option value={4}>4×</option>
              <option value={8}>8×</option>
              <option value={16}>16×</option>
              <option value={24}>24×</option>
            </select>
          </label>

          <button className="btn btn--icon" onClick={toggleMute} aria-label="toggle sound">
            {muted ? "🔇 mute" : "🔊 sound"}
          </button>

          {snapshot.label && <span className="player__status">{snapshot.label}</span>}
        </div>

        {examples.length > 0 && Algorithm && (
          <>
            <div className="subtitle">▸ select level</div>
            <div className="levels">
              {examples.map((ex) => (
                <button
                  key={ex.name}
                  className={`levels__item ${ex.name === selectedExample ? "levels__item--active" : ""}`}
                  onClick={() => setSelectedExample(ex.name)}
                >
                  <span className="levels__name">{ex.name}</span>
                  {ex.description && <span className="levels__desc">{ex.description}</span>}
                </button>
              ))}
            </div>
            <div className="player__row" style={{ justifyContent: "flex-end" }}>
              <button
                className="btn btn--primary"
                onClick={handleRegen}
                disabled={regenerating}
              >
                {regenerating ? "▸▸▸ running" : "▸ run level"}
              </button>
            </div>
          </>
        )}

        {customInputs && Object.keys(customInputs).length > 0 && Algorithm && (
          <>
            <div className="subtitle">▸ quick inputs</div>
            <div className="levels">
              {Object.entries(customInputs).map(([name, entry]) => (
                <button
                  key={name}
                  className="levels__item"
                  onClick={() => runCustomInput(entry.input, name)}
                  title={formatInput ? formatInput(entry.input) : name}
                >
                  <span className="levels__name">{name}</span>
                  {entry.description && <span className="levels__desc">{entry.description}</span>}
                </button>
              ))}
            </div>
          </>
        )}

        {parseInput && Algorithm && (
          <>
            <div className="subtitle">▸ custom array</div>
            <div className="player__row">
              <input
                type="text"
                className="custom-input"
                value={customRaw}
                placeholder={inputPlaceholder || "e.g. 5,3,8,1,4,9,2"}
                onChange={(e) => {
                  setCustomRaw(e.target.value);
                  if (customError) setCustomError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") runCustom();
                }}
                style={{
                  flex: 1,
                  fontFamily: "var(--font-body)",
                  fontSize: "1.1rem",
                  background: "var(--bg-elev)",
                  color: "var(--text)",
                  border: `2px solid ${customError ? "var(--bar-compare)" : "var(--border)"}`,
                  padding: "0.55rem 0.75rem",
                  outline: "none",
                }}
              />
              <button
                className="btn btn--primary"
                onClick={runCustom}
                disabled={!customRaw.trim() || regenerating}
              >
                ▸ add &amp; run
              </button>
              <button
                className="btn btn--icon"
                onClick={() => {
                  setCustomRaw((prev) => (prev ? prev + "," : "") + String(Math.ceil(Math.random() * 9)));
                }}
                title="Append a random digit 1-9"
              >
                +?
              </button>
            </div>
            {customError && (
              <div
                style={{
                  color: "var(--bar-compare)",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.55rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                ✕ {customError}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
