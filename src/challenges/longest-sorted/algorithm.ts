import { TracedAlgorithm } from "@framework";

export interface LongestSortedInput {
  input: string,
}

export interface LongestSortedState {
  input: string,
  currentLongest: string,
}

export class LongestSorted extends TracedAlgorithm<LongestSortedInput, LongestSortedState> {
  protected initialState(input: LongestSortedInput): LongestSortedState {
    return {
      input: input.input,
      currentLongest: '',
    } as LongestSortedState;
  }

  isSorted(str: string): boolean {
    let prev = null;

    for (let i = 0; i < str.length; i++) {
      if (prev === null) {
        prev = str[i];
      } else {
        if (prev > str[i]) {
          return false;
        } else {
          prev = str[i];
        }
      }
    }

    return true;
  }

  run(): string {
    const words = this.currentState.input.split(' ');

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const cleanWord = word.replace(/\W/g, '');

      if (this.isSorted(cleanWord)) {
        if (cleanWord.length > this.currentState.currentLongest.length) {
          this.currentState.currentLongest = cleanWord;
        }
      }
    }

    return this.currentState.currentLongest;
  }
}
