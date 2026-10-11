import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { MinutesUntilApocalypse, type MinutesUntilApocalypseInput, type MinutesUntilApocalypseState } from "./algorithm";
import { MinutesUntilApocalypseScene } from "./scene";
import { customInputs } from "./debug-inputs";

export const challenge: Challenge<MinutesUntilApocalypseInput, MinutesUntilApocalypseState> = {
  meta: {
    slug: "minutes-until-apocalypse",
    title: "Minutes Until Apocalypse",
    description: "Each minute, every zombie bites a human neighbour. How long until every human is gone — or until they're walled in forever?",
  },
  customInputs,
  Algorithm: MinutesUntilApocalypse,
  Scene: MinutesUntilApocalypseScene,
};

function firstInput(): MinutesUntilApocalypseInput {
  const first = Object.values(customInputs)[0];
  if (!first) throw new Error("minutes-until-apocalypse: no customInputs defined");
  return first.input;
}

export function runDefault(): Trace<MinutesUntilApocalypseState> {
  return runAndTrace(MinutesUntilApocalypse, firstInput());
}

export { MinutesUntilApocalypse, MinutesUntilApocalypseScene, customInputs };
export type { MinutesUntilApocalypseInput, MinutesUntilApocalypseState };
