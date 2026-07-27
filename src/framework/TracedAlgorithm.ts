import type { Snapshot, Trace } from "./trace";

export abstract class TracedAlgorithm<I, S, O = void> {
  protected snapshots: Snapshot<S>[] = [];
  protected currentState: S;

  constructor(public readonly input: I) {
    this.currentState = this.initialState(input);
    this.snapshot("init");
  }

  abstract run(): O;

  protected initialState(_input: I): S {
    return this.currentState;
  }

  getState(): S {
    return this.currentState;
  }

  protected snapshot(label?: string): void {
    this.snapshots.push({
      state: structuredClone(this.currentState),
      label,
    });
  }

  getTrace(): Trace<S> {
    return { snapshots: this.snapshots };
  }
}

export function runAndTrace<I, S, O>(
  Ctor: new (input: I) => TracedAlgorithm<I, S, O>,
  input: I,
): Trace<S> {
  const algorithm = new Ctor(input);
  algorithm.run();
  return algorithm.getTrace();
}
