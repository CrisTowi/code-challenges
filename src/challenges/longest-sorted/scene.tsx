import { useEffect, useRef } from "react";
import type { Snapshot } from "@framework";
import {
  ensureAudioRunning,
  playTone,
  playSuccess,
} from "@framework/audio";
import type { LongestSortedState } from "./algorithm";
import styles from "./scene.module.css";

const CELL_W = 40;
const CELL_GAP = 4;

const COMPARE_HZ = 523.25;
const PICK_HZ = 392.0;
const FAIL_HZ = 196.0;
const SORTED_HZ = 659.25;
const UPDATE_HZ = 880.0;

function letterClass(
  isCurrent: boolean,
  letterIndex: number | null,
  lastFailedAt: number | null,
  sortedResult: boolean | null,
  wordStatus: "pending" | "accepted" | "rejected" | undefined,
  isWinner: boolean,
  j: number,
): string {
  const classes = [styles.cell];

  if (wordStatus === "rejected") {
    classes.push(styles["cell--rejected"]);
  } else if (wordStatus === "accepted") {
    classes.push(styles["cell--accepted"]);
    if (isWinner) classes.push(styles["cell--isWinner"]);
  } else if (isCurrent) {
    classes.push(styles["cell--inCurrent"]);
    if (sortedResult === false && lastFailedAt != null) {
      if (j === lastFailedAt) classes.push(styles["cell--failedCurr"]);
      else if (j === lastFailedAt - 1) classes.push(styles["cell--failedPrev"]);
    } else if (letterIndex != null) {
      if (j === letterIndex) classes.push(styles["cell--current"]);
      else if (j === letterIndex - 1) classes.push(styles["cell--prev"]);
    }
  } else {
    classes.push(styles["cell--pending"]);
  }

  return classes.join(" ");
}

export function LongestSortedScene({
  snapshot,
}: {
  snapshot: Snapshot<LongestSortedState>;
}) {
  const {
    input,
    words,
    wordIndex,
    letterIndex,
    sortedResult,
    lastFailedAt,
    wordStatuses,
    currentLongest,
  } = snapshot.state;
  const label = snapshot.label;
  const isDone = label === "done";
  const isInitOrPick = label === "initWords" || label === "pickWord";
  const isCompare = label === "compare";
  const isNotSorted = label === "notSorted";
  const isSorted = label === "sorted";
  const isLongestUpdate = label === "longestUpdate";

  const isCurrentWord = (i: number) => wordIndex === i;
  const wordStatus = (i: number) => wordStatuses[i];

  const labelRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (label === labelRef.current) return;
    labelRef.current = label;
    if (!label) return;
    void ensureAudioRunning();

    if (isInitOrPick) playTone(PICK_HZ, 50);
    else if (isCompare) playTone(COMPARE_HZ, 55);
    else if (isNotSorted) playTone(FAIL_HZ, 180);
    else if (isSorted) playTone(SORTED_HZ, 80);
    else if (isLongestUpdate) playTone(UPDATE_HZ, 110);
    else if (isDone) playSuccess();
  }, [label, isInitOrPick, isCompare, isNotSorted, isSorted, isLongestUpdate, isDone]);

  const currentWord = wordIndex != null ? words[wordIndex] : null;
  const currentLetterChar = currentWord && letterIndex != null ? currentWord[letterIndex] : null;
  const prevLetterChar =
    currentWord && letterIndex != null && letterIndex > 0
      ? currentWord[letterIndex - 1]
      : null;

  const compareArrowLeft =
    letterIndex != null
      ? (letterIndex - 1) * (CELL_W + CELL_GAP) + CELL_W + CELL_GAP / 2
      : 0;
  const compareArrowVisible = isCompare && currentWord && letterIndex != null && letterIndex > 0;

  const renderWordRow = (word: string, i: number) => {
    const isCurr = isCurrentWord(i);
    const status = wordStatus(i);
    const isWinnerWord = word === currentLongest && currentLongest.length > 0;
    const showArrowHere = compareArrowVisible && isCurr;
    return (
      <div key={`word-${i}`} className={styles.wordRow}>
        <span className={styles.wordRow__index}>{i}</span>
        <div className={styles.wordRow__cells}>
          {Array.from(word, (ch, j) => (
            <div
              key={`cell-${i}-${j}`}
              className={letterClass(
                isCurr,
                letterIndex,
                lastFailedAt,
                sortedResult,
                status,
                isWinnerWord,
                j,
              )}
            >
              {ch}
            </div>
          ))}
          {showArrowHere && (
            <span
              key={`arrow-${label}-${letterIndex}`}
              className={styles.compareArrow}
              style={{ left: `${compareArrowLeft}px` }}
            >
              ≤
            </span>
          )}
          {status === "accepted" && (
            <span key={`check-${i}`} className={styles.checkBadge}>
              <svg className={styles.badgeIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 12 L10 16 L18 8" />
              </svg>
            </span>
          )}
          {status === "rejected" && (
            <span key={`cross-${i}`} className={styles.crossBadge}>
              <svg className={styles.badgeIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 8 L16 16 M16 8 L8 16" />
              </svg>
            </span>
          )}
        </div>
      </div>
    );
  };

  const showFinalWinner = isDone && currentLongest.length > 0;

  const renderFooterChip = () => {
    if (isCompare && currentWord && letterIndex != null && letterIndex > 0) {
      return (
        <span className={styles.footer__chip}>
          {prevLetterChar} ≤ {currentLetterChar} ✓
        </span>
      );
    }
    if (isNotSorted && currentWord && lastFailedAt != null && lastFailedAt > 0) {
      return (
        <span className={`${styles.footer__chip} ${styles["footer__chip--fail"]}`}>
          {currentWord[lastFailedAt - 1]} &gt; {currentWord[lastFailedAt]} ✗
        </span>
      );
    }
    if (isSorted) {
      return (
        <span className={`${styles.footer__chip} ${styles["footer__chip--sorted"]}`}>
          ✓ sorted
        </span>
      );
    }
    if (isLongestUpdate) {
      return (
        <span className={`${styles.footer__chip} ${styles["footer__chip--update"]}`}>
          ★ new longest
        </span>
      );
    }
    if (isDone && currentLongest.length > 0) {
      return (
        <span className={`${styles.footer__chip} ${styles["footer__chip--winner"]}`}>
          ★ winner: {currentLongest}
        </span>
      );
    }
    if (isDone) {
      return (
        <span className={styles.footer__chip}>no sorted word found</span>
      );
    }
    return <span className={styles.footer__chip}>—</span>;
  };

  const bannerLettersKey = currentLongest.length > 0 ? currentLongest : "_empty";
  const showBannerPop = isLongestUpdate || (isDone && currentLongest.length > 0);

  return (
    <div className="scene">
      <div
        className={`${styles.sceneContent} ${isDone ? styles["sceneContent--done"] : ""}`}
      >
        <p className={styles.label}>▸ input</p>
        <div
          className={`${styles.inputTape} ${input.length === 0 ? styles["inputTape--empty"] : ""}`}
        >
          {input.length === 0 ? "— empty —" : input}
        </div>

        <p className={styles.label}>▸ words</p>
        {words.length === 0 ? (
          <div className={styles.inputTape}>— no words —</div>
        ) : (
          <div className={styles.wordsGrid}>
            {words.map((w, i) => renderWordRow(w, i))}
          </div>
        )}

        {currentLongest.length > 0 && (
          <div
            key={`banner-${bannerLettersKey}`}
            className={
              `${styles.banner} ` +
              `${showBannerPop ? styles["banner__pop"] : ""} ` +
              `${showFinalWinner ? styles["banner__winner"] : ""}`
            }
          >
            <span className={styles.banner__title}>▸ longest</span>
            <div className={styles.banner__word}>
              {Array.from(currentLongest, (ch, k) => (
                <span
                  key={`banner-letter-${bannerLettersKey}-${k}`}
                  className={styles.banner__letter}
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <span className={styles.footer__label}>{label ?? "—"}</span>
          <span className={styles.footer__chip}>
            word {wordIndex != null ? wordIndex + 1 : words.length} / {words.length}
          </span>
          <span className={styles.footer__chip}>
            longest {currentLongest.length}
          </span>
          {renderFooterChip()}
        </div>
      </div>
    </div>
  );
}
