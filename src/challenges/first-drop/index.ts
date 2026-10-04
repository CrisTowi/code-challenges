import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { FirstDrop, type FirstDropInput, type FirstDropState } from "./algorithm";
import { FirstDropScene } from "./scene";
import { customInputs } from "./debug-inputs";

export const challenge: Challenge<FirstDropInput, FirstDropState> = {
  meta: {
    slug: "first-drop",
    title: "First Drop",
    description: "TODO: describe this challenge in one sentence.",
  },
  customInputs,
  Algorithm: FirstDrop,
  Scene: FirstDropScene,
};

function firstInput(): FirstDropInput {
  const first = Object.values(customInputs)[0];
  if (!first) throw new Error("first-drop: no customInputs defined");
  return first.input;
}

export function runDefault(): Trace<FirstDropState> {
  return runAndTrace(FirstDrop, firstInput());
}

export { FirstDrop, FirstDropScene, customInputs };
export type { FirstDropInput, FirstDropState };
