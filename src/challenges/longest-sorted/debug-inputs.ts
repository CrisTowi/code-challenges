import type { LongestSortedInput } from "./algorithm";

export const customInputs: Record<string, { input: LongestSortedInput; description?: string }> = {
  example1: {
    input: { input: "The autumn leaves almost glow." },
    description: "Mostly unsorted — 'almost' wins",
  },
  example2: {
    input: { input: "A cool sheep sleeps." },
    description: "Only single-letter 'A' qualifies",
  },
  empty: {
    input: { input: "" },
    description: "Empty string — no words at all",
  },
  single: {
    input: { input: "abc" },
    description: "One word, already sorted",
  },
  singleUnsorted: {
    input: { input: "zoo" },
    description: "One word, not sorted — returns ''",
  },
  tied: {
    input: { input: "abb acc" },
    description: "Two equal-length winners — first one wins (uses >, not >=)",
  },
  punctuation: {
    input: { input: "First, almost ghost!" },
    description: "Trailing commas and bangs get stripped before checking",
  },
  noneSorted: {
    input: { input: "wizard taco quest zoo" },
    description: "Nothing qualifies — every word is out of order",
  },
  allSorted: {
    input: { input: "a am bee choppy almost" },
    description: "Every word is sorted — longest wins",
  },
  duplicatesOk: {
    input: { input: "aabbcc ghost" },
    description: "Repeated letters are allowed — 'aabbcc' beats 'ghost'",
  },
  nearMiss: {
    input: { input: "abc cba acc" },
    description: "Look-alikes — 'cba' reads as sorted but isn't",
  },
  longestAtEnd: {
    input: { input: "ghost choppy" },
    description: "Winner is the last word",
  },
  pangram: {
    input: { input: "The quick brown fox jumps over the lazy dog." },
    description: "Famous pangram — only 'fox' is sorted",
  },
  singleChars: {
    input: { input: "I am a bee." },
    description: "Single letters always qualify — 'bee' wins on length",
  },
};
