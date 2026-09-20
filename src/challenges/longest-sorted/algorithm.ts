import { TracedAlgorithm } from "@framework";

export interface LongestSortedInput {
  input: string,
}

export interface LongestSortedState {
  input: string,
  wordIndex: number | null,
  wordStatuses: ("pending" | "accepted" | "rejected")[],
  currentLongest: string,
}

export class LongestSorted extends TracedAlgorithm<LongestSortedInput, LongestSortedState> {
  protected initialState(input: LongestSortedInput): LongestSortedState {
    const words = input.input
      .split(' ')
      .map((w) => w.replace(/\W/g, ''))
      .filter((w) => w.length > 0);
    return {
      input: input.input,
      wordIndex: null,
      wordStatuses: words.map(() => 'pending'),
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
      this.currentState.wordIndex = i;
      this.snapshot('pickWord');

      if (this.isSorted(cleanWord)) {
        this.currentState.wordStatuses[i] = 'accepted';
        this.snapshot('sorted');

        if (cleanWord.length > this.currentState.currentLongest.length) {
          this.currentState.currentLongest = cleanWord;
          this.snapshot('longestUpdate');
        }
      } else {
        this.currentState.wordStatuses[i] = 'rejected';
        this.snapshot('notSorted');
      }
    }

    this.currentState.wordIndex = null;
    this.snapshot('done');

    return this.currentState.currentLongest;
  }
}
