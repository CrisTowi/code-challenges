import { TracedAlgorithm } from "@framework";

export interface LongestSortedInput {
  input: string,
}

export interface LongestSortedState {
  input: string,
  words: string[],
  wordIndex: number | null,
  letterIndex: number | null,
  sortedResult: boolean | null,
  lastFailedAt: number | null,
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
      words,
      wordIndex: null,
      letterIndex: null,
      sortedResult: null,
      lastFailedAt: null,
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
    const words = this.currentState.words;
    this.snapshot('initWords');

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      this.currentState.wordIndex = i;
      this.currentState.letterIndex = null;
      this.currentState.sortedResult = null;
      this.currentState.lastFailedAt = null;
      this.snapshot('pickWord');

      let prev: string | null = null;
      let sorted = true;
      for (let j = 0; j < word.length; j++) {
        const ch = word[j];
        if (prev !== null) {
          this.currentState.letterIndex = j;
          this.snapshot('compare');

          if (prev > ch) {
            sorted = false;
            this.currentState.lastFailedAt = j;
            this.currentState.wordStatuses[i] = 'rejected';
            this.currentState.sortedResult = false;
            this.snapshot('notSorted');
            break;
          }
        }
        prev = ch;
      }

      if (sorted) {
        this.currentState.letterIndex = null;
        this.currentState.sortedResult = true;
        this.currentState.wordStatuses[i] = 'accepted';
        this.snapshot('sorted');

        if (word.length > this.currentState.currentLongest.length) {
          this.currentState.currentLongest = word;
          this.snapshot('longestUpdate');
        }
      }
    }

    this.currentState.wordIndex = null;
    this.currentState.letterIndex = null;
    this.currentState.sortedResult = null;
    this.snapshot('done');

    return this.currentState.currentLongest;
  }
}
