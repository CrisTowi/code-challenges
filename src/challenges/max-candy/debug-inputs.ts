import type { MaxCandyInput } from "./algorithm";

export const customInputs: Record<string, { input: MaxCandyInput; description?: string }> = {
  simple: {
    description: "5 houses — the classic intro case",
    input: { input: [2, 7, 9, 3, 1] },
  },
  zigzag: {
    description: "8 houses alternating high/low — skip every low",
    input: { input: [5, 10, 5, 10, 5, 10, 5, 10] },
  },
  "every-third": {
    description: "7 houses — jumping two at a time beats adjacent hopping",
    input: { input: [9, 1, 1, 9, 1, 1, 9] },
  },
  jackpot: {
    description: "7 houses — big value at start AND end, connect both",
    input: { input: [8, 1, 1, 1, 1, 1, 20] },
  },
  mountain: {
    description: "9 houses — huge peak in the middle, but spread wins",
    input: { input: [1, 2, 9, 15, 9, 2, 1, 3, 8] },
  },
};
