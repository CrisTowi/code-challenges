import type { PartitionArrayInput } from "./algorithm";

export const customInputs: Record<string, { input: PartitionArrayInput; description?: string }> = {
  base: {
    input: { inputArray: [0, 3, 2, 1, 4, 0, 7] },
    description: "Mixed example from the spec — all three categories present",
  },
  empty: {
    input: { inputArray: [] },
    description: "Empty array — nothing to partition",
  },
  onlyZeroes: {
    input: { inputArray: [0, 0, 0] },
    description: "All zeros — every item hits the first branch",
  },
  onlyOdds: {
    input: { inputArray: [1, 3, 5, 7] },
    description: "Only odd numbers — only the odd bucket fills",
  },
  onlyEvens: {
    input: { inputArray: [2, 4, 6, 8] },
    description: "Only non-zero evens — only the even bucket fills",
  },
  alreadyPartitioned: {
    input: { inputArray: [1, 3, 5, 2, 4, 6, 0, 0] },
    description: "Input is already in odd / even / zero order — output equals input",
  },
  reversePartitioned: {
    input: { inputArray: [0, 0, 2, 4, 6, 1, 3, 5] },
    description: "Input is in zero / even / odd order — full reordering required",
  },
  singleOdd: {
    input: { inputArray: [7] },
    description: "Single odd element",
  },
  singleZero: {
    input: { inputArray: [0] },
    description: "Single zero element",
  },
  withNegatives: {
    input: { inputArray: [-3, -2, -1, 0, 1, 2, 3] },
    description: "Negative numbers exercise all three branches including zero",
  },
};
