import type { ReorderInput } from "./algorithm";

export const customInputs: Record<string, { input: ReorderInput; description?: string }> = {
  basic: {
    input: {
      arrayA: ['C', 'D', 'E', 'F', 'G', 'H'],
      arrayB: [3, 0, 4, 1, 2, 5],
    },
  },
};