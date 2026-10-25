import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { Ghostwriter, type GhostwriterInput, type GhostwriterState } from "./algorithm";
import { GhostwriterScene } from "./scene";
import { customInputs } from "./debug-inputs";

export const challenge: Challenge<GhostwriterInput, GhostwriterState> = {
  meta: {
    slug: "ghostwriter",
    title: "Ghostwriter",
    description: "A ghost types a word one key at a time: '#' erases the last letter and '~' echoes it. What ends up on the page?",
  },
  customInputs,
  Algorithm: Ghostwriter,
  Scene: GhostwriterScene,
};

function firstInput(): GhostwriterInput {
  const first = Object.values(customInputs)[0];
  if (!first) throw new Error("ghostwriter: no customInputs defined");
  return first.input;
}

export function runDefault(): Trace<GhostwriterState> {
  return runAndTrace(Ghostwriter, firstInput());
}

export { Ghostwriter, GhostwriterScene, customInputs };
export type { GhostwriterInput, GhostwriterState };
