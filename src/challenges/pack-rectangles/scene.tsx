import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Snapshot } from "@framework";
import {
  ensureAudioRunning,
  playFailure,
  playSuccess,
  playWoodKnock,
  setMuted,
  isMuted,
} from "@framework/audio";
import type { PackRectanglesState } from "./algorithm";
import styles from "./scene.module.css";

type Placement = {
  pieceId: number;
  x: number;
  y: number;
  rotated: boolean;
};

type PieceState = {
  id: number;
  rotated: boolean;
  placed: boolean;
  invalidUntil: number;
};

const BOARD_MAX_PX = 520;
const CELL_MIN_PX = 26;
const CELL_MAX_PX = 44;
const TRAY_MIN_H = 110;
const PIECE_MIN_DIM = 24;

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

function pickCellSize(containerW: number, containerH: number): number {
  const longSide = Math.max(containerW, containerH);
  const fromBoard = BOARD_MAX_PX / longSide;
  return Math.max(CELL_MIN_PX, Math.min(CELL_MAX_PX, Math.floor(fromBoard)));
}

function rectDims(p: { rectWidth: number; rectHeight: number }, rotated: boolean) {
  return rotated
    ? { w: p.rectHeight, h: p.rectWidth }
    : { w: p.rectWidth, h: p.rectHeight };
}

function key(x: number, y: number, w: number) {
  return y * w + x;
}

function canPlace(
  occupied: Set<number>,
  x: number,
  y: number,
  w: number,
  h: number,
  containerW: number,
  containerH: number,
): boolean {
  if (x < 0 || y < 0 || x + w > containerW || y + h > containerH) return false;
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      if (occupied.has(key(xx, yy, containerW))) return false;
    }
  }
  return true;
}

function cellsOf(
  x: number,
  y: number,
  w: number,
  h: number,
  containerW: number,
): number[] {
  const out: number[] = [];
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      out.push(key(xx, yy, containerW));
    }
  }
  return out;
}

const SNAP_RADIUS = 4;

/**
 * Find the grid cell where a piece of (w, h) should land.
 *
 *  1. Round the pointer position to the nearest cell.
 *  2. Clamp into the valid range so the piece can never extend off the board
 *     (this was the cause of the "last piece can't be placed" bug — when the
 *     pointer drifted past the edge, the rounded cell was off-grid and the
 *     inside-check bounced the piece back to the tray).
 *  3. If the clamped cell is occupied, spiral outward looking for the nearest
 *     free cell that fits — gives the user a "magnetic" feel when aiming
 *     near the last free slot.
 */
function findSnapTarget(
  occupied: Set<number>,
  pointerCellX: number,
  pointerCellY: number,
  w: number,
  h: number,
  containerW: number,
  containerH: number,
  radius: number = SNAP_RADIUS,
): { x: number; y: number; valid: boolean } {
  const cx = Math.max(0, Math.min(containerW - w, pointerCellX));
  const cy = Math.max(0, Math.min(containerH - h, pointerCellY));
  const ix = Math.round(cx);
  const iy = Math.round(cy);

  if (canPlace(occupied, ix, iy, w, h, containerW, containerH)) {
    return { x: ix, y: iy, valid: true };
  }

  for (let r = 1; r <= radius; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const nx = ix + dx;
        const ny = iy + dy;
        if (nx < 0 || ny < 0 || nx + w > containerW || ny + h > containerH) continue;
        if (canPlace(occupied, nx, ny, w, h, containerW, containerH)) {
          return { x: nx, y: ny, valid: true };
        }
      }
    }
  }

  return { x: ix, y: iy, valid: false };
}

export function PackRectanglesScene({
  snapshot,
}: {
  snapshot: Snapshot<PackRectanglesState>;
}) {
  const { containerWidth, containerHeight, rectWidth, rectHeight, count } =
    snapshot.state;

  const unit = useMemo(
    () => gcd(gcd(containerWidth, containerHeight), gcd(rectWidth, rectHeight)),
    [containerWidth, containerHeight, rectWidth, rectHeight],
  );
  const gridW = Math.max(1, Math.round(containerWidth / unit));
  const gridH = Math.max(1, Math.round(containerHeight / unit));
  const pieceCellsW = Math.max(1, Math.round(rectWidth / unit));
  const pieceCellsH = Math.max(1, Math.round(rectHeight / unit));

  const cellSize = pickCellSize(gridW, gridH);
  const boardPxW = gridW * cellSize;
  const boardPxH = gridH * cellSize;
  const piecePxW = Math.max(PIECE_MIN_DIM, pieceCellsW * cellSize);
  const piecePxH = Math.max(PIECE_MIN_DIM, pieceCellsH * cellSize);
  const pieceRotPxW = Math.max(PIECE_MIN_DIM, pieceCellsH * cellSize);
  const pieceRotPxH = Math.max(PIECE_MIN_DIM, pieceCellsW * cellSize);

  const targetCount = Math.max(0, count | 0);

  const [pieces, setPieces] = useState<PieceState[]>(() =>
    Array.from({ length: targetCount }, (_, i) => ({
      id: i,
      rotated: false,
      placed: false,
      invalidUntil: 0,
    })),
  );

  const [placements, setPlacements] = useState<Placement[]>([]);
  const [heldId, setHeldId] = useState<number | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [preview, setPreview] = useState<
    | { valid: boolean; x: number; y: number; w: number; h: number }
    | null
  >(null);
  const [solved, setSolved] = useState(false);
  const [started, setStarted] = useState(false);

  // Reset internal game state when the snapshot's input dimensions change
  // (e.g. user picked a different example). Count changes also reset.
  useEffect(() => {
    setPieces(
      Array.from({ length: targetCount }, (_, i) => ({
        id: i,
        rotated: false,
        placed: false,
        invalidUntil: 0,
      })),
    );
    setPlacements([]);
    setHeldId(null);
    setPointer(null);
    setPreview(null);
    setSolved(false);
    setStarted(false);
  }, [targetCount, containerWidth, containerHeight, rectWidth, rectHeight]);

  // Occupied cells derived from placements
  const occupied = useMemo(() => {
    const set = new Set<number>();
    for (const p of placements) {
      const dims = rectDims(
        { rectWidth: pieceCellsW, rectHeight: pieceCellsH },
        p.rotated,
      );
      for (const k of cellsOf(p.x, p.y, dims.w, dims.h, gridW)) {
        set.add(k);
      }
    }
    return set;
  }, [placements, gridW, pieceCellsW, pieceCellsH]);

  // Detect win
  useEffect(() => {
    if (targetCount > 0 && placements.length === targetCount) {
      setSolved(true);
      void ensureAudioRunning();
      playSuccess();
    }
  }, [placements.length, targetCount]);

  const boardRef = useRef<HTMLDivElement | null>(null);

  // ---- Drag handling ----------------------------------------------------
  const onPointerDownPiece = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, pieceId: number) => {
      if (!started) return;
      const piece = pieces.find((p) => p.id === pieceId);
      if (!piece || piece.placed) return;
      void ensureAudioRunning();
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setHeldId(pieceId);
      setPointer({ x: e.clientX, y: e.clientY });
      setPreview(null);
    },
    [pieces, started],
  );

  const onPointerMovePiece = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, pieceId: number) => {
      if (heldId !== pieceId) return;
      setPointer({ x: e.clientX, y: e.clientY });

      // Compute preview against the board
      const board = boardRef.current;
      if (!board) {
        setPreview(null);
        return;
      }
      const rect = board.getBoundingClientRect();
      const piece = pieces.find((p) => p.id === pieceId);
      if (!piece) return;
      const dims = rectDims(
        { rectWidth: pieceCellsW, rectHeight: pieceCellsH },
        piece.rotated,
      );
      const pxW = dims.w * cellSize;
      const pxH = dims.h * cellSize;

      // Anchor at the centre of the piece under the pointer.
      const localX = e.clientX - rect.left - pxW / 2;
      const localY = e.clientY - rect.top - pxH / 2;
      const cellX = localX / cellSize;
      const cellY = localY / cellSize;

      const inside =
        localX >= 0 &&
        localY >= 0 &&
        localX + pxW <= rect.width &&
        localY + pxH <= rect.height;

      if (!inside) {
        setPreview(null);
        return;
      }

      const snap = findSnapTarget(
        occupied,
        cellX,
        cellY,
        dims.w,
        dims.h,
        gridW,
        gridH,
      );
      setPreview({ valid: snap.valid, x: snap.x, y: snap.y, w: dims.w, h: dims.h });
    },
    [heldId, pieces, cellSize, pieceCellsW, pieceCellsH, occupied, gridW, gridH],
  );

  const onPointerUpPiece = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, pieceId: number) => {
      if (heldId !== pieceId) {
        setHeldId(null);
        setPointer(null);
        setPreview(null);
        return;
      }
      const piece = pieces.find((p) => p.id === pieceId);
      const board = boardRef.current;
      const rect = board?.getBoundingClientRect();

      if (piece && rect) {
        const dims = rectDims(
          { rectWidth: pieceCellsW, rectHeight: pieceCellsH },
          piece.rotated,
        );
        const pxW = dims.w * cellSize;
        const pxH = dims.h * cellSize;
        const localX = e.clientX - rect.left - pxW / 2;
        const localY = e.clientY - rect.top - pxH / 2;
        const cellX = localX / cellSize;
        const cellY = localY / cellSize;

        const inside =
          localX >= 0 &&
          localY >= 0 &&
          localX + pxW <= rect.width &&
          localY + pxH <= rect.height;

        const snap = inside
          ? findSnapTarget(
              occupied,
              cellX,
              cellY,
              dims.w,
              dims.h,
              gridW,
              gridH,
            )
          : { x: 0, y: 0, valid: false };

        if (inside && snap.valid) {
          // Place it.
          setPlacements((prev) => [
            ...prev,
            { pieceId, x: snap.x, y: snap.y, rotated: piece.rotated },
          ]);
          setPieces((prev) =>
            prev.map((p) =>
              p.id === pieceId ? { ...p, placed: true } : p,
            ),
          );
          void ensureAudioRunning();
          playWoodKnock();
        } else {
          // Snap back to tray, flash invalid.
          void ensureAudioRunning();
          playFailure();
          setPieces((prev) =>
            prev.map((p) =>
              p.id === pieceId
                ? { ...p, invalidUntil: Date.now() + 350 }
                : p,
            ),
          );
        }
      }

      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* no-op: already released */
      }
      setHeldId(null);
      setPointer(null);
      setPreview(null);
    },
    [heldId, pieces, cellSize, pieceCellsW, pieceCellsH, occupied, gridW, gridH],
  );

  // Rotate helpers --------------------------------------------------------
  const rotatePiece = useCallback((pieceId: number) => {
    setPieces((prev) =>
      prev.map((p) =>
        p.id === pieceId && !p.placed ? { ...p, rotated: !p.rotated } : p,
      ),
    );
  }, []);

  const onPointerDownRotate = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, pieceId: number) => {
      // Prevent the parent piece's drag from starting.
      e.stopPropagation();
      e.preventDefault();
      void ensureAudioRunning();
      rotatePiece(pieceId);
    },
    [rotatePiece],
  );

  // Keyboard: R rotates the held piece (if any)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "r" && e.key !== "R") return;
      if (heldId == null) return;
      e.preventDefault();
      rotatePiece(heldId);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [heldId, rotatePiece]);

  // Reset ------------------------------------------------------------------
  const reset = useCallback(() => {
    setPieces(
      Array.from({ length: targetCount }, (_, i) => ({
        id: i,
        rotated: false,
        placed: false,
        invalidUntil: 0,
      })),
    );
    setPlacements([]);
    setHeldId(null);
    setPointer(null);
    setPreview(null);
    setSolved(false);
    // Keep `started` true: reset = "play again with the same board", no need
    // to re-show the Start overlay.
  }, [targetCount]);

  // Start: gate the whole game behind one button until the user is ready.
  const start = useCallback(() => {
    void ensureAudioRunning();
    setStarted(true);
  }, []);

  // Style variables for board/tray
  const sceneStyle = useMemo<React.CSSProperties>(
    () =>
      ({
        "--cell-size": `${cellSize}px`,
        "--board-w": `${boardPxW}px`,
        "--board-h": `${boardPxH}px`,
        "--tray-min-h": `${TRAY_MIN_H}px`,
      }) as React.CSSProperties,
    [cellSize, boardPxW, boardPxH],
  );

  // Tray pieces
  const trayPieces = pieces.filter((p) => !p.placed);

  // For the "currently held" piece we want it to render at the cursor (so it
  // is clearly being dragged), not at its tray slot. We hide the tray slot
  // for it and render a floating piece via pointer position.
  const heldPiece = heldId != null ? pieces.find((p) => p.id === heldId) : null;

  return (
    <div className="scene">
      <div className={styles.root} style={sceneStyle}>
        <div className={styles.header}>
          <span className={styles.header__title}>▸ pack the board</span>
          <div className={styles.header__chips}>
            <span className={`${styles.chip} ${styles["chip--accent"]}`}>
              target {targetCount}
            </span>
            <span className={`${styles.chip} ${styles["chip--settled"]}`}>
              ✓ {placements.length}/{targetCount}
            </span>
            <span className={`${styles.chip} ${styles["chip--wood"]}`}>
              {gridW}×{gridH} board · {pieceCellsW}×{pieceCellsH} piece
            </span>
            <button className="btn btn--icon" onClick={reset}>
              ⟲ reset
            </button>
          </div>
        </div>

        <div className={styles.boardWrap}>
          <div ref={boardRef} className={styles.board}>
            <div className={styles.boardGrid} aria-hidden />
            {/* Visible cell dots */}
            <div aria-hidden style={{ position: "absolute", inset: 0 }}>
              {Array.from({ length: gridW * gridH }).map((_, i) => {
                const x = i % gridW;
                const y = Math.floor(i / gridW);
                return (
                  <div
                    key={i}
                    className={styles.cell}
                    style={{
                      left: x * cellSize,
                      top: y * cellSize,
                      width: cellSize,
                      height: cellSize,
                    }}
                  />
                );
              })}
            </div>

            {/* Drop preview (yellow when valid, red when invalid) */}
            {preview && (
              <div
                className={`${styles.boardDropPreview} ${preview.valid ? "" : styles["boardDropPreview--invalid"]}`}
                style={{
                  left: preview.x * cellSize,
                  top: preview.y * cellSize,
                  width: preview.w * cellSize,
                  height: preview.h * cellSize,
                }}
              />
            )}

            {/* Placed pieces (rendered on the board) */}
            {placements.map((pl) => {
              const piece = pieces.find((p) => p.id === pl.pieceId);
              if (!piece) return null;
              const dims = rectDims(
                { rectWidth: pieceCellsW, rectHeight: pieceCellsH },
                pl.rotated,
              );
              const w = dims.w * cellSize;
              const h = dims.h * cellSize;
              const ppStyle = {
                "--pp-w": `${w}px`,
                "--pp-h": `${h}px`,
                left: pl.x * cellSize,
                top: pl.y * cellSize,
              } as React.CSSProperties;
              return (
                <div
                  key={pl.pieceId}
                  className={`${styles.placedPiece} ${styles.piece} ${styles["piece--placed"]}`}
                  style={ppStyle}
                >
                  <span className={styles.piece__label}>
                    {dims.w}×{dims.h}
                  </span>
                </div>
              );
            })}

            {solved && (
              <div className={styles.winBanner}>
                <div className={styles.winBanner__title}>▸ solved!</div>
                <div className={styles.winBanner__sub}>
                  all {targetCount} pieces placed
                </div>
                <button
                  className="btn btn--primary"
                  onClick={reset}
                  style={{ marginTop: "0.5rem" }}
                >
                  ⟲ play again
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.tray}>
          <span className={styles.trayLabel}>▸ tray</span>
          <div className={styles.trayInner}>
            {trayPieces.length === 0 && (
              <div className={styles.trayEmpty}>
                {targetCount === 0
                  ? "no pieces fit in this board"
                  : "all pieces placed"}
              </div>
            )}
            {trayPieces.map((p) => {
              const dims = rectDims(
                { rectWidth: pieceCellsW, rectHeight: pieceCellsH },
                p.rotated,
              );
              const wPx = dims.w === pieceCellsW ? piecePxW : pieceRotPxW;
              const hPx = dims.h === pieceCellsH ? piecePxH : pieceRotPxH;
              const invalid = Date.now() < p.invalidUntil;
              const isHeld = heldId === p.id;
              const pieceStyle = {
                "--piece-w": `${wPx}px`,
                "--piece-h": `${hPx}px`,
                // When held, hide in the tray; pointer drives position via the
                // floating piece below.
                opacity: isHeld ? 0 : 1,
              } as React.CSSProperties;
              return (
                <div
                  key={p.id}
                  className={`${styles.piece} ${invalid ? styles["piece--invalid"] : ""} ${isHeld ? styles["piece--dragging"] : ""}`}
                  style={pieceStyle}
                  onPointerDown={(e) => onPointerDownPiece(e, p.id)}
                  onPointerMove={(e) => onPointerMovePiece(e, p.id)}
                  onPointerUp={(e) => onPointerUpPiece(e, p.id)}
                  onPointerCancel={(e) => onPointerUpPiece(e, p.id)}
                >
                  <span className={styles.piece__label}>
                    {dims.w}×{dims.h}
                  </span>
                  <button
                    className={styles.rotateBtn}
                    onPointerDown={(e) => onPointerDownRotate(e, p.id)}
                    title="Rotate (R)"
                    aria-label="Rotate piece"
                  >
                    ↻
                  </button>
                </div>
              );
            })}

            {/* Floating held piece follows the pointer */}
            {heldPiece && pointer && (() => {
              const dims = rectDims(
                { rectWidth: pieceCellsW, rectHeight: pieceCellsH },
                heldPiece.rotated,
              );
              const wPx = dims.w === pieceCellsW ? piecePxW : pieceRotPxW;
              const hPx = dims.h === pieceCellsH ? piecePxH : pieceRotPxH;
              return (
                <div
                  className={`${styles.piece} ${styles["piece--dragging"]}`}
                  style={
                    {
                      "--piece-w": `${wPx}px`,
                      "--piece-h": `${hPx}px`,
                      position: "fixed",
                      left: pointer.x - wPx / 2,
                      top: pointer.y - hPx / 2,
                      zIndex: 100,
                      pointerEvents: "none",
                    } as React.CSSProperties
                  }
                >
                  <span className={styles.piece__label}>
                    {dims.w}×{dims.h}
                  </span>
                </div>
              );
            })()}
          </div>
        </div>

        {!started && (
          <div className={styles.startOverlay} role="dialog" aria-label="Start game">
            <div className={styles.startCard}>
              <div className={styles.startTitle}>▸ pack the board</div>
              <div className={styles.startSubtitle}>
                fit{" "}
                <span className={styles.startTarget}>{targetCount}</span>{" "}
                {targetCount === 1 ? "piece" : "pieces"} on a{" "}
                <span className={styles.startDims}>
                  {gridW}×{gridH}
                </span>{" "}
                board
              </div>
              <div className={styles.startMeta}>
                piece size{" "}
                <span className={styles.startDims}>
                  {pieceCellsW}×{pieceCellsH}
                </span>{" "}
                · rotate to fit
              </div>
              <button
                className={`btn btn--primary ${styles.startBtn}`}
                onClick={start}
                autoFocus
              >
                ▸ start
              </button>
              <div className={styles.startHint}>
                drag from the tray · <kbd>R</kbd> or the ↻ button to rotate
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { setMuted, isMuted };