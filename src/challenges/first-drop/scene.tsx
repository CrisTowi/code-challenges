import { useEffect, useMemo, useRef } from "react";
import type { Snapshot } from "@framework";
import {
  ensureAudioRunning,
  playNoteForValue,
  playTone,
  playSuccess,
} from "@framework/audio";
import type { FirstDropState } from "./algorithm";
import styles from "./scene.module.css";

type Node = FirstDropState["tree"] extends infer N
  ? N extends null
    ? {
        originalIndex: number;
        key: number;
        left: Node | null;
        right: Node | null;
      }
    : NonNullable<N>
  : never;

const NODE_W = 72;
const NODE_H = 50;
const LEVEL_H = 72;
const LEAF_GAP = 18;
const MARGIN_X = 24;
const MARGIN_Y = 16;
const DAY_SQUARE_SIZE = 64;
const MAX_TEMP = 120;

function collectTreeNodes(node: Node | null): Node[] {
  const out: Node[] = [];
  const walk = (n: Node | null) => {
    if (!n) return;
    out.push(n);
    if (n.left) walk(n.left);
    if (n.right) walk(n.right);
  };
  walk(node);
  return out;
}

type PositionedNode = {
  node: Node;
  x: number;
  y: number;
};

function layoutTree(root: Node | null): {
  positions: PositionedNode[];
  width: number;
  height: number;
} {
  if (!root) return { positions: [], width: 0, height: 0 };

  const depthMap = new Map<Node, number>();
  const computeDepths = (n: Node | null, d: number): void => {
    if (!n) return;
    depthMap.set(n, d);
    computeDepths(n.left, d + 1);
    computeDepths(n.right, d + 1);
  };
  computeDepths(root, 0);

  const positions: PositionedNode[] = [];
  const inOrderIndex = { value: 0 };
  const inOrderPlace = (n: Node | null): void => {
    if (!n) return;
    inOrderPlace(n.left);
    positions.push({
      node: n,
      x: inOrderIndex.value * (NODE_W + LEAF_GAP),
      y: (depthMap.get(n) ?? 0) * LEVEL_H,
    });
    inOrderIndex.value += 1;
    inOrderPlace(n.right);
  };
  inOrderPlace(root);

  const maxX = positions.reduce((m, p) => Math.max(m, p.x), 0);
  const maxY = positions.reduce((m, p) => Math.max(m, p.y), 0);
  const width = MARGIN_X * 2 + maxX + NODE_W;
  const height = MARGIN_Y * 2 + maxY + NODE_H;

  return { positions, width, height };
}

function buildEdges(positions: PositionedNode[]): Array<{
  from: PositionedNode;
  to: PositionedNode;
}> {
  const byNode = new Map<Node, PositionedNode>();
  for (const p of positions) byNode.set(p.node, p);
  const edges: Array<{ from: PositionedNode; to: PositionedNode }> = [];
  for (const p of positions) {
    const n = p.node;
    if (n.left && byNode.has(n.left)) {
      edges.push({ from: p, to: byNode.get(n.left)! });
    }
    if (n.right && byNode.has(n.right)) {
      edges.push({ from: p, to: byNode.get(n.right)! });
    }
  }
  return edges;
}

function collectIndices(node: Node | null): Set<number> {
  const set = new Set<number>();
  const walk = (n: Node | null) => {
    if (!n) return;
    set.add(n.originalIndex);
    walk(n.left);
    walk(n.right);
  };
  walk(node);
  return set;
}

function dayStatus(
  idx: number,
  currentIndex: number | null,
  inTree: Set<number>,
): "past" | "future" | "current" {
  if (currentIndex != null && idx === currentIndex) return "current";
  if (inTree.has(idx)) return "future";
  return "past";
}

export function FirstDropScene({ snapshot }: { snapshot: Snapshot<FirstDropState> }) {
  const { tree, daysArray, dropNumber, currentIndex, result } = snapshot.state;
  const label = snapshot.label;

  const allNodes = useMemo(() => collectTreeNodes(tree), [tree]);
  const inTreeIndices = useMemo(() => collectIndices(tree), [tree]);
  const { positions, width, height } = useMemo(
    () => layoutTree(tree),
    [tree],
  );
  const edges = useMemo(() => buildEdges(positions), [positions]);

  const labelRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (label === labelRef.current) return;
    labelRef.current = label;
    if (!label) return;
    void ensureAudioRunning();
    if (label === "step" && currentIndex != null) {
      const v = daysArray[currentIndex];
      playNoteForValue(v, 0, MAX_TEMP);
      playTone(659.25, 80);
    } else if (label === "done") {
      playSuccess();
    }
  }, [label, currentIndex, daysArray]);

  const justAddedIndex = label === "step" ? currentIndex : null;
  const isInit = label === "init" || label === undefined;
  const isDone = label === "done";

  const statusText = isInit
    ? "ready · press play"
    : isDone
      ? `done · ${result.length} distance${result.length === 1 ? "" : "s"}`
      : label === "step" && currentIndex != null
        ? `inserting day ${currentIndex} (${daysArray[currentIndex]}°)`
        : "—";

  return (
    <div className="scene">
      <div className={styles.sceneContent}>
        <div className={styles.legend}>
          <span className={`${styles.legend__chip} ${styles["legend__chip--accent"]}`}>
            day {currentIndex ?? "—"} of {daysArray.length}
          </span>
          <span className={`${styles.legend__chip} ${styles["legend__chip--sorted"]}`}>
            tree · {allNodes.length} node{allNodes.length === 1 ? "" : "s"}
          </span>
          <span className={styles.legend__chip}>drop ≥ {dropNumber}°</span>
          <span className={styles.legend__chip}>{statusText}</span>
        </div>

        <div className={styles.daysRow}>
          <span className={styles.daysRow__label}>▸ days</span>
          <div
            className={styles.daysSquares}
            style={{ gridAutoColumns: `${DAY_SQUARE_SIZE}px` }}
          >
            {daysArray.map((temp, i) => {
              const status = dayStatus(i, currentIndex, inTreeIndices);
              const classes = [styles.daySquare];
              if (status === "past") classes.push(styles["daySquare--past"]);
              if (status === "future") classes.push(styles["daySquare--inTree"]);
              if (status === "current") classes.push(styles["daySquare--current"]);
              return (
                <div
                  key={`day-${i}-${status}`}
                  className={classes.join(" ")}
                  style={{ width: `${DAY_SQUARE_SIZE}px`, height: `${DAY_SQUARE_SIZE}px` }}
                >
                  <span className={styles.daySquare__index}>{i}</span>
                  <span className={styles.daySquare__value}>{temp}°</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.treeSection}>
          <span className={styles.treeSection__label}>▸ bst (key = temp)</span>
          <div className={styles.treeScroll}>
            {tree == null ? (
              <div className={styles.empty}>— empty —</div>
            ) : (
              <svg
                className={styles.treeSvg}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
              >
                {edges.map(({ from, to }, i) => {
                  const x1 = MARGIN_X + from.x + NODE_W / 2;
                  const y1 = MARGIN_Y + from.y + NODE_H;
                  const x2 = MARGIN_X + to.x + NODE_W / 2;
                  const y2 = MARGIN_Y + to.y;
                  const midY = (y1 + y2) / 2;
                  const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
                  return (
                    <path
                      key={`edge-${i}-${from.node.originalIndex}-${to.node.originalIndex}`}
                      d={d}
                      className={styles.treeEdge}
                    />
                  );
                })}
                {positions.map((p) => {
                  const n = p.node;
                  const isJustAdded = justAddedIndex === n.originalIndex;
                  const nodeClass = `${styles.treeNode} ${isJustAdded ? styles["treeNode--justAdded"] : ""}`;
                  return (
                    <g
                      key={`node-${n.originalIndex}`}
                      className={nodeClass}
                      transform={`translate(${MARGIN_X + p.x}, ${MARGIN_Y + p.y})`}
                    >
                      <rect
                        width={NODE_W}
                        height={NODE_H}
                        rx={4}
                        style={{
                          fill: "var(--bg-elev)",
                          stroke: "var(--border)",
                        }}
                      />
                      <text x={NODE_W / 2} y={NODE_H / 2 - 2} className={styles.treeNode__key}>
                        {n.key}°
                      </text>
                      <text x={NODE_W / 2} y={NODE_H - 6} className={styles.treeNode__index}>
                        d{n.originalIndex}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        <div className={styles.resultBlock}>
          <span className={styles.resultBlock__label}>▸ distances</span>
          <div className={styles.resultList}>
            {result.length === 0 ? (
              <span className={styles.empty}>— no answers yet —</span>
            ) : (
              result.map((distance, k) => {
                const day = k + (daysArray.length - result.length);
                const isLatest = isDone
                  ? false
                  : label === "step" && currentIndex === day;
                return (
                  <span
                    key={`result-${day}`}
                    className={`${styles.resultItem} ${isLatest ? styles["resultItem--latest"] : ""}`}
                  >
                    <span className={styles.resultItem__day}>d{day}</span>
                    <span className={styles.resultItem__arrow}>→</span>
                    <span className={styles.resultItem__value}>{distance}</span>
                  </span>
                );
              })
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <span className={styles.footer__label}>{label ?? "—"}</span>
          <span className={`${styles.footer__chip} ${styles["footer__chip--sorted"]}`}>
            {result.length} / {daysArray.length}
          </span>
          <span className={`${styles.footer__chip} ${styles["footer__chip--accent"]}`}>
            drop ≥ {dropNumber}°
          </span>
        </div>
      </div>
    </div>
  );
}