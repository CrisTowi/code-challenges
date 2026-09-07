import type { MinMovesInput } from "./algorithm";

export const customInputs: Record<string, { input: MinMovesInput; description?: string }> = {
  to1199: {
    input: { initial: "8051", goal: "1199" },
    description: "Mixed directions per digit — wraps where shorter (expected 10)",
  },
  to555: {
    input: { initial: "000", goal: "555" },
    description: "All digits increase, no wrap-around (expected 15)",
  },
  to990: {
    input: { initial: "109", goal: "990" },
    description: "Wrap-around shorter than forward for every digit (expected 4)",
  },
};
