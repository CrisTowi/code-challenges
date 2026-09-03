import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { ClimbStairs, type ClimbStairsInput, type ClimbStairsState } from "./algorithm";
import { ClimbStairsScene } from "./scene";
import { customInputs } from "./debug-inputs";

export const challenge: Challenge<ClimbStairsInput, ClimbStairsState> = {
  meta: {
    slug: "climb-stairs",
    title: "Climb Stairs",
    description:
      "Count the distinct ways to climb n stairs taking 1 or 2 steps at a time. The recursion explores every path and counts the leaves.",
  },
  customInputs,
  Algorithm: ClimbStairs,
  Scene: ClimbStairsScene,
};

function firstInput(): ClimbStairsInput {
  const first = Object.values(customInputs)[0];
  if (!first) throw new Error("climb-stairs: no customInputs defined");
  return first.input;
}

export function runDefault(): Trace<ClimbStairsState> {
  return runAndTrace(ClimbStairs, firstInput());
}

export { ClimbStairs, ClimbStairsScene, customInputs };
export type { ClimbStairsInput, ClimbStairsState };