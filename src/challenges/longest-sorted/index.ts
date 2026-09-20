import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { LongestSorted, type LongestSortedInput, type LongestSortedState } from "./algorithm";
import { LongestSortedScene } from "./scene";
import { customInputs } from "./debug-inputs";

export const challenge: Challenge<LongestSortedInput, LongestSortedState> = {
  meta: {
    slug: "longest-sorted",
    title: "Longest Sorted",
    description: "Find the longest word in a sentence whose letters appear in alphabetical order (e.g. \"almost\").",
  },
  customInputs,
  Algorithm: LongestSorted,
  Scene: LongestSortedScene,
};

function firstInput(): LongestSortedInput {
  const first = Object.values(customInputs)[0];
  if (!first) throw new Error("longest-sorted: no customInputs defined");
  return first.input;
}

export function runDefault(): Trace<LongestSortedState> {
  return runAndTrace(LongestSorted, firstInput());
}

export { LongestSorted, LongestSortedScene, customInputs };
export type { LongestSortedInput, LongestSortedState };
