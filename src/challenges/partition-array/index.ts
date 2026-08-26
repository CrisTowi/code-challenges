import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { PartitionArray, type PartitionArrayInput, type PartitionArrayState } from "./algorithm";
import { PartitionArrayScene } from "./scene";
import { customInputs } from "./debug-inputs";

export const challenge: Challenge<PartitionArrayInput, PartitionArrayState> = {
  meta: {
    slug: "partition-array",
    title: "Partition Array",
    description: "TODO: describe this challenge in one sentence.",
  },
  customInputs,
  Algorithm: PartitionArray,
  Scene: PartitionArrayScene,
};

function firstInput(): PartitionArrayInput {
  const first = Object.values(customInputs)[0];
  if (!first) throw new Error("partition-array: no customInputs defined");
  return first.input;
}

export function runDefault(): Trace<PartitionArrayState> {
  return runAndTrace(PartitionArray, firstInput());
}

export { PartitionArray, PartitionArrayScene, customInputs };
export type { PartitionArrayInput, PartitionArrayState };
