import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { FulfilledOrdersBeforeFailure, type FulfilledOrdersBeforeFailureInput, type FulfilledOrdersBeforeFailureState } from "./algorithm";
import { FulfilledOrdersBeforeFailureScene } from "./scene";
import { FulfilledOrdersBeforeFailureEditor } from "./editor";
import { customInputs } from "./debug-inputs";

export const challenge: Challenge<FulfilledOrdersBeforeFailureInput, FulfilledOrdersBeforeFailureState> = {
  meta: {
    slug: "fulfilled-orders-before-failure",
    title: "Fulfilled Orders Before Failure",
    description: "Process an order queue against a freezer of flavors. Each order consumes one of each listed flavor; the first order that asks for an empty slot stops the line.",
  },
  Algorithm: FulfilledOrdersBeforeFailure,
  Scene: FulfilledOrdersBeforeFailureScene,
  customInputs,
  Editor: FulfilledOrdersBeforeFailureEditor,
};

function firstInput(): FulfilledOrdersBeforeFailureInput {
  const first = Object.values(customInputs)[0];
  if (!first) throw new Error("fulfilled-orders-before-failure: no customInputs defined");
  return first.input;
}

export function runDefault(): Trace<FulfilledOrdersBeforeFailureState> {
  return runAndTrace(FulfilledOrdersBeforeFailure, firstInput());
}

export { FulfilledOrdersBeforeFailure, FulfilledOrdersBeforeFailureScene, FulfilledOrdersBeforeFailureEditor, customInputs };
export type { FulfilledOrdersBeforeFailureInput, FulfilledOrdersBeforeFailureState };
