import { useEffect, useMemo } from "react";
import type { Snapshot } from "@framework";
import { getAudioContext, isMuted, playTone } from "@framework/audio";
import { ComebackRound, type ComebackRoundState } from "./algorithm";
import styles from "./scene.module.css";
import { Kart, Mountains, Podium, Sun, kartColor, kartName } from "./hud";

// ─── helpers (display only) ───────────────────────────────────────────────────

/** Indices of whoever holds the top total (more than one → shared lead). */
function leadersOf(totals: number[]): number[] {
  const top = Math.max(...totals);
  return totals.flatMap((t, i) => (t === top ? [i] : []));
}

function rankOrder(totals: number[]): number[] {
  return totals.map((_, i) => i).sort((a, b) => totals[b] - totals[a] || a - b);
}

function timecode(lap: number) {
  const s = lap * 17 + 3;
  return `00:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

type ChipStatus = "pending" | "held" | "lost" | "frozen";

// ─── audio (original sounds only) ─────────────────────────────────────────────

function withAudio(fn: (audio: AudioContext, now: number) => void) {
  if (isMuted()) return;
  const audio = getAudioContext();
  if (audio.state === "suspended") void audio.resume();
  fn(audio, audio.currentTime);
}

function sweep(type: OscillatorType, from: number, to: number, dur: number, vol = 0.05, delay = 0) {
  withAudio((audio, now) => {
    const t0 = now + delay;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t0);
    osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  });
}

const playEngine = (lap: number) => sweep("sawtooth", 90 + lap * 12, 260 + lap * 30, 0.45, 0.045);
const playRewind = () => sweep("square", 1400, 180, 0.35, 0.03);
const playHeld = () => {
  playTone(988, 70);
  sweep("square", 1318, 1320, 0.09, 0.04, 0.08);
};
const playLost = () => sweep("sawtooth", 220, 70, 0.5, 0.06);
const playTie = () => {
  sweep("square", 440, 220, 0.3, 0.05);
  sweep("square", 330, 110, 0.5, 0.05, 0.3);
};
/** Short original 6-note victory arpeggio. */
const FANFARE = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
const playFanfare = () => FANFARE.forEach((f, i) => sweep("square", f, f * 1.001, i === 5 ? 0.55 : 0.14, 0.05, i * 0.12));
const playDone = () => [392, 523.25, 659.25].forEach((f) => sweep("triangle", f, f, 0.9, 0.05));

// ─── player control (drives the shared Player's own buttons) ──────────────────

function playerButton(match: (b: HTMLButtonElement) => boolean): HTMLButtonElement | undefined {
  return Array.from(document.querySelectorAll<HTMLButtonElement>(".player button")).find(match);
}

const pausePlayer = () => playerButton((b) => !!b.textContent?.includes("Pause"))?.click();

/** Step past the finish and let the replay play on its own. */
function startReplay() {
  playerButton((b) => b.getAttribute("aria-label") === "step forward")?.click();
  setTimeout(() => playerButton((b) => !!b.textContent?.includes("Play"))?.click(), 50);
}

// ─── scene ────────────────────────────────────────────────────────────────────

export function ComebackRoundScene({ snapshot }: { snapshot: Snapshot<ComebackRoundState> }) {
  const { rounds, index, totals, phase, winner, result, soleLeader } = snapshot.state;
  const roundsKey = JSON.stringify(rounds);
  const n = rounds.length;
  const players = totals.length;

  // Re-run the real algorithm to know the whole race: track length, champion, replay history.
  const trace = useMemo(() => {
    const algo = new ComebackRound({ rounds });
    algo.run();
    return algo.getTrace().snapshots.map((s) => s.state);
  }, [roundsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const trackMax = useMemo(() => Math.max(1, ...trace.flatMap((s) => s.totals)), [trace]);
  const champion = trace.find((s) => s.phase === "finish")?.winner ?? null;
  const isTieRace = trace.some((s) => s.phase === "tie");

  // Replay history: each "after lap i" frame, filled right→left as the recursion unwinds.
  const chips: ChipStatus[] = useMemo(() => {
    const out: ChipStatus[] = new Array(n).fill("pending");
    const replays = trace.filter((s) => s.phase === "replay");
    let lockedBefore = false;
    for (const s of replays) {
      const reached =
        phase === "done" || (phase === "replay" && index !== null && s.index !== null && s.index >= index);
      if (!reached || s.index === null) break;
      out[s.index] = !s.changed ? "held" : lockedBefore ? "frozen" : "lost";
      lockedBefore = s.changed;
    }
    return out;
  }, [trace, phase, index, n]);

  const isLap = phase === "lap";
  const isFinish = phase === "finish";
  const isTie = phase === "tie";
  const isReplay = phase === "replay";
  const isDone = phase === "done";

  const leaders = leadersOf(totals);
  const order = rankOrder(totals);
  const lapsDone = phase === "init" ? 0 : isLap ? (index ?? 0) + 1 : isReplay ? index ?? 0 : n;
  const roundPoints = isLap && index !== null ? rounds[index] : null;
  const currentChip = isReplay && index !== null ? chips[index] : null;
  const checked = isReplay || isDone ? winner : null;

  // ── sound per step ──
  useEffect(() => {
    if (isLap) playEngine(index ?? 0);
    else if (isFinish) {
      playFanfare();
      pausePlayer(); // stop on the podium until the viewer asks for the result
    }
    else if (isTie) playTie();
    else if (isReplay) {
      playRewind();
      setTimeout(() => (currentChip === "held" ? playHeld() : currentChip === "lost" ? playLost() : null), 260);
    } else if (isDone) playDone();
  }, [phase, index]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── commentary ──
  const commentary: { tag: string; text: React.ReactNode } = (() => {
    if (phase === "init")
      return { tag: "GRID", text: `${players} karts line up for ${n} laps. Every round's points push a kart down the track.` };
    if (isLap && index !== null) {
      const lead = leaders.length === 1 ? `${kartName(leaders[0])} leads` : `${leaders.map(kartName).join(" & ")} share the lead`;
      return {
        tag: `LAP ${index + 1}`,
        text: (
          <>
            Recursion goes one level deeper: <code>curr + rounds[{index}]</code>. {lead}.
          </>
        ),
      };
    }
    if (isFinish && winner !== null)
      return {
        tag: "FLAG",
        text: `Base case reached. ${kartName(winner)} crosses the line as the sole winner. Press CALCULATE RESULT to rewind the tape.`,
      };
    if (isTie)
      return {
        tag: "PHOTO",
        text: `Photo finish: ${leaders.map(kartName).join(" & ")} tied on ${Math.max(...totals)}. No sole winner, so the answer is −1.`,
      };
    if (isReplay && index !== null && winner !== null) {
      const who = kartName(winner);
      const after = index === 0 ? "on the starting grid" : `after lap ${index}`;
      if (currentChip === "held")
        return {
          tag: "✔ HELD",
          text: (
            <>
              {who} was already alone in front {after} → <code>result = {n} − {index} = {result}</code>
            </>
          ),
        };
      if (currentChip === "lost")
        return {
          tag: "✗ LEAD",
          text: (
            <>
              {who} was <b>not</b> alone in front {after}. The streak breaks here, so <code>changed = true</code> and result locks at {result}.
            </>
          ),
        };
      return { tag: "LOCKED", text: `Still unwinding ${after}, but the streak already broke. Result stays ${result}.` };
    }
    if (isDone)
      return {
        tag: "RESULT",
        text: result === -1 ? "No sole winner, so the race returns −1." : `Back at the top call. The answer is ${result}.`,
      };
    return { tag: "", text: "" };
  })();

  const gridMode = isLap ? styles.gridForward : isReplay ? styles.gridReverse : "";

  return (
    <div className={styles.wrap}>
      {/* ── header ── */}
      <div className={styles.header}>
        <div className={styles.brand}>
          NEON GRAND PRIX
          <span className={styles.season}>SEASON 2026</span>
        </div>
        <div className={styles.counters}>
          <div className={styles.counter}>
            <span className={styles.counterLabel}>LAP</span>
            <span className={styles.counterVal}>
              {lapsDone}/{n}
            </span>
          </div>
          <div className={`${styles.counter} ${styles.counterResult}`}>
            <span className={styles.counterLabel}>RESULT</span>
            <span className={styles.counterVal}>{result ?? "–"}</span>
          </div>
        </div>
      </div>

      {/* ── stage ── */}
      <div className={`${styles.stage} ${isReplay ? styles.stageReplay : ""} ${isTie ? styles.stageFlash : ""}`}>
        <div className={styles.sky}>
          <Sun />
          <Mountains />
          <div className={styles.tower}>
            <div className={styles.towerTitle}>POS</div>
            {order.slice(0, 5).map((k, pos) => (
              <div key={k} className={styles.towerRow} style={{ ["--c" as string]: kartColor(k) }}>
                <span className={styles.towerPos}>{pos + 1}</span>
                <span className={styles.towerName}>{kartName(k)}</span>
                <span className={styles.towerPts}>{totals[k]}</span>
                {leaders.length === 1 && leaders[0] === k && phase !== "init" && <span className={styles.crown}>♛</span>}
                {leaders.length > 1 && leaders.includes(k) && phase !== "init" && <span className={styles.tieChip}>TIE</span>}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.floor}>
          <div className={`${styles.grid} ${gridMode}`} />
        </div>

        <div className={styles.track}>
          <div className={styles.startLine} />
          <div className={styles.finishLine} />
          {totals.map((t, k) => {
            const pct = t / trackMax;
            const isChecked = checked === k;
            const isLeader = leaders.length === 1 && leaders[0] === k && phase !== "init";
            return (
              <div key={k} className={styles.lane} style={{ ["--c" as string]: kartColor(k) }}>
                <span className={styles.laneTag}>{k + 1}</span>
                {isChecked && <div className={styles.ghostTrail} style={{ width: `calc(${pct} * (84% - 96px))` }} />}
                <div
                  className={`${styles.kart} ${isChecked ? styles.kartChecked : ""} ${isLeader ? styles.kartLeader : ""}`}
                  style={{ left: `calc(8% + ${pct} * (84% - 96px))` }}
                >
                  {roundPoints && roundPoints[k] > 0 && (
                    <span key={`${index}-${k}`} className={styles.popup}>
                      +{roundPoints[k]}
                    </span>
                  )}
                  <Kart index={k} boost={isLap && !!roundPoints && roundPoints[k] > 0} />
                  <span className={styles.kartScore}>{t}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── overlays ── */}
        {isReplay && (
          <div className={styles.vhs}>
            <div className={styles.scanlines} />
            <div className={styles.vhsTop}>
              <span className={styles.vhsPlay}>◄◄ REPLAY</span>
              <span className={styles.vhsRec}>
                <i /> {timecode(index ?? 0)}
              </span>
            </div>
            {currentChip && currentChip !== "frozen" && (
              <div key={index} className={`${styles.verdict} ${currentChip === "held" ? styles.verdictOk : styles.verdictBad}`}>
                {currentChip === "held" ? "✔ IN FRONT" : "✗ NOT ALONE IN FRONT"}
              </div>
            )}
          </div>
        )}

        {isFinish && winner !== null && (
          <div className={styles.finishOverlay}>
            <div className={styles.checkerBanner}>FINISH!</div>
            <Podium order={order} totals={totals} />
            <button className={styles.calcButton} onClick={startReplay}>
              ◄◄ CALCULATE RESULT
            </button>
            <div className={styles.confetti}>
              {Array.from({ length: 28 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    left: `${(i * 37) % 100}%`,
                    background: kartColor(i),
                    animationDelay: `${(i % 7) * 0.12}s`,
                    animationDuration: `${1.4 + (i % 5) * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {isTie && (
          <div className={styles.tieOverlay}>
            <div className={styles.tieTitle}>PHOTO FINISH</div>
            <div className={styles.tieSub}>NO SOLE WINNER → −1</div>
          </div>
        )}

        {isDone && (
          <div className={styles.doneOverlay}>
            <div className={styles.doneCard}>
              <div className={styles.doneLabel}>{isTieRace ? "RACE VOID" : "COMEBACK ROUND"}</div>
              <div className={styles.doneVal}>{result}</div>
              {champion !== null && (
                <div className={styles.doneChamp} style={{ color: kartColor(champion) }}>
                  ♛ {kartName(champion)} wins the Grand Prix
                </div>
              )}
              {champion !== null && winner !== null && winner !== champion && (
                <div className={styles.doneWarn}>
                  heads-up: the replay checked {kartName(winner)} on the way back, not {kartName(champion)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── lap strip ── */}
      <div className={styles.strip}>
        {chips.map((c, i) => (
          <div
            key={i}
            className={`${styles.chip} ${styles[`chip_${c}`]} ${isReplay && index === i ? styles.chipActive : ""}`}
            title={i === 0 ? "starting grid" : `after lap ${i}`}
          >
            <span className={styles.chipLabel}>{i === 0 ? "GRID" : `L${i}`}</span>
            <span className={styles.chipMark}>{c === "held" ? "✔" : c === "lost" ? "✗" : c === "frozen" ? "–" : "·"}</span>
          </div>
        ))}
        <div className={`${styles.chip} ${styles.chipFlag} ${isFinish || isTie ? styles.chipActive : ""}`}>
          <span className={styles.chipLabel}>FLAG</span>
          <span className={styles.chipMark}>🏁</span>
        </div>
      </div>

      {/* ── commentary ── */}
      <div className={styles.commentary}>
        {commentary.tag && <span className={styles.commentTag}>{commentary.tag}</span>}
        <span className={styles.commentText}>{commentary.text}</span>
      </div>

      {isReplay && soleLeader !== null && (
        <div className={styles.hint}>
          checking <b style={{ color: kartColor(winner ?? 0) }}>{kartName(winner ?? 0)}</b> = <code>winner</code> returned
          from the level below
        </div>
      )}
    </div>
  );
}
