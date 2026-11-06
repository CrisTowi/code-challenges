import { TracedAlgorithm } from "@framework";

export interface ElapsedMinutesInput {
  log: string[]
}

export interface ElapsedMinutesState {
  log: string[]
}

export class ElapsedMinutes extends TracedAlgorithm<ElapsedMinutesInput, ElapsedMinutesState> {
  protected initialState(input: ElapsedMinutesInput): ElapsedMinutesState {
    // TODO: build the starting state from the input
    return {
      log: input.log
    } as ElapsedMinutesState;
  }

  run(): number {
    const calculateMinutes = (time1: string, time2: string) => {
      let [hour1, min1] = time1.split(':').map(str => parseInt(str));
      let [hour2, min2] = time2.split(':').map(str => parseInt(str));

      let minsDiff = 0;

      if (min2 >= min1) {
        minsDiff = min2 - min1
      } else {
        minsDiff = (60 - min1) + min2;
        if (hour1 !== hour2) {
          hour1 += 1;
        }
      }

      return (((hour2 - hour1) * 60) + minsDiff);
    }

    let result = 0;

    for (let i = 0; i < this.currentState.log.length - 1; i++) {
      result += calculateMinutes(this.currentState.log[i], this.currentState.log[i + 1]);
    }

    return result;
  }
}
