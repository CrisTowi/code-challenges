import { TracedAlgorithm } from "@framework";

export interface ClimbStairsInput {
  steps: number
}

export interface ClimbStairsState {
  steps: number,
  total: number,
}

export class ClimbStairs extends TracedAlgorithm<ClimbStairsInput, ClimbStairsState> {
  protected initialState(input: ClimbStairsInput): ClimbStairsState {
    return {
      steps: input.steps,
      total: 0,
    } as ClimbStairsState;
  }

  run(): number {
    const _climb = (steps: number) => {
      if (steps === 0) {
        this.currentState.total += 1;
        this.snapshot('addingToTotal');
        return;
      } else if (steps < 0) {
        return;
      }

      // 1 step
      _climb(steps - 1);
      // 2 steps
      _climb(steps - 2);
    };

    _climb(this.currentState.steps);

    return this.currentState.total;
  }
}
