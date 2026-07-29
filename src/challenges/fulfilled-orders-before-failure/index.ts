import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { FulfilledOrdersBeforeFailure, type FulfilledOrdersBeforeFailureInput, type FulfilledOrdersBeforeFailureState } from "./algorithm";
import { FulfilledOrdersBeforeFailureScene } from "./scene";
import { examples } from "./examples";

export const challenge: Challenge<FulfilledOrdersBeforeFailureInput, FulfilledOrdersBeforeFailureState> = {
  meta: {
    slug: "fulfilled-orders-before-failure",
    title: "Fulfilled Orders Before Failure",
    description: "TODO: describe this challenge in one sentence.",
  },
  examples,
  Algorithm: FulfilledOrdersBeforeFailure,
  Scene: FulfilledOrdersBeforeFailureScene,
};

export function runDefault(): Trace<FulfilledOrdersBeforeFailureState> {
  return runAndTrace(FulfilledOrdersBeforeFailure, examples[0].input);
}

export { FulfilledOrdersBeforeFailure, FulfilledOrdersBeforeFailureScene, examples };
export type { FulfilledOrdersBeforeFailureInput, FulfilledOrdersBeforeFailureState };
