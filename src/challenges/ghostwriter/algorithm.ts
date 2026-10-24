import { TracedAlgorithm } from "@framework";

export interface GhostwriterInput {
  word: string;
}

export interface GhostwriterState {
  word: string;
  stack: string[];
  // viz-only: start
  index: number | null;
  op: "init" | "type" | "erase" | "echo" | "done";
  affected: string | null;
  // viz-only: end
}

export class Ghostwriter extends TracedAlgorithm<GhostwriterInput, GhostwriterState> {
  protected initialState(input: GhostwriterInput): GhostwriterState {
    return {
      word: input.word,
      stack: [],
      // viz-only: start
      index: null,
      op: "init",
      affected: null,
      // viz-only: end
    } as GhostwriterState;
  }

  run(): string {
    for (let i = 0; i < this.currentState.word.length; i++) {
      // viz-only: start
      this.currentState.index = i;
      this.currentState.affected = this.currentState.stack[this.currentState.stack.length - 1] ?? null;
      // viz-only: end
      if (this.currentState.word[i] === '#') {
        this.currentState.stack.pop();
        this.currentState.op = "erase"; // viz-only
      } else if (this.currentState.word[i] === '~') {
        this.currentState.stack.push(this.currentState.stack[this.currentState.stack.length - 1]);
        this.currentState.op = "echo"; // viz-only
      } else {
        this.currentState.stack.push(this.currentState.word[i]);
        // viz-only: start
        this.currentState.op = "type";
        this.currentState.affected = this.currentState.word[i];
        // viz-only: end
      }
      this.snapshot(this.currentState.op); // viz-only
    }

    // viz-only: start
    this.currentState.index = null;
    this.currentState.op = "done";
    this.currentState.affected = null;
    this.snapshot("done");
    // viz-only: end

    return this.currentState.stack.join('');
  }
}
