import type { ReorderInput } from "./algorithm";

export const customInputs: Record<string, { input: ReorderInput; description?: string }> = {
  basic: {
    input: {
      arrayA: ['C', 'D', 'E', 'F', 'G', 'H'],
      arrayB: [3, 0, 4, 1, 2, 5],
    },
    description: "Three cycles, one of length 3, one of length 2, one fixed point",
  },
  singleCycle: {
    input: {
      arrayA: ['A', 'B', 'C', 'D', 'E', 'F'],
      arrayB: [1, 2, 3, 4, 5, 0],
    },
    description: "One long cycle — every element moves",
  },
  swaps: {
    input: {
      arrayA: ['A', 'B', 'C', 'D', 'E', 'F'],
      arrayB: [1, 0, 3, 2, 5, 4],
    },
    description: "Only 2-cycles — pairs to swap",
  },
  identity: {
    input: {
      arrayA: ['A', 'B', 'C', 'D', 'E'],
      arrayB: [0, 1, 2, 3, 4],
    },
    description: "Already in order — all fixed points, nothing moves",
  },
  long: {
    input: {
      arrayA: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      arrayB: [4, 0, 2, 7, 1, 6, 3, 5],
    },
    description: "Eight elements, multiple cycle breaks",
  },
};
