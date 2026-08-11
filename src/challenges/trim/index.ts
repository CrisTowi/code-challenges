import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { Trim, type TrimInput, type TrimState } from "./algorithm";
import { TrimScene } from "./scene";
import { customInputs } from "./debug-inputs";

export const challenge: Challenge<TrimInput, TrimState> = {
  meta: {
    slug: "trim",
    title: "Trim",
    description: "TODO: describe this challenge in one sentence.",
  },
  customInputs,
  Algorithm: Trim,
  Scene: TrimScene,
};

function firstInput(): TrimInput {
  const first = Object.values(customInputs)[0];
  if (!first) throw new Error("trim: no customInputs defined");
  return first.input;
}

export function runDefault(): Trace<TrimState> {
  return runAndTrace(Trim, firstInput());
}

export { Trim, TrimScene, customInputs };
export type { TrimInput, TrimState };
