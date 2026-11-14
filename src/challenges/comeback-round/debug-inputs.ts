import type { ComebackRoundInput } from "./algorithm";

export const customInputs: Record<string, { input: ComebackRoundInput; description?: string }> = {
  example1: {
    input: {
      rounds: [
        [5, 3, 2],
        [0, 5, 2],
        [4, 2, 2],
        [1, 3, 0],
      ],
    },
    description: "an early overtake, then the lead holds to the flag",
  },
  example2: {
    input: {
      rounds: [
        [4, 2],
        [1, 3],
        [2, 1],
      ],
    },
    description: "level going into the final lap",
  },
  example3: {
    input: {
      rounds: [
        [4, 2],
        [1, 3],
      ],
    },
    description: "photo finish: no sole winner → −1",
  },
  wireToWire: {
    input: {
      rounds: [
        [6, 2, 3, 1],
        [2, 4, 1, 3],
        [3, 3, 2, 2],
        [1, 2, 4, 0],
        [2, 1, 1, 3],
      ],
    },
    description: "four karts, leader from lap 1",
  },
  lateCharge: {
    input: {
      rounds: [
        [7, 3, 4],
        [5, 2, 4],
        [1, 6, 5],
        [0, 5, 4],
        [2, 6, 1],
        [1, 4, 3],
      ],
    },
    description: "the early leader gets reeled in mid-race",
  },
};
