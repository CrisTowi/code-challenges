import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { MinMoves, type MinMovesInput, type MinMovesState } from "./algorithm";
import { MinMovesScene } from "./scene";
import { customInputs } from "./debug-inputs";

export const challenge: Challenge<MinMovesInput, MinMovesState> = {
  meta: {
    slug: "min-moves",
    title: "Min Moves",
    description: "TODO: describe this challenge in one sentence.",
  },
  customInputs,
  Algorithm: MinMoves,
  Scene: MinMovesScene,
};

function firstInput(): MinMovesInput {
  const first = Object.values(customInputs)[0];
  if (!first) throw new Error("min-moves: no customInputs defined");
  return first.input;
}

export function runDefault(): Trace<MinMovesState> {
  return runAndTrace(MinMoves, firstInput());
}

export { MinMoves, MinMovesScene, customInputs };
export type { MinMovesInput, MinMovesState };
