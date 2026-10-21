import type { GhostwriterInput } from "./algorithm";

export const customInputs: Record<string, { input: GhostwriterInput; description?: string }> = {
  example1: {
    input: {
      word: "ghost"
    }
  },
  example2: {
    input: {
      word: "a#~b"
    }
  },
  example3: {
    input: {
      word: "ab~c#"
    }
  },
  example4: {
    input: {
      word: "BBB##O~"
    }
  },
};
