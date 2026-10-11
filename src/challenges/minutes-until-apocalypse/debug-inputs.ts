import type { MinutesUntilApocalypseInput } from "./algorithm";

export const customInputs: Record<string, { input: MinutesUntilApocalypseInput; description?: string }> = {
  baseTown: {
    input: {
      town: [
        [2, 1, 1],
        [1, 1, 0],
        [0, 1, 1]
      ]
    },
    description: "One zombie at (0,0); fresh oranges wrap around a blocked cell (1,2). All reachable (expected 4)",
  },
  oneSurvivor: {
    input: {
      town: [
        [2, 1, 1],
        [0, 1, 1],
        [1, 0, 1]
      ]
    },
    description: "Fresh orange at (2,0) is walled off by zeros — apocalypse fails (expected -1)",
  },
  emptyTown: {
    input: {
      town: [
        [0, 0],
        [0, 0]
      ]
    },
    description: "No zombies and no fresh — trivially resolved (expected 0)",
  },
  noZombies: {
    input: {
      town: [
        [1, 1],
        [1, 1]
      ]
    },
    description: "All fresh, no infection source — apocalypse impossible (expected -1)",
  },
  allZombies: {
    input: {
      town: [
        [2, 2, 2],
        [2, 2, 2],
        [2, 2, 2]
      ]
    },
    description: "All zombies — DFS visits every cell in a snake (expected 8)",
  },
  singleCellZombie: {
    input: {
      town: [[2]]
    },
    description: "Single zombie, nothing to infect (expected 0)",
  },
  singleCellFresh: {
    input: {
      town: [[1]]
    },
    description: "Single fresh orange, no zombie (expected -1)",
  },
  straightLineHorizontal: {
    input: {
      town: [[2, 1, 1, 1, 1]]
    },
    description: "1x5 line — farthest fresh is 4 cells away (expected 4)",
  },
  straightLineVertical: {
    input: {
      town: [
        [2],
        [1],
        [1],
        [1]
      ]
    },
    description: "4x1 line — farthest fresh is 3 cells away (expected 3)",
  },
  walledOff: {
    input: {
      town: [
        [2, 0],
        [0, 1]
      ]
    },
    description: "Zombie trapped behind zeros, fresh unreachable (expected -1)",
  },
  unreachableIsland: {
    input: {
      town: [
        [2, 0, 1],
        [0, 0, 0],
        [1, 0, 2]
      ]
    },
    description: "Two corner zombies; corner fresh oranges unreachable (expected -1)",
  },
  checkerboard: {
    input: {
      town: [
        [2, 0, 2, 0, 2],
        [0, 1, 0, 1, 0],
        [2, 0, 2, 0, 2],
        [0, 1, 0, 1, 0],
        [2, 0, 2, 0, 2]
      ]
    },
    description: "Fresh oranges walled in by zeros between every zombie (expected -1)",
  },
  centerZombie: {
    input: {
      town: [
        [1, 1, 1],
        [1, 2, 1],
        [1, 1, 1]
      ]
    },
    description: "3x3 grid with the only zombie in the middle — DFS snakes around (expected 8)",
  },
  twoZombiesAdjacent: {
    input: {
      town: [
        [2, 1, 1],
        [1, 1, 1],
        [0, 0, 0]
      ]
    },
    description: "One zombie on a fully connected fresh region — DFS snakes through every fresh cell (expected 5)",
  },
  largeGrid: {
    input: {
      town: [
        [2, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1]
      ]
    },
    description: "4x4 grid, one zombie at (0,0) — DFS visits all 16 cells (expected 15)",
  },
};