import type { FulfilledOrdersBeforeFailureInput } from "./algorithm";

export const customInputs: Record<string, FulfilledOrdersBeforeFailureInput> = {
  basic: {
    orders: [["chocolate"],["chocolate"],["chocolate"]],
    freezerStock: { "chocolate": 2 }
  },
  multiple: {
    orders: [["vanilla","vanilla"],["chocolate","mint"],["strawberry"],["strawberry","mint"]],
    freezerStock: { vanilla: 2, chocolate: 1, mint: 1, strawberry: 5 }
  },
  onlyVanilla: {
    orders: [["rocky road"],["vanilla"]],
    freezerStock: { vanilla: 3 }
  }
};
