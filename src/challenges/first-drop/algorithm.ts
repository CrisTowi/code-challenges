import { TracedAlgorithm } from "@framework";

type subtreeDictionary = {
  [key: number]: Node;
};

interface Node {
  originalIndex: number;
  key: number;
  left: Node | null;
  right: Node | null;
}

export interface FirstDropInput {
  daysArray: number[],
  dropNumber: number,
}

export interface FirstDropState {
  tree: Node | null;
  dict: subtreeDictionary;
  daysArray: number[],
  dropNumber: number,
  currentIndex: number | null,
  result: number[],
}

export class FirstDrop extends TracedAlgorithm<FirstDropInput, FirstDropState> {
  protected initialState(input: FirstDropInput): FirstDropState {
    return {
      tree: null,
      dict: {},
      daysArray: input.daysArray,
      dropNumber: input.dropNumber,
      currentIndex: null,
      result: [],
    } as FirstDropState;
  }

  run(): number[] {
    const result: number[] = [];

    const insert = (currentNode: Node | null, node: Node) => {
      if (!currentNode) {
        this.currentState.tree = node;
        return;
      }

      if (node.key < currentNode.key) {
        if (currentNode.left) {
          insert(currentNode.left, node);
        } else {
          currentNode.left = node;
          return;
        }
      } else if (node.key >= currentNode.key) {
        if (currentNode.right) {
          insert(currentNode.right, node);
        } else {
          currentNode.right = node;
          return;
        }
      }
    }

    const firndFirstDrop = (currentNode: Node | null, node: Node, accum: number): number => {
      if (!currentNode) {
        return accum;
      }

      let newAccum = accum;
      const atLeastDrops = currentNode.key <= (node.key - this.currentState.dropNumber);

      if (atLeastDrops) {
        newAccum = Math.min(newAccum, currentNode.originalIndex - node.originalIndex);
      }

      if (currentNode.left) {
        return firndFirstDrop(currentNode.left, node, newAccum);
      }

      if (currentNode.right) {
        return firndFirstDrop(currentNode.right, node, newAccum);
      }

      return newAccum;
    }

    for (let i = this.currentState.daysArray.length - 1; i >= 0; i--) {
      this.currentState.currentIndex = i;
      const newNode: Node = {
        originalIndex: i,
        key: this.currentState.daysArray[i],
        left: null,
        right: null,
      };

      const toInsert = firndFirstDrop(this.currentState.tree, newNode, Infinity);
      insert(this.currentState.tree, newNode);

      if (toInsert === Infinity) {
        result.unshift(0);
      } else {
        result.unshift(toInsert);
      }
      this.currentState.result = [...result];
      this.snapshot("step");
    }

    this.currentState.currentIndex = null;
    this.snapshot("done");

    return result;
  }
}
