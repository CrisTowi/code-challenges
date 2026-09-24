import { TracedAlgorithm } from "@framework";

const MONTHS: { [key: number]: number } = {
  1: 13,
  2: 14,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  11: 11,
  12: 12,
};

export interface GetSundaysInput {
  year: number,
  month: number,
}

export interface GetSundaysState {
  year: number,
  month: number,
  total: number,
}

export class GetSundays extends TracedAlgorithm<GetSundaysInput, GetSundaysState> {
  protected initialState(input: GetSundaysInput): GetSundaysState {
    return {
      year: input.year,
      month: input.month,
      total: 0
    } as GetSundaysState;
  }

  getFirstDayOfMonth(year: number, month: number): number {
    const q = 1;
    const m = MONTHS[month];
    const adjustedYear = m > 12 ? year - 1 : year;

    const K = adjustedYear % 100;
    const J = Math.floor(adjustedYear / 100);

    const n = q + 
            Math.floor((13 * (m + 1)) / 5) + 
            K + 
            Math.floor(K / 4) + 
            Math.floor(J / 4) - 
            (2 * J);

    return ((n % 7) + 7) % 7;
  }

  run(): string[] {
    const result = [];
    const currentFirstDayOfMonth = this.getFirstDayOfMonth(this.currentState.year, this.currentState.month);
    const currentNextDayOfMonth = this.getFirstDayOfMonth(
      this.currentState.month === 12 ? this.currentState.year + 1 : this.currentState.year,
      this.currentState.month === 12 ? 1 : this.currentState.month + 1,
    );

    const daysUntilSunday = 8 - currentFirstDayOfMonth;
    const diffDays = currentNextDayOfMonth >= currentFirstDayOfMonth
      ? currentNextDayOfMonth - currentFirstDayOfMonth
      : 6 - currentFirstDayOfMonth + currentNextDayOfMonth;

    const daysOnTheMonth = 28 + diffDays

    let curr = currentFirstDayOfMonth;
    for (let i = 1; i <= daysOnTheMonth; i++) {
      if (curr === 1) {
        result.push(
          `${this.currentState.year}-${this.currentState.month}-${i}`
        )
      }

      if (curr >= 6) {
        curr = 0;
      } else {
        curr += 1;
      }
    }

    return result;
  }
}
