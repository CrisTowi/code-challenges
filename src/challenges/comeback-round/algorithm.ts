import { TracedAlgorithm } from "@framework";

export interface ComebackRoundInput {
  rounds: number[][];
}

export interface ComebackRoundState {
  rounds: number[][];
  // viz-only: start
  index: number | null;
  totals: number[];
  phase: "init" | "lap" | "finish" | "tie" | "replay" | "done";
  winner: number | null;
  result: number | null;
  soleLeader: boolean | null;
  changed: boolean;
  // viz-only: end
}

export class ComebackRound extends TracedAlgorithm<ComebackRoundInput, ComebackRoundState> {
  protected initialState(input: ComebackRoundInput): ComebackRoundState {
    // TODO: build the starting state from the input
    return {
      rounds: input.rounds,
      // viz-only: start
      index: null,
      totals: new Array(input.rounds[0]?.length ?? 0).fill(0),
      phase: "init",
      winner: null,
      result: null,
      soleLeader: null,
      changed: false,
      // viz-only: end
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
            // viz-only: start — photo finish: the top spot is shared
            this.currentState.index = index;
            this.currentState.totals = [...curr];
            this.currentState.winner = null;
            this.currentState.phase = "tie";
            this.snapshot("tie");
            // viz-only: end
            return -1;
          }
        }

        // viz-only: start — chequered flag: a sole winner crosses the line
        this.currentState.index = index;
        this.currentState.totals = [...curr];
        this.currentState.winner = biggestIndex;
        this.currentState.phase = "finish";
        this.snapshot("finish");
        // viz-only: end
        return biggestIndex;
      }

      const newCurr = curr.map((val, i) => {
        return val + this.currentState.rounds[index][i]
      });

      // viz-only: start — one more lap: karts advance by this round's points
      this.currentState.index = index;
      this.currentState.totals = [...newCurr];
      this.currentState.phase = "lap";
      this.snapshot("lap");
      // viz-only: end

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

      // viz-only: start — replay frame: was the winner already in front before this lap?
      this.currentState.index = index;
      this.currentState.totals = [...curr];
      this.currentState.winner = winner;
      this.currentState.soleLeader = _isTheWinnerSoleWinner(winner, curr);
      this.currentState.result = result;
      this.currentState.changed = changed;
      this.currentState.phase = "replay";
      this.snapshot("replay");
      // viz-only: end

      return winner;
    }

    _comebackRound(0, new Array(this.currentState.rounds[0].length).fill(0));

    // viz-only: start
    this.currentState.index = null;
    this.currentState.result = result;
    this.currentState.soleLeader = null;
    this.currentState.phase = "done";
    this.snapshot("done");
    // viz-only: end
    return result;
  }
}
