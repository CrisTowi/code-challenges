import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { ComebackRound, type ComebackRoundInput, type ComebackRoundState } from "./algorithm";
import { ComebackRoundScene } from "./scene";
import { customInputs } from "./debug-inputs";

export const challenge: Challenge<ComebackRoundInput, ComebackRoundState> = {
  meta: {
    slug: "comeback-round",
    title: "Comeback Round",
    description: "Race the rounds to find the champion, then replay them backward to see how long their winning lead had held.",
  },
  customInputs,
  Algorithm: ComebackRound,
  Scene: ComebackRoundScene,
};

function firstInput(): ComebackRoundInput {
  const first = Object.values(customInputs)[0];
  if (!first) throw new Error("comeback-round: no customInputs defined");
  return first.input;
}

export function runDefault(): Trace<ComebackRoundState> {
  return runAndTrace(ComebackRound, firstInput());
}

export { ComebackRound, ComebackRoundScene, customInputs };
export type { ComebackRoundInput, ComebackRoundState };
