import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { PartitionArray, type PartitionArrayInput, type PartitionArrayState } from "./algorithm";
import { PartitionArrayScene } from "./scene";
import { customInputs } from "./debug-inputs";

const MAX_ITEMS = 16;

export function parseInput(raw: string): PartitionArrayInput | { error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { error: "Enter comma-separated numbers" };
  const parts = trimmed
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (parts.length === 0) return { error: "Enter at least one number" };
  if (parts.length > MAX_ITEMS) {
    return { error: `Max ${MAX_ITEMS} numbers (got ${parts.length})` };
  }
  const inputArray: number[] = [];
  for (const p of parts) {
    const n = Number(p);
    if (!Number.isFinite(n) || p === "") return { error: `Invalid number: "${p}"` };
    if (n < -99 || n > 99) return { error: `Numbers must be -99..99: "${p}"` };
    inputArray.push(n);
  }
  return { inputArray };
}

export const challenge: Challenge<PartitionArrayInput, PartitionArrayState> = {
  meta: {
    slug: "partition-array",
    title: "Partition Array",
    description:
      "Walk the array once. Send every odd to its bucket, every non-zero even to its bucket, and every zero to its bucket. The result is the three buckets concatenated.",
  },
  Algorithm: PartitionArray,
  Scene: PartitionArrayScene,
  parseInput,
  inputPlaceholder: "e.g. 0,3,2,1,4,0,7",
  customInputs,
  formatInput: (input) => input.inputArray.join(","),
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