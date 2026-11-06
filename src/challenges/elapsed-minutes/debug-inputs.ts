import type { ElapsedMinutesInput } from "./algorithm";

export const customInputs: Record<string, { input: ElapsedMinutesInput; description?: string }> = {
  example1: {
    input: {
      log: ["00:50", "01:10", "01:50", "01:10", "02:10"]
    },
  },
  example2: {
    input: {
      log: ["01:55", "01:05", "01:25", "01:40"]
    },
  }
};
