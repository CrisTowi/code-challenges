import { TracedAlgorithm } from "@framework";

export interface ElapsedMinutesInput {
  log: string[]
}

export interface ElapsedMinutesState {
  log: string[]
  // viz-only: start
  index: number | null;
  elapsed: number;
  stepMinutes: number | null;
  phase: "init" | "confused" | "falling" | "done";
  // viz-only: end
}

export class ElapsedMinutes extends TracedAlgorithm<ElapsedMinutesInput, ElapsedMinutesState> {
  protected initialState(input: ElapsedMinutesInput): ElapsedMinutesState {
    // TODO: build the starting state from the input
    return {
      log: input.log,
      // viz-only: start
      index: null,
      elapsed: 0,
      stepMinutes: null,
      phase: "init",
      // viz-only: end
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
      // viz-only: start — when the clock reads earlier than before, show the moon fooled first
      const toClock = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
      const before = result;
      this.currentState.index = i;
      if (toClock(this.currentState.log[i + 1]) < toClock(this.currentState.log[i])) {
        this.currentState.phase = "confused";
        this.currentState.stepMinutes = null;
        this.snapshot("confused");
      }
      // viz-only: end
      result += calculateMinutes(this.currentState.log[i], this.currentState.log[i + 1]);
      // viz-only: start
      this.currentState.stepMinutes = result - before;
      this.currentState.elapsed = result;
      this.currentState.phase = "falling";
      this.snapshot("falling");
      // viz-only: end
    }

    // viz-only: start
    this.currentState.index = null;
    this.currentState.phase = "done";
    this.snapshot("done");
    // viz-only: end

    return result;
  }
}
