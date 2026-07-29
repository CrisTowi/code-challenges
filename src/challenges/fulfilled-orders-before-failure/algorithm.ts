import { TracedAlgorithm } from "@framework";

export interface FulfilledOrdersBeforeFailureInput {
  orders: string[][];
  freezerStock: {
    [key: string]: number;
  };
}

export interface FulfilledOrdersBeforeFailureState {
  fulfilledOrders: number,
  orders: string[][];
  freezerStock: {
    [key: string]: number;
  };
}

export class FulfilledOrdersBeforeFailure extends TracedAlgorithm<FulfilledOrdersBeforeFailureInput, FulfilledOrdersBeforeFailureState> {
  protected initialState(input: FulfilledOrdersBeforeFailureInput): FulfilledOrdersBeforeFailureState {
    return {
      orders: input.orders,
      freezerStock: input.freezerStock,
      fulfilledOrders: 0,
    } as FulfilledOrdersBeforeFailureState;
  }

  run(): number {
    for (let i = 0; i < this.currentState.orders.length; i++) {
      let orderItems = this.currentState.orders[i];

      for (let j = 0; j < orderItems.length; j++) {
        let flavourStock = this.currentState.freezerStock[orderItems[j]];

        if (!flavourStock) {
          this.snapshot('noMoreIngredients');
          return this.currentState.fulfilledOrders; 
        } else {
          this.currentState.freezerStock[orderItems[j]] -= 1;
        }
      }

      this.currentState.fulfilledOrders += 1;
      this.snapshot('foundIngredient');
    }

    return this.currentState.fulfilledOrders;
  }
}
