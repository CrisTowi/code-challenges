import type { ComebackRoundInput } from "./algorithm";

export const customInputs: Record<string, { input: ComebackRoundInput; description?: string }> = {
  example1: { input: {
    rounds: [
      [5, 3, 2],
      [0, 5, 2],
      [4, 2, 2],
      [1, 3, 0],
    ]
  }},
  example2: { input: {
    rounds: [
      [4, 2],
      [1, 3],
      [2, 1],
    ]
  }},
  example3: { input: {
    rounds: [
      [4, 2],
      [1, 3],
    ]
  }},
};
