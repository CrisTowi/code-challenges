import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { MaxCandy, type MaxCandyInput, type MaxCandyState } from "./algorithm";
import { MaxCandyScene } from "./scene";
import { customInputs } from "./debug-inputs";

export const challenge: Challenge<MaxCandyInput, MaxCandyState> = {
  meta: {
    slug: "max-candy",
    title: "Max Candy",
    description: "TODO: describe this challenge in one sentence.",
  },
  customInputs,
  Algorithm: MaxCandy,
  Scene: MaxCandyScene,
};

function firstInput(): MaxCandyInput {
  const first = Object.values(customInputs)[0];
  if (!first) throw new Error("max-candy: no customInputs defined");
  return first.input;
}

export function runDefault(): Trace<MaxCandyState> {
  return runAndTrace(MaxCandy, firstInput());
}

export { MaxCandy, MaxCandyScene, customInputs };
export type { MaxCandyInput, MaxCandyState };
