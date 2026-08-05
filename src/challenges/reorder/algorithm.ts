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
  visited: Map<number, boolean>
}

export class Reorder extends TracedAlgorithm<ReorderInput, ReorderState> {
  protected initialState(input: ReorderInput): ReorderState { 
    return {
      arrayA: input.arrayA,
      arrayB: input.arrayB,
      currentIndexValue: -1,
      currentStrValue: '',
      visited: new Map<number, boolean>()
    } as ReorderState;
  }

  run(): string[] {
    this.currentState.visited = new Map();
    this.currentState.currentStrValue = this.currentState.arrayA[0];
    this.currentState.currentIndexValue = this.currentState.arrayB[0];

    for (let i = 0; i < this.currentState.arrayA.length; i++) {
      if (this.currentState.visited.get(this.currentState.currentIndexValue)) {
        this.snapshot('foundCycle')
        let firstNotVisited = 0;

        for (let j = 0; j < this.currentState.arrayA.length; j++) {
          if (!this.currentState.visited.get(j)) {
            firstNotVisited = j;
          }
        }

        this.currentState.currentStrValue = this.currentState.arrayA[firstNotVisited];
        this.currentState.currentIndexValue = this.currentState.arrayB[firstNotVisited];
        this.snapshot('findNewStartingPoint')
      }

      let tempStr = this.currentState.arrayA[this.currentState.currentIndexValue];
      let tempIndex = this.currentState.arrayB[this.currentState.currentIndexValue];

      this.currentState.arrayA[this.currentState.currentIndexValue] = this.currentState.currentStrValue;
      this.currentState.arrayB[this.currentState.currentIndexValue] = this.currentState.currentIndexValue;

      this.currentState.visited.set(this.currentState.currentIndexValue, true);

      this.currentState.currentStrValue = tempStr;
      this.currentState.currentIndexValue = tempIndex;

      this.snapshot('swapped')
    }

    return this.currentState.arrayA;
  }
}
