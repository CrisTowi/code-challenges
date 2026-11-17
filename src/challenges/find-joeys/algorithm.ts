import { TracedAlgorithm } from "@framework";

export interface FindJoeysInput {
  mainWord: string;
  words: string[];
}

export interface FindJoeysState {
  mainWord: string;
  words: string[];
}

export class FindJoeys extends TracedAlgorithm<FindJoeysInput, FindJoeysState> {
  protected initialState(input: FindJoeysInput): FindJoeysState {
    return {
      mainWord: input.mainWord,
      words: input.words,
    } as FindJoeysState;
  }

  isJoey(word: string, mainWord: string): boolean {
    let mainWordIndex = 0;

    for (let i = 0; i < word.length; i++) {
      while (mainWordIndex < mainWord.length && mainWord[mainWordIndex] !== word[i]) {
        mainWordIndex += 1;
      }

      if (mainWordIndex === mainWord.length) {
        return false;
      }
    }

    return true;
  }

  run(): string[] {
    const result = this.currentState.words.filter((word) => {
      return this.isJoey(word, this.currentState.mainWord);
    });

    return result;
  }
}
