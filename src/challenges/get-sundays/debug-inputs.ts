import type { GetSundaysInput } from "./algorithm";

export const customInputs: Record<string, { input: GetSundaysInput; description?: string }> = {
  jan2000: {
    input: {
      year: 2000,
      month: 1,
    }
  },
  sept2026: {
    input: {
      year: 2026,
      month: 9,
    }
  },
  feb2024: {
    input: {
      year: 2024,
      month: 2,
    }
  },
  dec2025: {
    input: {
      year: 2025,
      month: 12,
    }
  }
};
