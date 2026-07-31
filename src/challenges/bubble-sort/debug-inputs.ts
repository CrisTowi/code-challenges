import type { NumbersInput } from "./algorithm";

export const customInputs: Record<string, { input: NumbersInput; description?: string }> = {
  pivot: { input: { numbers: [4, 1, 3, 2] }, description: "Pivot at last, mixed values" },
  small: { input: { numbers: [3, 1, 4, 1, 5] }, description: "Five numbers, partly ordered" },
  reverse: { input: { numbers: [5, 4, 3, 2, 1] }, description: "Worst case — fully reversed" },
  sorted: { input: { numbers: [1, 2, 3, 4, 5] }, description: "Best case — already in order" },
  duplicates: { input: { numbers: [3, 1, 4, 1, 5, 9, 2, 6, 5, 3] }, description: "Many duplicates" },
  large: { input: { numbers: [9, 3, 7, 1, 5, 8, 2, 6, 4] }, description: "Nine numbers, randomized" },
  empty: { input: { numbers: [] }, description: "No elements" },
  single: { input: { numbers: [42] }, description: "One element, already sorted" },
};