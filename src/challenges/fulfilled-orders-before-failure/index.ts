import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { FulfilledOrdersBeforeFailure, type FulfilledOrdersBeforeFailureInput, type FulfilledOrdersBeforeFailureState } from "./algorithm";
import { FulfilledOrdersBeforeFailureScene } from "./scene";
import { examples } from "./examples";

import { customInputs } from "./debug-inputs";

export const challenge: Challenge<FulfilledOrdersBeforeFailureInput, FulfilledOrdersBeforeFailureState> = {
  meta: {
    slug: "fulfilled-orders-before-failure",
    title: "Fulfilled Orders Before Failure",
    description: "Process an order queue against a freezer of flavors. Each order consumes one of each listed flavor; the first order that asks for an empty slot stops the line.",
  },
  examples,
  Algorithm: FulfilledOrdersBeforeFailure,
  Scene: FulfilledOrdersBeforeFailureScene,
  customInputs,
};

export function runDefault(): Trace<FulfilledOrdersBeforeFailureState> {
  return runAndTrace(FulfilledOrdersBeforeFailure, examples[0].input);
}

export { FulfilledOrdersBeforeFailure, FulfilledOrdersBeforeFailureScene, examples, customInputs };
export type { FulfilledOrdersBeforeFailureInput, FulfilledOrdersBeforeFailureState };
