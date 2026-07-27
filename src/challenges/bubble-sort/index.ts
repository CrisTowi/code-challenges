import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { BubbleSort, type BubbleSortInput, type BubbleSortState } from "./algorithm";
import { BubbleSortScene } from "./scene";
import { bubbleSortExamples } from "./examples";

const MAX_ITEMS = 20;

export function parseInput(raw: string): BubbleSortInput | { error: string } {
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
  const numbers: number[] = [];
  for (const p of parts) {
    const n = Number(p);
    if (!Number.isFinite(n) || p === "") return { error: `Invalid number: "${p}"` };
    if (n < 0 || n > 99) return { error: `Numbers must be 0–99: "${p}"` };
    numbers.push(n);
  }
  return { numbers };
}

export const challenge: Challenge<BubbleSortInput, BubbleSortState> = {
  meta: {
    slug: "bubble-sort",
    title: "Bubble Sort",
    description:
      "Walk through the simplest sorting algorithm: scan the array, swap adjacent out-of-order pairs, repeat until a full pass has no swaps.",
  },
  examples: bubbleSortExamples,
  Algorithm: BubbleSort,
  Scene: BubbleSortScene,
  parseInput,
  inputPlaceholder: "e.g. 5,3,8,1,4,9,2",
};

export function runDefault(): Trace<BubbleSortState> {
  return runAndTrace(BubbleSort, bubbleSortExamples[0].input);
}

export { BubbleSort, BubbleSortScene, bubbleSortExamples };
export type { BubbleSortInput, BubbleSortState };
