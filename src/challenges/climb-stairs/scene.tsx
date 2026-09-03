import { useMemo } from "react";
import type { Snapshot } from "@framework";
import type { ClimbStairsState } from "./algorithm";
import styles from "./scene.module.css";

const NODE_W = 44;
const NODE_H = 32;
const LEVEL_H = 72;
const LEAF_GAP = 12;
const MARGIN_X = 24;
const MARGIN_Y = 16;
const FOOTER_H = 40;

type TreeNode = {
  path: number[];
  steps: number;
  children: [TreeNode, TreeNode] | null;
  isLeaf: boolean;
  x: number;
  y: number;
  parent: TreeNode | null;
};

function stepsAt(path: number[], rootSteps: number) {
  return path.reduce((acc, jump) => acc - jump, rootSteps);
}

function buildTree(rootSteps: number, foundPaths: number[][]): TreeNode {
  const byPath = new Map<string, TreeNode>();
  const root: TreeNode = {
    path: [],
    steps: rootSteps,
    children: null,
    isLeaf: rootSteps === 0,
    x: 0,
    y: 0,
    parent: null,
  };
  byPath.set("", root);

  for (const path of foundPaths) {
    let node = root;
    for (let i = 0; i < path.length; i++) {
      const prefix = path.slice(0, i + 1);
      const key = prefix.join(",");
      let child = byPath.get(key);
      if (!child) {
        child = {
          path: prefix,
          steps: stepsAt(prefix, rootSteps),
          children: null,
          isLeaf: i === path.length - 1,
          x: 0,
          y: 0,
          parent: node,
        };
        const slot = prefix[prefix.length - 1];
        const existing = node.children;
        if (!existing) {
          node.children = [child, null as unknown as TreeNode];
        } else if (slot === 1) {
          existing[0] = child;
        } else {
          existing[1] = child;
        }
        byPath.set(key, child);
      }
      node = child;
    }
  }

  const leaves: TreeNode[] = [];
  const collectLeaves = (n: TreeNode) => {
    if (n.isLeaf) {
      leaves.push(n);
      return;
    }
    if (n.children) {
      if (n.children[0]) collectLeaves(n.children[0]);
      if (n.children[1]) collectLeaves(n.children[1]);
    }
  };
  collectLeaves(root);

  const leafSpacing = NODE_W + LEAF_GAP;
  for (let i = 0; i < leaves.length; i++) {
    leaves[i].x = i * leafSpacing;
    leaves[i].y = depthOf(leaves[i]) * LEVEL_H;
  }

  for (let i = leaves.length - 1; i >= 0; i--) {
    let n = leaves[i].parent;
    while (n && n.x === 0 && n !== root) {
      placeInternal(n, leafSpacing);
      n = n.parent;
    }
  }
  placeInternal(root, leafSpacing);

  function depthOf(node: TreeNode): number {
    return node.path.length;
  }

  function placeInternal(node: TreeNode, spacing: number) {
    if (!node.children || !node.children[0]) return;
    const left = node.children[0];
    const right = node.children[1] ?? node.children[0];
    const cx = (left.x + right.x) / 2;
    node.x = cx;
    node.y = depthOf(node) * LEVEL_H;
  }

  return root;
}

function pathKey(path: number[]) {
  return path.join(",");
}

export function ClimbStairsScene({ snapshot }: { snapshot: Snapshot<ClimbStairsState> }) {
  const { steps, total, foundPaths, path } = snapshot.state;
  const label = snapshot.label;

  const tree = useMemo(() => buildTree(steps, foundPaths), [steps, foundPaths]);

  const allNodes: TreeNode[] = [];
  const walk = (n: TreeNode) => {
    allNodes.push(n);
    if (n.children) {
      if (n.children[0]) walk(n.children[0]);
      if (n.children[1]) walk(n.children[1]);
    }
  };
  walk(tree);

  const maxX = allNodes.reduce((m, n) => Math.max(m, n.x), 0);
  const maxDepth = allNodes.reduce((m, n) => Math.max(m, n.path.length), 0);
  const svgW = MARGIN_X * 2 + maxX + NODE_W + 8;
  const topPad = MARGIN_Y + 14;
  const svgH = topPad + (maxDepth + 1) * LEVEL_H + MARGIN_Y + FOOTER_H + 60;

  const currentPathKey = pathKey(path);

  const isInit = label === "init" || label === undefined;
  const isDone = label === "done";
  const isFound = label === "addingToTotal";
  const isTry = label === "try 1" || label === "try 2";

  const labelBadge = label ?? "—";
  const statusText = isInit
    ? "ready"
    : isFound
      ? `+1 path (${total} found)`
      : isDone
        ? "done"
        : isTry
          ? `branching ${label}`
          : "exploring";

  const pathStr = path.join(",");
  const parentPathStr = path.slice(0, -1).join(",");

  const edges: Array<{ from: TreeNode; to: TreeNode; choice: 1 | 2; active: boolean }> = [];
  const collectEdges = (n: TreeNode) => {
    if (n.children) {
      for (let i = 0; i < 2; i++) {
        const c = n.children[i];
        if (!c) continue;
        const choice = (i === 0 ? 1 : 2) as 1 | 2;
        const fromKey = pathKey(n.path);
        const toKey = pathKey(c.path);
        const active =
          !isInit &&
          fromKey === parentPathStr &&
          toKey === pathStr;
        edges.push({ from: n, to: c, choice, active });
        collectEdges(c);
      }
    }
  };
  collectEdges(tree);

  const nodeFill = (n: TreeNode): string => {
    if (n.isLeaf) return "rgba(80, 250, 123, 0.18)";
    if (!isInit && pathKey(n.path) === currentPathKey) return "rgba(255, 121, 198, 0.22)";
    return "var(--bg-elev)";
  };

  const nodeBorder = (n: TreeNode): string => {
    if (n.isLeaf) return "var(--sorted)";
    if (!isInit && pathKey(n.path) === currentPathKey) return "var(--accent)";
    return "var(--border)";
  };

  const nodeText = (n: TreeNode): string => {
    return String(n.steps);
  };

  const nodeLabel = (n: TreeNode): string => {
    if (n.path.length === 0) return "n";
    return n.path.map((j) => `+${j}`).join("");
  };

  return (
    <div className="scene" style={{ minHeight: `${Math.max(440, svgH)}px` }}>
      <div className={styles.sceneContent}>
        <div className={styles.legend}>
          <span className={`${styles.legend__chip} ${styles["legend__chip--accent"]}`}>
            {steps} steps
          </span>
          <span className={`${styles.legend__chip} ${styles["legend__chip--sorted"]}`}>
            {total} path{total === 1 ? "" : "s"} found
          </span>
          <span className={styles.legend__chip}>
            {allNodes.length} node{allNodes.length === 1 ? "" : "s"} · depth {maxDepth + 1}
          </span>
        </div>

        <div className={styles.treeScroll}>
          <svg
            className={styles.treeSvg}
            width={svgW}
            height={topPad + (maxDepth + 1) * LEVEL_H + MARGIN_Y}
            viewBox={`0 0 ${svgW} ${topPad + (maxDepth + 1) * LEVEL_H + MARGIN_Y}`}
          >
            {edges.map(({ from, to, choice, active }, i) => {
              const x1 = MARGIN_X + from.x + NODE_W / 2;
              const y1 = topPad + from.y + NODE_H;
              const x2 = MARGIN_X + to.x + NODE_W / 2;
              const y2 = topPad + to.y;
              const midY = (y1 + y2) / 2;
              const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
              return (
                <g key={`edge-${i}`}>
                  <path
                    d={d}
                    className={`${styles.edge} ${active ? styles["edge--active"] : ""}`}
                  />
                  <text
                    x={(x1 + x2) / 2 + (choice === 1 ? -6 : 6)}
                    y={midY}
                    className={styles.edgeLabel}
                    textAnchor="middle"
                  >
                    +{choice}
                  </text>
                </g>
              );
            })}

            {allNodes.map((n) => {
              const x = MARGIN_X + n.x;
              const y = topPad + n.y;
              const fill = nodeFill(n);
              const stroke = nodeBorder(n);
              const isCurrent = pathKey(n.path) === currentPathKey && !isInit;
              const isLeaf = n.isLeaf;
              return (
                <g
                  key={`node-${pathKey(n.path)}`}
                  className={`${styles.node} ${isCurrent ? styles["node--current"] : ""} ${isLeaf ? styles["node--leaf"] : ""}`}
                >
                  <rect
                    x={x}
                    y={y}
                    width={NODE_W}
                    height={NODE_H}
                    rx={4}
                    style={{ fill, stroke }}
                  />
                  <text
                    x={x + NODE_W / 2}
                    y={y + NODE_H / 2 + 5}
                    className={styles.nodeText}
                    textAnchor="middle"
                  >
                    {nodeText(n)}
                  </text>
                  <text
                    x={x + NODE_W / 2}
                    y={y - 6}
                    className={styles.nodeSubLabel}
                    textAnchor="middle"
                  >
                    {nodeLabel(n)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className={styles.footer}>
          <span className={styles.footer__label}>{labelBadge}</span>
          <span
            className={`${styles.footer__chip} ${isDone ? styles["footer__chip--sorted"] : styles["footer__chip--accent"]}`}
          >
            {statusText}
          </span>
          <span className={styles.footer__chip}>
            n={steps} · total={total}
          </span>
        </div>
      </div>
    </div>
  );
}