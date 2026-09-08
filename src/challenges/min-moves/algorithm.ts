import { TracedAlgorithm } from "@framework";

export interface MinMovesInput {
  initial: string,
  goal: string,
}

export type RotationDirection = "up" | "down";

export interface MinMovesState {
  initial: string,
  goal: string,
  current: string,
  total: number,
  directions: RotationDirection[],
}

export class MinMoves extends TracedAlgorithm<MinMovesInput, MinMovesState> {
  protected initialState(input: MinMovesInput): MinMovesState {
    return {
      initial: input.initial,
      goal: input.goal,
      current: input.initial,
      total: 0,
      directions: [],
    };
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


    for(let i = 0; i < this.currentState.current.length; i++) {
      let currentItem = Number.parseInt(this.currentState.current[i]);
      let goalItem = Number.parseInt(this.currentState.goal[i]);

      this.currentState.total += compare(currentItem, goalItem);

      const forward = (goalItem - currentItem + 10) % 10;
      const backward = (currentItem - goalItem + 10) % 10;
      this.currentState.directions.push(forward <= backward ? "up" : "down");

      const direction = this.currentState.directions[i];
      const delta = direction === "up" ? 1 : -1;
      for (let step = 0; step < compare(currentItem, goalItem); step++) {
        const nextVal = (Number.parseInt(this.currentState.current[i]) + delta + 10) % 10;
        this.currentState.current =
          this.currentState.current.slice(0, i) +
          String(nextVal) +
          this.currentState.current.slice(i + 1);
        this.snapshot(`rotate-${i}-${step}`);
      }
    }

    return this.currentState.total;
  }
}