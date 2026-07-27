import type { Example } from "@framework";
import type { BubbleSortInput } from "./algorithm";

export const bubbleSortExamples: Example<BubbleSortInput>[] = [
  {
    name: "small",
    description: "Five numbers, already partly ordered",
    input: { numbers: [3, 1, 4, 1, 5] },
  },
  {
    name: "reverse",
    description: "Worst case — fully reversed",
    input: { numbers: [5, 4, 3, 2, 1] },
  },
  {
    name: "already sorted",
    description: "Best case — already in order",
    input: { numbers: [1, 2, 3, 4, 5] },
  },
  {
    name: "random",
    description: "Mixed random input",
    input: { numbers: [7, 2, 9, 1, 5, 8, 3] },
  },
];
