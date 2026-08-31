import type { ClimbStairsInput } from "./algorithm";

export const customInputs: Record<string, { input: ClimbStairsInput; description?: string }> = {
  two: {
    input: { steps: 2 },
    description: "Smallest non-trivial case",
  },
  four: {
    input: { steps: 4 },
    description: "First time the answer diverges from the steps",
  },
  ten: {
    input: { steps: 10 },
    description: "Stress test for the recursion tree",
  },
};