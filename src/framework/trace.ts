import type { TracedAlgorithm } from "./TracedAlgorithm";
import type React from "react";

export interface Snapshot<S> {
  state: S;
  label?: string;
}

export interface Trace<S> {
  snapshots: Snapshot<S>[];
}

export interface Example<I> {
  input: I;
  description?: string;
}

export interface ChallengeMeta {
  slug: string;
  title: string;
  description: string;
}

export interface SceneProps<S> {
  snapshot: Snapshot<S>;
  playbackSpeed?: number;
}

export interface Challenge<I, S, O = void> {
  meta: ChallengeMeta;
  Algorithm: new (input: I) => TracedAlgorithm<I, S, O>;
  Scene: React.ComponentType<SceneProps<S>>;
  parseInput?: (raw: string) => I | { error: string };
  inputPlaceholder?: string;
  customInputs?: Record<string, Example<I>>;
  formatInput?: (input: I) => string;
}

export type AnyChallenge = Challenge<unknown, unknown, unknown>;