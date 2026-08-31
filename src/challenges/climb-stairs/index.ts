import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { ClimbStairs, type ClimbStairsInput, type ClimbStairsState } from "./algorithm";
import { ClimbStairsScene } from "./scene";
import { customInputs } from "./debug-inputs";

export const challenge: Challenge<ClimbStairsInput, ClimbStairsState> = {
  meta: {
    slug: "climb-stairs",
    title: "Climb Stairs",
    description: "TODO: describe this challenge in one sentence.",
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
