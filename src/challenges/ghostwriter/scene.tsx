import type { Snapshot } from "@framework";
import type { GhostwriterState } from "./algorithm";
import styles from "./scene.module.css";

const CHAR_W = 34;

const OP_TEXT: Record<GhostwriterState["op"], string> = {
  init:  "The typewriter waits…",
  type:  "The ghost types",
  erase: "The ghost erases",
  echo:  "The ghost echoes",
  done:  "The page is finished",
};

// ─── Ghost ────────────────────────────────────────────────────────────────────

function GhostSvg({ mood }: { mood: GhostwriterState["op"] }) {
  const mouth =
    mood === "erase" ? <ellipse cx="22" cy="25" rx="3" ry="3.5" fill="#1a0a2e" /> :
    mood === "echo"  ? <path d="M 17 24 Q 22 29 27 24" stroke="#1a0a2e" strokeWidth="1.6" fill="none" strokeLinecap="round" /> :
                       <path d="M 18 25 Q 22 27 26 25" stroke="#1a0a2e" strokeWidth="1.4" fill="none" strokeLinecap="round" />;
  return (
    <svg width="44" height="52" viewBox="0 0 44 52" fill="none">
      <path
        d="M 6 22 Q 6 4 22 4 Q 38 4 38 22 L 38 46 Q 34 41 30 46 Q 26 41 22 46 Q 18 41 14 46 Q 10 41 6 46 Z"
        fill="#e8eef7" stroke="#a5b4fc" strokeWidth="1"
      />
      <ellipse cx="16" cy="18" rx="2.6" ry="3.4" fill="#1a0a2e" />
      <ellipse cx="28" cy="18" rx="2.6" ry="3.4" fill="#1a0a2e" />
      <circle cx="17" cy="17" r="0.9" fill="#fff" />
      <circle cx="29" cy="17" r="0.9" fill="#fff" />
      {mouth}
      {/* little arm reaching to the page */}
      <path d="M 36 30 Q 42 34 40 40" stroke="#e8eef7" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ─── Paper decorations ────────────────────────────────────────────────────────

function Cobweb({ className, spider = false }: { className: string; spider?: boolean }) {
  return (
    <svg className={className} width="64" height="64" viewBox="0 0 64 64" fill="none">
      <g stroke="#5b4a32" strokeWidth="0.8" opacity="0.55">
        <line x1="0" y1="0" x2="64" y2="6" />
        <line x1="0" y1="0" x2="52" y2="36" />
        <line x1="0" y1="0" x2="30" y2="58" />
        <line x1="0" y1="0" x2="6" y2="64" />
        <path d="M 16 1.5 Q 15 8 13 9 Q 9 13 7.5 16 Q 3 17 1.5 16" />
        <path d="M 32 3 Q 29 14 26 18 Q 18 26 15 31 Q 6 33 3 32" />
        <path d="M 48 4.5 Q 44 20 39 27 Q 28 39 22 45 Q 10 48 4.5 48" />
      </g>
      {/* spider dangling from the web */}
      {spider && (
      <g className={styles.spider}>
      <line x1="39" y1="27" x2="39" y2="42" stroke="#3a2c1c" strokeWidth="0.6" />
      <g transform="translate(39 45)">
        <g stroke="#1c1917" strokeWidth="0.9" strokeLinecap="round">
          <path d="M -2 -1 L -6 -4 M -2 0 L -7 0 M -2 1 L -6 4" />
          <path d="M 2 -1 L 6 -4 M 2 0 L 7 0 M 2 1 L 6 4" />
        </g>
        <ellipse cx="0" cy="0" rx="2.6" ry="3.2" fill="#1c1917" />
        <circle cx="-0.9" cy="-1" r="0.5" fill="#ef4444" />
        <circle cx="0.9" cy="-1" r="0.5" fill="#ef4444" />
      </g>
      </g>
      )}
    </svg>
  );
}

function Bat({ className }: { className: string }) {
  return (
    <svg className={className} width="34" height="16" viewBox="0 0 34 16" fill="none">
      <path
        d="M 17 5 Q 14 1 9 2 Q 6 6 1 5 Q 4 9 6 13 Q 9 10 12 12 Q 14 9 17 11 Q 20 9 22 12 Q 25 10 28 13 Q 30 9 33 5 Q 28 6 25 2 Q 20 1 17 5 Z"
        fill="#2b1d3a"
      />
      <circle cx="15.5" cy="6" r="0.7" fill="#fbbf24" />
      <circle cx="18.5" cy="6" r="0.7" fill="#fbbf24" />
    </svg>
  );
}

function PumpkinStamp({ className }: { className: string }) {
  return (
    <svg className={className} width="40" height="38" viewBox="0 0 40 38" fill="none">
      <rect x="18" y="1" width="4" height="7" rx="2" fill="#3f6212" />
      <path d="M 22 4 Q 28 1 30 5" stroke="#4d7c0f" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <ellipse cx="13" cy="22" rx="10" ry="13" fill="#ea580c" />
      <ellipse cx="27" cy="22" rx="10" ry="13" fill="#ea580c" />
      <ellipse cx="20" cy="22" rx="9" ry="14" fill="#f97316" />
      <polygon points="11,18 17,18 14,13" fill="#1c1917" />
      <polygon points="23,18 29,18 26,13" fill="#1c1917" />
      <path d="M 9 25 L 13 28 L 16 25 L 20 29 L 24 25 L 27 28 L 31 25 Q 20 35 9 25 Z" fill="#1c1917" />
    </svg>
  );
}

function CandyCorn({ className }: { className: string }) {
  return (
    <svg className={className} width="14" height="16" viewBox="0 0 14 16" fill="none">
      <path d="M 7 1 L 13 15 Q 7 16.5 1 15 Z" fill="#fde68a" />
      <path d="M 4.2 8.5 L 9.8 8.5 L 12 13.6 Q 7 15 2 13.6 Z" fill="#f97316" />
      <path d="M 1.6 13.4 Q 7 15 12.4 13.4 L 13 15 Q 7 16.5 1 15 Z" fill="#fffbeb" />
    </svg>
  );
}

function PaperDecor() {
  return (
    <div className={styles.decor} aria-hidden="true">
      <span className={styles.stain} style={{ left: "62%", top: "18%", width: 70, height: 46 }} />
      <span className={styles.stain} style={{ left: "8%", top: "58%", width: 44, height: 30 }} />
      <Cobweb className={styles.cobweb} spider />
      <Cobweb className={styles.cobwebRight} />
      <Bat className={styles.bat} />
      <Bat className={styles.batSmall} />
      <PumpkinStamp className={styles.pumpkin} />
      <CandyCorn className={styles.candyA} />
      <CandyCorn className={styles.candyB} />
    </div>
  );
}

// ─── Input tape ───────────────────────────────────────────────────────────────

function Tape({ word, index, done }: { word: string; index: number | null; done: boolean }) {
  return (
    <div className={styles.tape}>
      {[...word].map((ch, i) => {
        const read    = done || (index !== null && i < index);
        const current = index === i;
        const special = ch === "#" || ch === "~";
        return (
          <span
            key={i}
            className={[
              styles.key,
              special ? styles.keySpecial : "",
              read ? styles.keyRead : "",
              current ? styles.keyCurrent : "",
            ].join(" ")}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────

export function GhostwriterScene({ snapshot }: { snapshot: Snapshot<GhostwriterState> }) {
  const { word, stack, index, op, affected } = snapshot.state;
  // `~` on an empty page pushes undefined; join('') drops it, so the page does too.
  const letters = stack.filter((ch): ch is string => ch != null);
  const isDone  = op === "done";
  const stepKey = index ?? op;

  const missed = (op === "erase" || op === "echo") && affected === null;
  const lastSlot = Math.max(0, letters.length - 1);
  const ghostSlot = op === "erase" ? letters.length : lastSlot;

  let caption = OP_TEXT[op];
  if (op === "type")  caption += ` “${affected}”`;
  if (op === "erase") caption += missed ? "… but the page is empty" : ` “${affected}”`;
  if (op === "echo")  caption += missed ? "… but there is nothing to copy" : ` “${affected}”`;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.brand}>GHOSTWRITER</span>
        <span className={styles.legend}>
          <span className={styles.keySpecial}>#</span> erase
          <span className={styles.keySpecial}>~</span> echo
        </span>
      </div>

      <Tape word={word} index={index} done={isDone} />

      <div key={`cap-${stepKey}`} className={`${styles.caption} ${styles[`caption_${op}`] ?? ""}`}>
        {caption}
      </div>

      <div className={styles.typewriter}>
        <div className={styles.paper}>
          <PaperDecor />
          <div className={styles.line} style={{ minWidth: (letters.length + 1) * CHAR_W }}>
            {!isDone && op !== "init" && (
              <div
                key={`ghost-${stepKey}`}
                className={`${styles.ghost} ${missed ? styles.ghostConfused : ""}`}
                style={{ left: ghostSlot * CHAR_W - 4 }}
              >
                <GhostSvg mood={op} />
              </div>
            )}

            {letters.map((ch, i) => {
              const isLast = i === letters.length - 1;
              const anim =
                isLast && op === "type" ? styles.letterTyped :
                isLast && op === "echo" && !missed ? styles.letterEchoed : "";
              return (
                <span
                  key={isLast ? `l-${i}-${stepKey}` : `l-${i}`}
                  className={`${styles.letter} ${anim}`}
                  style={{ width: CHAR_W }}
                >
                  {ch}
                </span>
              );
            })}

            {op === "erase" && !missed && (
              <span
                key={`wisp-${stepKey}`}
                className={styles.wisp}
                style={{ left: letters.length * CHAR_W, width: CHAR_W }}
              >
                {affected}
              </span>
            )}

            {!isDone && <span className={styles.caret} style={{ width: CHAR_W }} />}
          </div>
        </div>
        <div className={styles.body}>
          <span className={styles.roller} />
        </div>
      </div>

      {isDone && (
        <div className={styles.result}>
          Result: <strong>“{letters.join("")}”</strong>
        </div>
      )}
    </div>
  );
}
