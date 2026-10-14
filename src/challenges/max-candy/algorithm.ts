import { TracedAlgorithm } from "@framework";

export interface MaxCandyInput {
  input: number[];
}

export interface MaxCandyState {
  input: number[];
}

export class MaxCandy extends TracedAlgorithm<MaxCandyInput, MaxCandyState> {
  protected initialState(input: MaxCandyInput): MaxCandyState {
    return {
      input: input.input
    } as MaxCandyState;
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

    return max;
  }
}
