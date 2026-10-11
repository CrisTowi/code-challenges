import { TracedAlgorithm } from "@framework";

export interface MinutesUntilApocalypseInput {
  town: number[][];
}

export interface MinutesUntilApocalypseState {
  town: number[][];
  minutes: number;
}

export class MinutesUntilApocalypse extends TracedAlgorithm<MinutesUntilApocalypseInput, MinutesUntilApocalypseState> {
  protected initialState(input: MinutesUntilApocalypseInput): MinutesUntilApocalypseState {
    return {
      town: input.town,
      minutes: 0,
    } as MinutesUntilApocalypseState;
  }

  printTown(): void {
    for (let y = 0; y < this.currentState.town.length; y++) {
      console.log(this.currentState.town[y].join(', '));
    }
  }

  isNotHuman(x: number, y: number): boolean {
    return (
      x >= this.currentState.town[0].length ||
      x < 0 ||
      y >= this.currentState.town.length ||
      y < 0 ||
      this.currentState.town[y][x] === 0 ||
      this.currentState.town[y][x] === 2 ||
      this.currentState.town[y][x] === 3
    );
  }

  run(): number {
    let queue: number[][] = [];

    for (let y = 0; y < this.currentState.town.length; y++) {
      for (let x = 0; x < this.currentState.town[y].length; x++) {
        if (this.currentState.town[y][x] === 2) {
          queue.push([x, y]);
        }
      }
    }

    let minutes = 0;

    while (queue.length > 0) {
      let subQueue = [];

      for (let i = 0; i < queue.length; i++) {
        let [x, y] = queue[i];
        this.currentState.town[y][x] = 3;
  
        if (!this.isNotHuman(x - 1, y)) {
          this.currentState.town[y][x - 1] = 2;
          subQueue.push([x - 1, y]);
        }
        if (!this.isNotHuman(x + 1, y)) {
          this.currentState.town[y][x + 1] = 2;  
          subQueue.push([x + 1, y]);
        }
        if (!this.isNotHuman(x, y - 1)) {
          this.currentState.town[y - 1][x] = 2;  
          subQueue.push([x, y - 1]);
        }
        if (!this.isNotHuman(x, y + 1)) {
          this.currentState.town[y + 1][x] = 2;  
          subQueue.push([x, y + 1]);
        }
      }

      queue = [];
      queue.push(...subQueue);

      if (queue.length > 0) {
        minutes += 1;
        this.currentState.minutes = minutes;
        this.snapshot("tick");
      }
    }

    for (let y = 0; y < this.currentState.town.length; y++) {
      for (let x = 0; x < this.currentState.town[y].length; x++) {
        if (this.currentState.town[y][x] === 1) {
          this.currentState.minutes = -1;
          this.snapshot("survived");
          return -1;
        }
      }
    }

    this.currentState.minutes = minutes;
    this.snapshot("done");

    return minutes;
  }
}
