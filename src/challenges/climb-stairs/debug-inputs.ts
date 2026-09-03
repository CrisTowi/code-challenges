import type { ClimbStairsInput } from "./algorithm";

export const customInputs: Record<string, { input: ClimbStairsInput; description?: string }> = {
  one: {
    input: { steps: 1 },
    description: "Single step — only one way",
  },
  two: {
    input: { steps: 2 },
    description: "Smallest non-trivial case",
  },
  three: {
    input: { steps: 3 },
    description: "First time the answer diverges from the steps",
  },
  four: {
    input: { steps: 4 },
    description: "Fibonacci kicks in (5 ways)",
  },
  six: {
    input: { steps: 6 },
    description: "Tree starts to branch visibly (13 ways)",
  },
  eight: {
    input: { steps: 8 },
    description: "Recursion tree gets wide (34 ways)",
  },
  ten: {
    input: { steps: 10 },
    description: "Stress test — 89 paths, deep tree",
  },
};