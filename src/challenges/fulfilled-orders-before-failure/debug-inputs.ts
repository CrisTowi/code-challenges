import type { FulfilledOrdersBeforeFailureInput } from "./algorithm";

export const customInputs: Record<string, { input: FulfilledOrdersBeforeFailureInput; description?: string }> = {
  basic: {
    input: {
      orders: [["chocolate"], ["chocolate"], ["chocolate"]],
      freezerStock: { chocolate: 2 },
    },
    description: "Three chocolate orders, only two in stock",
  },
  multiple: {
    input: {
      orders: [
        ["vanilla", "vanilla"],
        ["chocolate", "mint"],
        ["strawberry"],
        ["strawberry", "mint"],
      ],
      freezerStock: { vanilla: 2, chocolate: 1, mint: 1, strawberry: 5 },
    },
    description: "Mixed flavors, fails on mint",
  },
  onlyVanilla: {
    input: {
      orders: [["rocky road"], ["vanilla"]],
      freezerStock: { vanilla: 3 },
    },
    description: "Out of stock flavor requested first",
  },
  empty: {
    input: {
      orders: [["vanilla"]],
      freezerStock: {},
    },
    description: "Empty freezer",
  },
  allInStock: {
    input: {
      orders: [
        ["vanilla", "strawberry"],
        ["chocolate", "mint"],
        ["vanilla"],
        ["strawberry", "chocolate"],
      ],
      freezerStock: { vanilla: 3, chocolate: 3, strawberry: 3, mint: 3 },
    },
    description: "All orders can be fulfilled",
  },
};
