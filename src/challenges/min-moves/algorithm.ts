import { TracedAlgorithm } from "@framework";

export interface MinMovesInput {
  initial: string,
  goal: string,
}

export interface MinMovesState {
  goal: string,
  current: string,
  total: number,
  index: number,
}

export class MinMoves extends TracedAlgorithm<MinMovesInput, MinMovesState> {
  protected initialState(input: MinMovesInput): MinMovesState {
    return {
      goal: input.goal,
      current: input.initial,
      total: 0,
    } as MinMovesState;
  }

  run(): number {
    const compare = (current: number, goal: number) => {
      if (goal < current) {
        return Math.min(9 - current + goal + 1, current - goal);
      } else if (goal > current) {
        return Math.min(9 - goal + current + 1, goal - current);
      } else {
        return 0;
      }
    }


    for(this.currentState.index = 0; this.currentState.index < this.currentState.current.length; this.currentState.index++) {
      const i = this.currentState.index;

      this.snapshot('moveToNewIndex');

      let currentItem = Number.parseInt(this.currentState.current[i]);
      let goalItem = Number.parseInt(this.currentState.goal[i]);

      const comp = compare(currentItem, goalItem);
      this.snapshot('compareValues');

      this.currentState.total += comp;
      this.snapshot('updateTotal');
    }

    return this.currentState.total;
  }
}
