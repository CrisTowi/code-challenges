import { TracedAlgorithm } from "@framework";

export interface PartitionArrayInput {
  inputArray: number[]
}

export interface PartitionArrayState {
  inputArray: number[],
  odd: number[],
  even: number[],
  zeroes: number[],
}

export class PartitionArray extends TracedAlgorithm<PartitionArrayInput, PartitionArrayState> {
  protected initialState(input: PartitionArrayInput): PartitionArrayState {
    return {
      inputArray: input.inputArray,
      odd: [],
      even: [],
      zeroes: [],
    } as PartitionArrayState;
  }

  run(): number[] {
    for (let i = 0; i < this.currentState.inputArray.length; i++) {
      const item = this.currentState.inputArray[i];
      this.snapshot('loop')

      if (item === 0) {
        this.currentState.zeroes.push(item);
        this.snapshot('addZeroes');
      } else if (item % 2 === 0) {
        this.currentState.even.push(item);
        this.snapshot('addEven');
      } else {
        this.currentState.odd.push(item);
        this.snapshot('addOdd');
      }

    }

    this.snapshot('finishAlgorithm');

    return [
      ...this.currentState.odd,
      ...this.currentState.even,
      ...this.currentState.zeroes,
    ];
  }
}
