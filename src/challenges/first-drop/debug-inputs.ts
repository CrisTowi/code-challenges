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
};
