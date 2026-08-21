import type { PackRectanglesInput } from "./algorithm";

export const customInputs: Record<string, { input: PackRectanglesInput; description?: string }> = {
  grid6: {
    input: {
      containerWidth: 10,
      containerHeight: 10,
      rectWidth: 3,
      rectHeight: 4,
    } as PackRectanglesInput,
    description: "10x10 box, 3x4 rectangles → 6 fit",
  },
  grid10: {
    input: {
      containerWidth: 10,
      containerHeight: 6,
      rectWidth: 2,
      rectHeight: 3,
    } as PackRectanglesInput,
    description: "10x6 box, 2x3 rectangles → 10 fit",
  },
  overflow: {
    input: {
      containerWidth: 10,
      containerHeight: 6,
      rectWidth: 11,
      rectHeight: 2,
    } as PackRectanglesInput,
    description: "Rectangle wider than container → 0 fit",
  },
  mixed: {
    input: {
      containerWidth: 4,
      containerHeight: 5,
      rectWidth: 3,
      rectHeight: 2,
    } as PackRectanglesInput,
    description: "Mixed position of the small rect (one horizontal and one vertical) -> 2 fit",
  },
};