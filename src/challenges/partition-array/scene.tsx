import { useEffect, useRef } from "react";
import type { Snapshot } from "@framework";
import {
  ensureAudioRunning,
  playTone,
  playSuccess,
} from "@framework/audio";
import type { PartitionArrayState } from "./algorithm";

type Bucket = "odd" | "even" | "zero";
import styles from "./scene.module.css";

const CELL_W = 52;
const CELL_H = 52;
const CELL_GAP = 0;
const PADDING = 16;
const CURSOR_H = 14;
const TRANSITION_H = 56;
const BUCKET_GAP = 4;
const RESULT_GAP = 12;
const FOOTER_H = 40;
const ROW_LABEL_W = 60;

const SCAN_TONE_HZ = 880;
const SCAN_TONE_MS = 55;
const ODD_TONE_HZ = 523.25;
const EVEN_TONE_HZ = 392.0;
const ZERO_TONE_HZ = 261.63;
const DROP_TONE_MS = 220;

function layerWidth(n: number) {
  return 2 * PADDING + n * CELL_W + (n - 1) * CELL_GAP;
}

function cellLeft(i: number) {
  return PADDING + i * (CELL_W + CELL_GAP);
}

function cellCenterX(i: number) {
  return cellLeft(i) + CELL_W / 2;
}

function toneForBucket(bucket: Bucket) {
  if (bucket === "odd") return ODD_TONE_HZ;
  if (bucket === "even") return EVEN_TONE_HZ;
  return ZERO_TONE_HZ;
}

function bucketColorVar(bucket: Bucket) {
  if (bucket === "odd") return "var(--bucket-odd, var(--accent-2))";
  if (bucket === "even") return "var(--bucket-even, var(--accent))";
  return "var(--bucket-zero, var(--sorted))";
}

function bucketForItem(item: number): Bucket {
  if (item === 0) return "zero";
  if (item % 2 === 0) return "even";
  return "odd";
}

function bucketForAddLabel(label: string | undefined): Bucket | null {
  if (label === "addOdd") return "odd";
  if (label === "addEven") return "even";
  if (label === "addZeroes") return "zero";
  return null;
}

const INPUT_ROW_TOP = CURSOR_H;
const TRANSITION_TOP = INPUT_ROW_TOP + CELL_H;
const ODD_ROW_TOP = TRANSITION_TOP + TRANSITION_H;
const EVEN_ROW_TOP = ODD_ROW_TOP + CELL_H + BUCKET_GAP;
const ZERO_ROW_TOP = EVEN_ROW_TOP + CELL_H + BUCKET_GAP;
const RESULT_ROW_TOP = ZERO_ROW_TOP + CELL_H + RESULT_GAP;

function bucketRowTop(bucket: Bucket) {
  if (bucket === "odd") return ODD_ROW_TOP;
  if (bucket === "even") return EVEN_ROW_TOP;
  return ZERO_ROW_TOP;
}

interface RowProps {
  values: number[];
  width: number;
  label: string;
  labelClassName?: string;
  cellClassName: (i: number) => string;
  marginBottom?: number;
  hidden?: boolean;
}

function Row({
  values,
  width,
  label,
  labelClassName,
  cellClassName,
  marginBottom,
  hidden,
}: RowProps) {
  if (hidden) return null;
  return (
    <div
      className={styles.row}
      style={{
        width: `${width}px`,
        "--row-gap": `${marginBottom ?? 0}px`,
      } as React.CSSProperties}
    >
      <span className={`${styles.rowLabel} ${labelClassName ?? ""}`}>{label}</span>
      {values.map((value, i) => (
        <div
          key={`${label}-${i}-${value}`}
          className={`${styles.cell} ${cellClassName(i)}`}
          style={{ left: `${cellLeft(i)}px` }}
        >
          {value}
        </div>
      ))}
    </div>
  );
}

export function PartitionArrayScene({
  snapshot,
}: {
  snapshot: Snapshot<PartitionArrayState>;
}) {
  const { inputArray, odd, even, zeroes } = snapshot.state;
  const label = snapshot.label;

  const n = inputArray.length;
  const width = layerWidth(n);

  const isInit = label === "init" || label === undefined;
  const isFinish = label === "finishAlgorithm";
  const isLoop = label === "loop";
  const addBucket = bucketForAddLabel(label);
  const isAdd = addBucket !== null;
  const totalInBuckets = odd.length + even.length + zeroes.length;

  let currentIndex: number | null = null;
  let movingItem: number | null = null;
  let movingTo: Bucket | null = null;
  if (isLoop) {
    currentIndex = totalInBuckets;
    if (currentIndex < n) {
      movingItem = inputArray[currentIndex];
      movingTo = bucketForItem(movingItem);
    }
  } else if (isAdd) {
    currentIndex = totalInBuckets - 1;
    movingItem = inputArray[currentIndex];
    movingTo = addBucket;
  }

  const isInspect = isLoop;
  const isDrop = isAdd;
  const isConcat = isFinish;

  const consumedCutoff = isConcat
    ? n
    : currentIndex == null
      ? -1
      : isDrop
        ? currentIndex
        : currentIndex - 1;

  const currentInputX =
    currentIndex != null ? cellCenterX(currentIndex) : null;
  const cursorVisible = !isInit && currentIndex != null;

  const ghostVisible = movingItem != null && movingTo != null;
  const ghostBucket = movingTo ?? null;

  const bucketLengthFor = (bucket: Bucket) => {
    if (bucket === "odd") return odd.length;
    if (bucket === "even") return even.length;
    return zeroes.length;
  };

  const bucketValues = (bucket: Bucket) => {
    if (bucket === "odd") return odd;
    if (bucket === "even") return even;
    return zeroes;
  };

  const ghostLeft =
    ghostVisible && ghostBucket
      ? cellLeft(
          isDrop
            ? bucketLengthFor(ghostBucket) - 1
            : bucketLengthFor(ghostBucket),
        )
      : 0;
  const ghostTopWithinTransition = ghostVisible && ghostBucket
    ? isDrop
      ? bucketRowTop(ghostBucket) - TRANSITION_TOP
      : 6
    : 0;

  const justPlacedKey = isDrop && ghostBucket
    ? `${ghostBucket}-${bucketLengthFor(ghostBucket) - 1}`
    : null;

  const labelRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (labelRef.current === label) return;
    labelRef.current = label;
    if (!label) return;
    void ensureAudioRunning();
    if (isInspect) {
      playTone(SCAN_TONE_HZ, SCAN_TONE_MS);
    } else if (isDrop && movingTo) {
      playTone(toneForBucket(movingTo), DROP_TONE_MS);
    } else if (isConcat) {
      playSuccess();
    }
  }, [label, isInspect, isDrop, isConcat, movingTo]);

  const renderBucketCell = (i: number, bucket: Bucket) => {
    const justPlaced = justPlacedKey === `${bucket}-${i}`;
    const base = `cell--${bucket}`;
    return `${styles[base]} ${justPlaced ? styles["cell--justPlaced"] : ""}`;
  };

  const renderInputCell = (i: number) => {
    if (i === currentIndex && !isInit && !isConcat) return styles["cell--current"];
    if (i <= consumedCutoff) return styles["cell--consumed"];
    return styles["cell--input"];
  };

  const renderResultCell = (i: number): string => {
    const oddLen = odd.length;
    const evenLen = even.length;
    if (i < oddLen) return `${styles["cell--odd"]} ${styles["cell--result"]} ${styles["cell--justPlaced"]}`;
    if (i < oddLen + evenLen) return `${styles["cell--even"]} ${styles["cell--result"]} ${styles["cell--justPlaced"]}`;
    return `${styles["cell--zero"]} ${styles["cell--result"]} ${styles["cell--justPlaced"]}`;
  };

  const resultValues = isConcat
    ? [...odd, ...even, ...zeroes]
    : [];

  const labelBadge = label
    ? label
    : "—";

  const statusBucket = isDrop && movingTo ? movingTo : null;

  const totalLayoutHeight = isConcat ? RESULT_ROW_TOP + CELL_H : ZERO_ROW_TOP + CELL_H;
  const sceneContentHeight = totalLayoutHeight + PADDING * 2 + FOOTER_H + 16;

  return (
    <div className="scene" style={{ minHeight: `${sceneContentHeight}px` }}>
      <div className={styles.sceneContent}>
        <div
          className={styles.layout}
          style={
            {
              "--cell-w": `${CELL_W}px`,
              "--cell-h": `${CELL_H}px`,
              "--layer-w": `${width}px`,
              width: `${width + ROW_LABEL_W}px`,
              paddingLeft: `${ROW_LABEL_W}px`,
              minHeight: `${totalLayoutHeight}px`,
            } as React.CSSProperties
          }
        >
          <div
            className={styles.cursorZone}
            style={{ width: `${width}px`, height: `${CURSOR_H}px` }}
          >
            {cursorVisible && currentInputX != null && (
              <div
                key={`cursor-${label}`}
                className={styles.cursor}
                style={{
                  left: `${currentInputX - 7}px`,
                  bottom: "4px",
                  borderTopColor: movingTo
                    ? bucketColorVar(movingTo)
                    : "var(--accent)",
                  filter: `drop-shadow(0 0 4px ${
                    movingTo ? bucketColorVar(movingTo) : "var(--accent)"
                  })`,
                }}
              />
            )}
          </div>

          <Row
            values={inputArray}
            width={width}
            label="INPUT"
            cellClassName={renderInputCell}
            marginBottom={TRANSITION_H}
          />

          <div
            className={styles.transitionZone}
            style={{ width: `${width}px`, height: `${TRANSITION_H}px` }}
          >
            {ghostVisible && movingItem != null && ghostBucket && (
              <div
                key={`ghost-${label}-${movingItem}`}
                className={`${styles.ghost} ${styles[`ghost--${ghostBucket}`]}`}
                style={{
                  left: `${ghostLeft}px`,
                  top: `${ghostTopWithinTransition}px`,
                }}
              >
                {movingItem}
              </div>
            )}
          </div>

          <Row
            values={bucketValues("odd")}
            width={width}
            label="ODD"
            labelClassName={styles["rowLabel--odd"]}
            cellClassName={(i) => renderBucketCell(i, "odd")}
            marginBottom={BUCKET_GAP}
          />

          <Row
            values={bucketValues("even")}
            width={width}
            label="EVEN"
            labelClassName={styles["rowLabel--even"]}
            cellClassName={(i) => renderBucketCell(i, "even")}
            marginBottom={BUCKET_GAP}
          />

          <Row
            values={bucketValues("zero")}
            width={width}
            label="ZERO"
            labelClassName={styles["rowLabel--zero"]}
            cellClassName={(i) => renderBucketCell(i, "zero")}
            marginBottom={isConcat ? RESULT_GAP : 0}
          />

          <Row
            values={resultValues}
            width={width}
            label="RESULT"
            labelClassName={styles["rowLabel--result"]}
            cellClassName={renderResultCell}
            hidden={!isConcat}
          />
        </div>

        <div className={styles.footer}>
          <span className={styles["footer__label"]}>{labelBadge}</span>
          {statusBucket ? (
            <span
              className={`${styles["footer__chip"]} ${styles[`footer__chip--${statusBucket}`]}`}
            >
              ▸ {statusBucket}
            </span>
          ) : isConcat ? (
            <span className={`${styles["footer__chip"]} ${styles["footer__chip--result"]}`}>
              ✓ concatenated
            </span>
          ) : (
            <span className={styles["footer__chip"]}>—</span>
          )}
          <span className={styles["footer__chip"]}>
            odd {odd.length} · even {even.length} · zero {zeroes.length}
          </span>
        </div>
      </div>
    </div>
  );
}