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
  firstDayOfMonth: number,
  daysOnTheMonth: number,
  currentDay: number | null,
  currentDayOfWeek: number | null,
  sundays: string[],
}

export class GetSundays extends TracedAlgorithm<GetSundaysInput, GetSundaysState> {
  protected initialState(input: GetSundaysInput): GetSundaysState {
    const firstDayOfMonth = this.getFirstDayOfMonth(input.year, input.month);
    const nextYear = input.month === 12 ? input.year + 1 : input.year;
    const nextMonth = input.month === 12 ? 1 : input.month + 1;
    const nextFirstDayOfMonth = this.getFirstDayOfMonth(nextYear, nextMonth);
    const diffDays = nextFirstDayOfMonth >= firstDayOfMonth
      ? nextFirstDayOfMonth - firstDayOfMonth
      : 6 - firstDayOfMonth + nextFirstDayOfMonth;

    return {
      year: input.year,
      month: input.month,
      total: 0,
      firstDayOfMonth,
      daysOnTheMonth: 28 + diffDays,
      currentDay: null,
      currentDayOfWeek: null,
      sundays: [],
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
    const result = this.currentState.sundays;
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

    this.currentState.firstDayOfMonth = currentFirstDayOfMonth;
    this.currentState.daysOnTheMonth = daysOnTheMonth;
    this.snapshot("calendar");

    let curr = currentFirstDayOfMonth;
    for (let i = 1; i <= daysOnTheMonth; i++) {
      this.currentState.currentDay = i;
      this.currentState.currentDayOfWeek = curr;
      this.snapshot("scan");

      if (curr === 1) {
        result.push(
          `${this.currentState.year}-${this.currentState.month}-${i}`
        )
        this.currentState.total = result.length;
        this.snapshot("sunday");
      }

      if (curr >= 6) {
        curr = 0;
      } else {
        curr += 1;
      }
    }

    this.currentState.currentDay = null;
    this.currentState.currentDayOfWeek = null;
    this.snapshot("done");

    return result;
  }
}
