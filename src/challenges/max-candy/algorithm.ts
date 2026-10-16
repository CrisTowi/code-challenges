import { TracedAlgorithm } from "@framework";

export interface MaxCandyInput {
  input: number[];
}

export interface MaxCandyState {
  input: number[];
  // viz-only: start
  kidPosition: number | null;
  collectedHouses: number[];
  totalCandies: number;
  phase: "init" | "walking" | "done";
  // viz-only: end
}

export class MaxCandy extends TracedAlgorithm<MaxCandyInput, MaxCandyState> {
  protected initialState(input: MaxCandyInput): MaxCandyState {
    return {
      input: input.input,
      // viz-only: start
      kidPosition: null,
      collectedHouses: [],
      totalCandies: 0,
      phase: "init",
      // viz-only: end
    };
  }

  run(): number {
    const _calculateMaxCandy = (max: number, index: number): number => {
      let initial = this.currentState.input[index];

      for (let i = index + 2; i < this.currentState.input.length; i++) {
        max = Math.max(max, _calculateMaxCandy(max + this.currentState.input[index], i));
      }

      return Math.max(initial, max);
    };

    let max = 0;

    for (let i = 0; i < this.currentState.input.length; i++) {
      max = Math.max(max, _calculateMaxCandy(0, i));
    }

    // viz-only: start — reconstruct the optimal path and emit snapshots for the scene
    const n = this.currentState.input.length;
    const dp = new Array(n + 2).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      dp[i] = Math.max(dp[i + 1], this.currentState.input[i] + dp[i + 2]);
    }
    const path: number[] = [];
    let pos = 0;
    while (pos < n) {
      if (this.currentState.input[pos] + dp[pos + 2] >= dp[pos + 1]) {
        path.push(pos);
        pos += 2;
      } else {
        pos += 1;
      }
    }

    this.currentState.phase = "walking";
    for (const houseIdx of path) {
      this.currentState.kidPosition = houseIdx;
      this.currentState.collectedHouses = [...this.currentState.collectedHouses, houseIdx];
      this.currentState.totalCandies += this.currentState.input[houseIdx];
      this.snapshot("visit");
    }
    this.currentState.phase = "done";
    this.snapshot("done");
    // viz-only: end

    return max;
  }
}
