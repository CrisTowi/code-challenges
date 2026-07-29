import type { Example } from "@framework";
import type { FulfilledOrdersBeforeFailureInput } from "./algorithm";

export const examples: Example<FulfilledOrdersBeforeFailureInput>[] = [
  {
    name: "basic",
    description: "Three chocolate orders, only two in stock — order 3 fails",
    input: {
      orders: [["chocolate"], ["chocolate"], ["chocolate"]],
      freezerStock: { chocolate: 2 },
    },
  },
  {
    name: "variety",
    description: "Mixed flavors, fails when mint runs out",
    input: {
      orders: [
        ["vanilla", "vanilla"],
        ["chocolate", "mint"],
        ["strawberry"],
        ["strawberry", "mint"],
      ],
      freezerStock: {
        vanilla: 2,
        chocolate: 1,
        mint: 1,
        strawberry: 5,
      },
    },
  },
  {
    name: "empty",
    description: "One order, nothing in the freezer",
    input: {
      orders: [["vanilla"]],
      freezerStock: {},
    },
  },
];
