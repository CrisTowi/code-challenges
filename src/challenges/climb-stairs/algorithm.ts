import { TracedAlgorithm } from "@framework";

export interface ClimbStairsInput {
  steps: number
}

export interface ClimbStairsState {
  steps: number,
  total: number,
  path: number[],
  foundPaths: number[][],
}

export class ClimbStairs extends TracedAlgorithm<ClimbStairsInput, ClimbStairsState> {
  protected initialState(input: ClimbStairsInput): ClimbStairsState {
    return {
      steps: input.steps,
      total: 0,
      path: [],
      foundPaths: [],
    } as ClimbStairsState;
  }

  run(): number {
    const _climb = (steps: number) => {
      if (steps === 0) {
        this.currentState.foundPaths.push([...this.currentState.path]);
        this.currentState.total += 1;
        this.snapshot('addingToTotal');
        return;
      } else if (steps < 0) {
        return;
      }

      // 1 step
      this.currentState.path.push(1);
      this.snapshot("try 1");
      _climb(steps - 1);
      this.currentState.path.pop();

      // 2 steps
      this.currentState.path.push(2);
      this.snapshot("try 2");
      _climb(steps - 2);
      this.currentState.path.pop();
    };

    _climb(this.currentState.steps);
    this.snapshot("done");

    return this.currentState.total;
  }
}
