import { TracedAlgorithm } from "@framework";

export interface PackRectanglesInput {
  containerWidth: number,
  containerHeight: number,
  rectWidth: number,
  rectHeight: number,
}

export interface PackRectanglesState {
  count: number,
  containerWidth: number,
  containerHeight: number,
  rectWidth: number,
  rectHeight: number,
}

export class PackRectangles extends TracedAlgorithm<PackRectanglesInput, PackRectanglesState> {
  protected initialState(input: PackRectanglesInput): PackRectanglesState {
    return {
      count: 0,
      containerWidth: input.containerWidth,
      containerHeight: input.containerHeight,
      rectWidth: input.rectWidth,
      rectHeight: input.rectHeight,
    } as PackRectanglesState;
  }

  run(): number {
    const evaluateSquare = (containerWidth: number, containerHeight: number, rectWidth: number, rectHeight: number) => {
      const baseRectHorizontal = Math.floor((containerWidth / rectWidth))
      const baseRectVertical = Math.floor((containerHeight / rectHeight));
  
      if (baseRectHorizontal <= 0 || baseRectVertical <= 0) {
        return 0;
      }
      
      const baseRect = (baseRectHorizontal * baseRectVertical);
  
      const restBaseRectHorizontal = containerWidth - (baseRectHorizontal * rectWidth);
      const restBaseRectVertical = containerHeight - (baseRectVertical * rectHeight);

      return baseRect + evaluateSquares(restBaseRectHorizontal, this.currentState.containerHeight, rectWidth, rectHeight) + evaluateSquares(restBaseRectVertical, this.currentState.containerWidth, rectWidth, rectHeight);
    }


    const evaluateSquares = (containerWidth: number, containerHeight: number, rectWidth: number, rectHeight: number): number => {
      return Math.max(evaluateSquare(
        containerWidth,
        containerHeight,
        rectWidth,
        rectHeight
      ), evaluateSquare(
        containerWidth,
        containerHeight,
        rectHeight,
        rectWidth,
      ));
    }

    const result = evaluateSquares(
      this.currentState.containerWidth,
      this.currentState.containerHeight,
      this.currentState.rectWidth,
      this.currentState.rectHeight
    );

    this.currentState.count = result;
    this.snapshot("result");

    return result;
  }
}
