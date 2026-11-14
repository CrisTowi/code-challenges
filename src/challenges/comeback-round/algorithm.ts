import { TracedAlgorithm } from "@framework";

export interface ComebackRoundInput {
  rounds: number[][];
}

export interface ComebackRoundState {
  rounds: number[][];
}

export class ComebackRound extends TracedAlgorithm<ComebackRoundInput, ComebackRoundState> {
  protected initialState(input: ComebackRoundInput): ComebackRoundState {
    // TODO: build the starting state from the input
    return {
      rounds: input.rounds,
    } as ComebackRoundState;
  }
  
  run(): number {
    let result = this.currentState.rounds.length;
    let changed = false;

    const _isTheWinnerSoleWinner = (winner: number, curr: number[]) => {
      for (let i = 0; i < curr.length; i++) {
        if (i !== winner && curr[i] >= curr[winner]) {
          return false;
        }
      }

      return true;
    };

    const _comebackRound = (index: number, curr: number[]) => {
      if (index === this.currentState.rounds.length) {
        let biggestIndex = 0;

        for (let i = 0; i < curr.length; i++) {
          if (curr[i] > curr[biggestIndex]) {
            biggestIndex = i;
          }
        }

        for (let i = 0; i < curr.length; i++) {
          if (i !== biggestIndex && curr[i] === curr[biggestIndex]) {
            return -1;
          }
        }

        return biggestIndex;
      }

      const newCurr = curr.map((val, i) => {
        return val + this.currentState.rounds[index][i]
      });

      const winner: number = _comebackRound(index + 1, newCurr);

      if (winner === -1) {
        result = -1;
      }

      if (result === -1) {
        return result;
      }

      if (_isTheWinnerSoleWinner(winner, curr) && !changed) {
        result = this.currentState.rounds.length - index;
      } else {
        changed = true;
      }

      return result;
    }

    return _comebackRound(0, new Array(this.currentState.rounds[0].length).fill(0));
  }
}
