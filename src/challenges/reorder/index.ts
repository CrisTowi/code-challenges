import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { Reorder, type ReorderInput, type ReorderState } from "./algorithm";
import { ReorderScene } from "./scene";
import { customInputs } from "./debug-inputs";

export const challenge: Challenge<ReorderInput, ReorderState> = {
  meta: {
    slug: "reorder",
    title: "Reorder",
    description: "Reorder an array in place by following the destination indices, one cycle at a time.",
  },
  customInputs,
  Algorithm: Reorder,
  Scene: ReorderScene,
};

function firstInput(): ReorderInput {
  const first = Object.values(customInputs)[0];
  if (!first) throw new Error("reorder: no customInputs defined");
  return first.input;
}

export function runDefault(): Trace<ReorderState> {
  return runAndTrace(Reorder, firstInput());
}

export { Reorder, ReorderScene, customInputs };
export type { ReorderInput, ReorderState };