import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { QuickSort, type QuickSortInput, type QuickSortState } from "./algorithm";
import { QuickSortScene } from "./scene";
import { quickSortExamples } from "./examples";

const MAX_ITEMS = 20;

export function parseInput(raw: string): QuickSortInput | { error: string } {
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

export const challenge: Challenge<QuickSortInput, QuickSortState> = {
  meta: {
    slug: "quick-sort",
    title: "Quick Sort",
    description:
      "Pick a pivot, partition the array so smaller values go left and larger go right, then recurse on each side. The pivot ends up in its final sorted position after each partition.",
  },
  examples: quickSortExamples,
  Algorithm: QuickSort,
  Scene: QuickSortScene,
  parseInput,
  inputPlaceholder: "e.g. 5,3,8,1,4,9,2",
};

export function runDefault(): Trace<QuickSortState> {
  return runAndTrace(QuickSort, quickSortExamples[0].input);
}

export { QuickSort, QuickSortScene, quickSortExamples };
export type { QuickSortInput, QuickSortState };