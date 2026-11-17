import type { FindJoeysInput } from "./algorithm";

export const customInputs: Record<string, { input: FindJoeysInput; description?: string }> = {
  example1: { input: {
    mainWord: "blossom",
    words: ["flower", "bloom"]
  }},
  example2: { input: {
    mainWord: "chocolate",
    words: ["cocoa", "candy"]
  }},
  example3: { input: {
    mainWord: "cat",
    words: ["feline"]
  }},
};
