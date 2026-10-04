import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { FirstDrop, type FirstDropInput, type FirstDropState } from "./algorithm";
import { FirstDropScene } from "./scene";
import { customInputs } from "./debug-inputs";

export const challenge: Challenge<FirstDropInput, FirstDropState> = {
  meta: {
    slug: "first-drop",
    title: "First Drop",
    description: "For each day, scan forward to find the next day whose temperature drops by at least the given threshold; uses a reverse-iteration BST so every node in the tree is a future day.",
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
