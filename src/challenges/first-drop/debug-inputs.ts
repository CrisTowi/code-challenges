import type { FirstDropInput } from "./algorithm";

export const customInputs: Record<string, { input: FirstDropInput; description?: string }> = {
  firstTest: {
    input: {
      daysArray: [70, 68, 72, 60, 65, 55],
      dropNumber: 5,
    }
  },
  secondTest: {
    input: {
      daysArray: [50, 49, 48],
      dropNumber: 5,
    }
  },
  thirdTest: {
    input: {
      daysArray: [40, 30, 45, 20],
      dropNumber: 10,
    }
  },
  balancedTest: {
    description: "small tree with left+right branching at the root",
    input: {
      daysArray: [60, 30, 90, 10, 80, 40, 50],
      dropNumber: 20,
    }
  },
  bushyTest: {
    description: "9-node tree with branching on both sides",
    input: {
      daysArray: [40, 20, 80, 10, 60, 90, 30, 70, 50],
      dropNumber: 15,
    }
  },
  zigzagTest: {
    description: "8-node tree, alternating inserts yield off-center branching",
    input: {
      daysArray: [25, 75, 50, 10, 90, 30, 70, 60],
      dropNumber: 15,
    }
  },
};