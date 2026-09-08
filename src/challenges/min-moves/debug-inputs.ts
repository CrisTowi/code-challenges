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
  wrapEdge: {
    input: { initial: "9", goal: "0" },
    description: "Trivial single-digit wrap",
  },
  wrapFive: {
    input: { initial: "00000", goal: "98765" },
    description: "Five-digit wrap — each dial takes a different number of steps (expected 15)",
  },
  rampFive: {
    input: { initial: "55555", goal: "00000" },
    description: "Five-digit uniform — every dial rotates up the same five steps (expected 25)",
  },
  mixSix: {
    input: { initial: "123456", goal: "908765" },
    description: "Six-digit mix — up and down combined, varied step counts (expected 14)",
  },
  rampSix: {
    input: { initial: "111111", goal: "888888" },
    description: "Six-digit uniform — every dial rotates down three steps (expected 18)",
  },
};
