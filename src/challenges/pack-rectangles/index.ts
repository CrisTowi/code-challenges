import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { PackRectangles, type PackRectanglesInput, type PackRectanglesState } from "./algorithm";
import { PackRectanglesScene } from "./scene";
import { customInputs } from "./debug-inputs";

export const challenge: Challenge<PackRectanglesInput, PackRectanglesState> = {
  meta: {
    slug: "pack-rectangles",
    title: "Pack Rectangles",
    description: "TODO: describe this challenge in one sentence.",
  },
  customInputs,
  Algorithm: PackRectangles,
  Scene: PackRectanglesScene,
};

function firstInput(): PackRectanglesInput {
  const first = Object.values(customInputs)[0];
  if (!first) throw new Error("pack-rectangles: no customInputs defined");
  return first.input;
}

export function runDefault(): Trace<PackRectanglesState> {
  return runAndTrace(PackRectangles, firstInput());
}

export { PackRectangles, PackRectanglesScene, customInputs };
export type { PackRectanglesInput, PackRectanglesState };
