import { TracedAlgorithm } from "@framework";

export interface GhostwriterInput {
  word: string;
}

export interface GhostwriterState {
  word: string;
  stack: string[];
}

export class Ghostwriter extends TracedAlgorithm<GhostwriterInput, GhostwriterState> {
  protected initialState(input: GhostwriterInput): GhostwriterState {
    return {
      word: input.word,
      stack: [],
    } as GhostwriterState;
  }

  run(): string {
    for (let i = 0; i < this.currentState.word.length; i++) {
      if (this.currentState.word[i] === '#') {
        this.currentState.stack.pop();
      } else if (this.currentState.word[i] === '~') {
        this.currentState.stack.push(this.currentState.stack[this.currentState.stack.length - 1]);
      } else {
        this.currentState.stack.push(this.currentState.word[i]);
      }
    }

    return this.currentState.stack.join('');
  }
}
