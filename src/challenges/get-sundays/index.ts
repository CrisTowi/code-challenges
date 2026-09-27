import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { GetSundays, type GetSundaysInput, type GetSundaysState } from "./algorithm";
import { GetSundaysScene } from "./scene";
import { customInputs } from "./debug-inputs";

export const challenge: Challenge<GetSundaysInput, GetSundaysState> = {
  meta: {
    slug: "get-sundays",
    title: "Get Sundays",
    description: "Walk day-by-day through a month (located via Zeller's congruence) and collect every Sunday as a Y-M-D string.",
  },
  customInputs,
  Algorithm: GetSundays,
  Scene: GetSundaysScene,
};

function firstInput(): GetSundaysInput {
  const first = Object.values(customInputs)[0];
  if (!first) throw new Error("get-sundays: no customInputs defined");
  return first.input;
}

export function runDefault(): Trace<GetSundaysState> {
  return runAndTrace(GetSundays, firstInput());
}

export { GetSundays, GetSundaysScene, customInputs };
export type { GetSundaysInput, GetSundaysState };
