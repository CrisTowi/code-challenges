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
    description: "starts with the clock falling back",
  },
  longNight: {
    input: {
      log: ["09:00", "09:45", "10:30", "11:50", "11:20", "12:05", "12:40"]
    },
    description: "a longer day with a fall-back in the middle",
  },
  lastSecondFallBack: {
    input: {
      log: ["01:59", "01:00"]
    },
    description: "falls back from :59 to :00 — only 1 real minute passed",
  },
  doubleFallBack: {
    input: {
      log: ["01:40", "01:20", "01:50", "01:30", "02:00"]
    },
    description: "the clock falls back twice, so the moon gets fooled twice",
  },
  frozenClock: {
    input: {
      log: ["03:15", "03:15", "03:15", "03:15"]
    },
    description: "the same reading over and over — zero minutes pass",
  },
  onTheHour: {
    input: {
      log: ["02:00", "03:00", "04:00", "05:00"]
    },
    description: "clean hour jumps, no fall-backs",
  },
  fallBackAcrossHour: {
    input: {
      log: ["04:45", "05:15", "05:05", "05:40"]
    },
    description: "crosses an hour boundary, then falls back right after",
  },
  singleReading: {
    input: {
      log: ["06:30"]
    },
    description: "only one reading — nothing to add up",
  },
};
