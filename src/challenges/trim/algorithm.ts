import { TracedAlgorithm } from "@framework";

export enum TrimType {
  leading = "leading",
  trailing = "trailing",
  both = "both",
}

export interface TrimInput {
  trimType: TrimType,
  str: string,
}

export interface TrimState {
  trimType: TrimType,
  str: string,
  left: number,
  right: number,
}

export class Trim extends TracedAlgorithm<TrimInput, TrimState> {
  protected initialState(input: TrimInput): TrimState {
    // TODO: build the starting state from the input
    return {
      str: input.str,
      trimType: input.trimType,
      left: 0,
      right: 0,
    } as TrimState;
  }

  trimLeading(): void {
    this.currentState.left = 0;

    while(this.currentState.str[this.currentState.left] === ' ') {
      this.currentState.left += 1;
      this.snapshot('moveLeftPointer');
    }

    this.currentState.str = this.currentState.str.slice(this.currentState.left);
    this.snapshot('applyLeadingTrim');
  }

  trimTrailing(): void {
    this.currentState.right = 0;
    let currentIndex = this.currentState.str.length - 1;

    while(this.currentState.str[currentIndex] === ' ') {
      currentIndex -= 1;
      this.currentState.right += 1;
      this.snapshot('moveRightPointer')
    }

    this.currentState.str = this.currentState.str.slice(0, -this.currentState.right);
    this.snapshot('applyTrailingTrim');
  }

  run(): string {
    if (this.currentState.trimType === TrimType.leading) {
      this.trimLeading();
    } else if (this.currentState.trimType === TrimType.trailing) {
      this.trimTrailing();
    } else {
      this.trimLeading();
      this.trimTrailing();
    }

    return this.currentState.str;
  }
}
