import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { FindJoeys, type FindJoeysInput, type FindJoeysState } from "./algorithm";
import { FindJoeysScene } from "./scene";
import { customInputs } from "./debug-inputs";

export const challenge: Challenge<FindJoeysInput, FindJoeysState> = {
  meta: {
    slug: "find-joeys",
    title: "Find Joeys",
    description: "TODO: describe this challenge in one sentence.",
  },
  customInputs,
  Algorithm: FindJoeys,
  Scene: FindJoeysScene,
};

function firstInput(): FindJoeysInput {
  const first = Object.values(customInputs)[0];
  if (!first) throw new Error("find-joeys: no customInputs defined");
  return first.input;
}

export function runDefault(): Trace<FindJoeysState> {
  return runAndTrace(FindJoeys, firstInput());
}

export { FindJoeys, FindJoeysScene, customInputs };
export type { FindJoeysInput, FindJoeysState };
