import { TracedAlgorithm } from "@framework";

export interface ReorderInput {
  arrayA: string[],
  arrayB: number[],
}

export interface ReorderState {
  currentIndexValue: number,
  currentStrValue: string,
  arrayA: string[],
  arrayB: number[],
  visited: number[]
}

export class Reorder extends TracedAlgorithm<ReorderInput, ReorderState> {
  protected initialState(input: ReorderInput): ReorderState {
    return {
      arrayA: input.arrayA,
      arrayB: input.arrayB,
      currentIndexValue: -1,
      currentStrValue: '',
      visited: []
    } as ReorderState;
  }

  run(): string[] {
    this.currentState.visited = [];
    this.currentState.currentStrValue = this.currentState.arrayA[0];
    this.currentState.currentIndexValue = this.currentState.arrayB[0];

    for (let i = 0; i < this.currentState.arrayA.length; i++) {
      if (this.currentState.visited.includes(this.currentState.currentIndexValue)) {
        this.snapshot('foundCycle');
        let firstNotVisited = 0;

        for (let j = 0; j < this.currentState.arrayA.length; j++) {
          if (!this.currentState.visited.includes(j)) {
            firstNotVisited = j;
          }
        }

        this.currentState.currentStrValue = this.currentState.arrayA[firstNotVisited];
        this.currentState.currentIndexValue = this.currentState.arrayB[firstNotVisited];
        this.snapshot('findNewStartingPoint');
      }

      const dest = this.currentState.currentIndexValue;
      const tempStr = this.currentState.arrayA[dest];
      const tempIndex = this.currentState.arrayB[dest];

      this.currentState.arrayA[dest] = this.currentState.currentStrValue;
      this.currentState.arrayB[dest] = dest;

      this.currentState.visited.push(dest);

      this.currentState.currentStrValue = tempStr;
      this.currentState.currentIndexValue = tempIndex;

      this.snapshot('swapped');
    }

    return this.currentState.arrayA;
  }
}
