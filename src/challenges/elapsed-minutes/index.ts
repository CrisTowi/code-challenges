import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { ElapsedMinutes, type ElapsedMinutesInput, type ElapsedMinutesState } from "./algorithm";
import { ElapsedMinutesScene } from "./scene";
import { customInputs } from "./debug-inputs";

export const challenge: Challenge<ElapsedMinutesInput, ElapsedMinutesState> = {
  meta: {
    slug: "elapsed-minutes",
    title: "Elapsed Minutes",
    description: "TODO: describe this challenge in one sentence.",
  },
  customInputs,
  Algorithm: ElapsedMinutes,
  Scene: ElapsedMinutesScene,
};

function firstInput(): ElapsedMinutesInput {
  const first = Object.values(customInputs)[0];
  if (!first) throw new Error("elapsed-minutes: no customInputs defined");
  return first.input;
}

export function runDefault(): Trace<ElapsedMinutesState> {
  return runAndTrace(ElapsedMinutes, firstInput());
}

export { ElapsedMinutes, ElapsedMinutesScene, customInputs };
export type { ElapsedMinutesInput, ElapsedMinutesState };
