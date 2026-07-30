import { TracedAlgorithm } from "@framework";

export interface NumbersInput {
  numbers: number[];
}

export type BubbleSortInput = NumbersInput;

export interface Bar {
  id: number;
  value: number;
}

export interface BubbleSortState {
  bars: Bar[];
  i: number;
  j: number;
  comparing: [number, number] | null;
  swapped: boolean;
}

export class BubbleSort extends TracedAlgorithm<BubbleSortInput, BubbleSortState> {
  protected initialState(input: BubbleSortInput): BubbleSortState {
    return {
      bars: input.numbers.map((value, id) => ({ id, value })),
      i: 0,
      j: 0,
      comparing: null,
      swapped: false,
    };
  }

  run(): void {
    const n = this.currentState.bars.length;
    for (let i = 0; i < n - 1; i++) {
      this.currentState.i = i;
      this.currentState.swapped = false;
      this.snapshot(`pass ${i + 1} ▸ start`);

      for (let j = 0; j < n - i - 1; j++) {
        this.currentState.j = j;
        this.currentState.comparing = [j, j + 1];
        this.snapshot(`compare`);

        if (this.currentState.bars[j].value > this.currentState.bars[j + 1].value) {
          const tmp = this.currentState.bars[j];
          this.currentState.bars[j] = this.currentState.bars[j + 1];
          this.currentState.bars[j + 1] = tmp;
          this.currentState.swapped = true;
          this.snapshot(`swap`);
        }
      }

      if (!this.currentState.swapped) {
        this.currentState.comparing = null;
        this.snapshot(`no swaps ▸ sorted early`);
        return;
      }
    }

    this.currentState.comparing = null;
    this.snapshot(`sorted`);
  }
}
