import type { Example } from "@framework";
import type { QuickSortInput } from "./algorithm";

export const quickSortExamples: Example<QuickSortInput>[] = [
  {
    name: "small",
    description: "Five numbers, mixed — easy to follow step by step",
    input: { numbers: [3, 1, 4, 1, 5] },
  },
  {
    name: "reverse",
    description: "Worst case for naive pivot = last element",
    input: { numbers: [5, 4, 3, 2, 1] },
  },
  {
    name: "already sorted",
    description: "Another worst case for pivot = last (depth n)",
    input: { numbers: [1, 2, 3, 4, 5] },
  },
  {
    name: "duplicates",
    description: "Several copies — Lomuto keeps them grouped correctly",
    input: { numbers: [3, 1, 4, 1, 5, 1, 3] },
  },
  {
    name: "random",
    description: "Mixed random input — average case",
    input: { numbers: [7, 2, 9, 1, 5, 8, 3] },
  },
];