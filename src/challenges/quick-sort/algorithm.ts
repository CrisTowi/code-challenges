import { TracedAlgorithm } from "@framework";

export interface QuickSortInput {
  numbers: number[];
}

export interface Bar {
  id: number;
  value: number;
}

export type QuickSortPhase =
  | "idle"
  | "start-partition"
  | "pick-pivot"
  | "compare"
  | "swap"
  | "pivot-placed"
  | "recurse"
  | "done";

export interface QuickSortState {
  bars: Bar[];
  pivotId: number | null;
  pivotValue: number | null;
  partitionRange: [number, number] | null;
  i: number | null;
  j: number | null;
  sortedIds: number[];
  callStack: Array<[number, number]>;
  phase: QuickSortPhase;
}

function swap(bars: Bar[], a: number, b: number): void {
  const tmp = bars[a];
  bars[a] = bars[b];
  bars[b] = tmp;
}

export class QuickSort extends TracedAlgorithm<QuickSortInput, QuickSortState> {
  protected initialState(input: QuickSortInput): QuickSortState {
    return {
      bars: input.numbers.map((value, id) => ({ id, value })),
      pivotId: null,
      pivotValue: null,
      partitionRange: null,
      i: null,
      j: null,
      sortedIds: [],
      callStack: [],
      phase: "idle",
    };
  }

  /**
   * Iterative Lomuto partitioning.
   *
   * The stack holds ranges of *positions* in `bars` that still need to be
   * partitioned. Each step pops a range, partitions it in place, marks the
   * final pivot position as sorted, and pushes the two sub-ranges back onto
   * the stack (if non-empty). The stack doubles as a visualization of
   * "how much recursion is pending", surfaced via `state.callStack`.
   */
  run(): void {
    const n = this.currentState.bars.length;
    if (n === 0) {
      this.snapshot("sorted");
      return;
    }
    if (n === 1) {
      this.currentState.sortedIds = [this.currentState.bars[0].id];
      this.currentState.phase = "done";
      this.snapshot("sorted");
      return;
    }

    const stack: Array<[number, number]> = [[0, n - 1]];
    this.currentState.callStack = stack.map(([lo, hi]) => [lo, hi]);
    this.snapshot(`init ▸ range [0..${n - 1}]`);

    while (stack.length > 0) {
      const [lo, hi] = stack.pop()!;
      this.currentState.callStack = stack.map(([lo, hi]) => [lo, hi]);

      // Already-sorted singletons get marked and skipped.
      if (lo === hi) {
        this.currentState.partitionRange = null;
        this.currentState.pivotId = null;
        this.currentState.pivotValue = null;
        this.currentState.i = null;
        this.currentState.j = null;
        if (!this.currentState.sortedIds.includes(this.currentState.bars[lo].id)) {
          this.currentState.sortedIds = [...this.currentState.sortedIds, this.currentState.bars[lo].id];
        }
        this.currentState.phase = "recurse";
        this.snapshot(`singleton at ${lo} ▸ sorted`);
        continue;
      }

      this.currentState.partitionRange = [lo, hi];
      this.currentState.i = lo - 1;
      this.currentState.j = lo;
      this.currentState.phase = "start-partition";
      this.snapshot(`partition [${lo}..${hi}]`);

      // Pivot = last element of the current range (Lomuto).
      const pivotIdx = hi;
      const pivotBar = this.currentState.bars[pivotIdx];
      this.currentState.pivotId = pivotBar.id;
      this.currentState.pivotValue = pivotBar.value;
      this.currentState.phase = "pick-pivot";
      this.snapshot(`pivot = ${pivotBar.value} at ${pivotIdx}`);

      // Scan j from lo to hi-1, growing the <pivot region.
      for (let j = lo; j < hi; j++) {
        this.currentState.j = j;
        const candidate = this.currentState.bars[j];
        this.currentState.phase = "compare";
        this.snapshot(`compare ${candidate.value} vs pivot ${pivotBar.value}`);

        if (candidate.value < pivotBar.value) {
          // Advance boundary, then swap candidate into the boundary slot.
          const newI: number = (this.currentState.i ?? lo - 1) + 1;
          this.currentState.i = newI;
          if (newI !== j) {
            swap(this.currentState.bars, newI, j);
            this.currentState.phase = "swap";
            this.snapshot(`swap → ${newI},${j}`);
          }
        }
      }

      // Place pivot: swap boundary+1 with the pivot slot. After this swap,
      // `boundary+1` is the pivot's final sorted position.
      const finalPivotIdx = (this.currentState.i ?? lo - 1) + 1;
      if (finalPivotIdx !== hi) {
        swap(this.currentState.bars, finalPivotIdx, hi);
      }
      this.currentState.partitionRange = null;
      this.currentState.pivotId = null;
      this.currentState.pivotValue = null;
      this.currentState.i = null;
      this.currentState.j = null;
      this.currentState.phase = "pivot-placed";
      if (!this.currentState.sortedIds.includes(pivotBar.id)) {
        this.currentState.sortedIds = [...this.currentState.sortedIds, pivotBar.id];
      }
      this.snapshot(`pivot ${pivotBar.value} placed at ${finalPivotIdx}`);

      // Push sub-ranges onto the stack. Push the larger range first so the
      // smaller is processed next — this keeps the callStack view shallow
      // and matches what a recursive implementation would do.
      const left: [number, number] | null =
        lo < finalPivotIdx - 1 ? [lo, finalPivotIdx - 1] : null;
      const right: [number, number] | null =
        finalPivotIdx + 1 < hi ? [finalPivotIdx + 1, hi] : null;

      if (right) stack.push(right);
      if (left) stack.push(left);

      // Singles adjacent to the placed pivot are also in their final spot.
      if (lo === finalPivotIdx - 1) {
        const id = this.currentState.bars[lo].id;
        if (!this.currentState.sortedIds.includes(id)) {
          this.currentState.sortedIds = [...this.currentState.sortedIds, id];
        }
      }
      if (finalPivotIdx + 1 === hi) {
        const id = this.currentState.bars[hi].id;
        if (!this.currentState.sortedIds.includes(id)) {
          this.currentState.sortedIds = [...this.currentState.sortedIds, id];
        }
      }

      this.currentState.callStack = stack.map(([lo, hi]) => [lo, hi]);
      this.currentState.phase = "recurse";
      this.snapshot(
        `recurse ▸ push ${left ? `[${left[0]}..${left[1]}]` : "∅"} + ${right ? `[${right[0]}..${right[1]}]` : "∅"}`,
      );
    }

    this.currentState.phase = "done";
    this.snapshot("sorted");
  }
}