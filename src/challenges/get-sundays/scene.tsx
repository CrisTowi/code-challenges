import { useEffect, useRef, useState } from "react";
import type { Snapshot } from "@framework";
import {
  ensureAudioRunning,
  playTone,
  playSundayFanfare,
  playSuccess,
} from "@framework/audio";
import type { GetSundaysState } from "./algorithm";
import styles from "./scene.module.css";

const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SCAN_HZ = 392.0;
const FANFARE_DURATION_MS = 1500;

const SPARKLE_CLASSES = [
  styles["sparkle--n"],
  styles["sparkle--ne"],
  styles["sparkle--ene"],
  styles["sparkle--e"],
  styles["sparkle--ese"],
  styles["sparkle--se"],
  styles["sparkle--sse"],
  styles["sparkle--s"],
  styles["sparkle--ssw"],
  styles["sparkle--sw"],
  styles["sparkle--wsw"],
  styles["sparkle--w"],
  styles["sparkle--wnw"],
  styles["sparkle--nw"],
  styles["sparkle--nnw"],
];

function zellerToSunFirstColumn(zellerIndex: number): number {
  return (zellerIndex + 6) % 7;
}

type CalendarCell = {
  day: number | null;
  key: string;
};

function buildCells(firstDayZeller: number, daysOnTheMonth: number): CalendarCell[] {
  const cells: CalendarCell[] = [];
  const offset = zellerToSunFirstColumn(firstDayZeller);
  for (let i = 0; i < offset; i++) {
    cells.push({ day: null, key: `pad-${i}` });
  }
  for (let d = 1; d <= daysOnTheMonth; d++) {
    cells.push({ day: d, key: `day-${d}` });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: null, key: `tail-${cells.length}` });
  }
  return cells;
}

function dayStatus(
  day: number,
  currentDay: number | null,
): "future" | "past" | "current" {
  if (currentDay == null) return "future";
  if (day < currentDay) return "past";
  if (day === currentDay) return "current";
  return "future";
}

type FanfareEvent = {
  day: number;
  token: number;
};

export function GetSundaysScene({ snapshot }: { snapshot: Snapshot<GetSundaysState> }) {
  const { year, month, total, firstDayOfMonth, daysOnTheMonth, currentDay, sundays } = snapshot.state;
  const label = snapshot.label;

  const [fanfare, setFanfare] = useState<FanfareEvent | null>(null);

  const labelRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (label === labelRef.current) return;
    labelRef.current = label;
    if (!label) return;
    void ensureAudioRunning();
    if (label === "scan") playTone(SCAN_HZ, 35);
    else if (label === "sunday") playSundayFanfare();
    else if (label === "done") playSuccess();
  }, [label]);

  useEffect(() => {
    if (label !== "sunday" || currentDay == null) return;
    const token = Date.now() + Math.random();
    setFanfare({ day: currentDay, token });
    const t = setTimeout(() => {
      setFanfare((current) => (current && current.token === token ? null : current));
    }, FANFARE_DURATION_MS);
    return () => clearTimeout(t);
  }, [label, currentDay]);

  const cells = buildCells(firstDayOfMonth, daysOnTheMonth);
  const sundayDaySet = new Set(sundays.map((s) => Number(s.split("-")[2])));

  const isInit = label === "init";
  const isCalendar = label === "calendar";
  const isDone = label === "done";
  const isSundayFound = label === "sunday";

  const statusText = isInit
    ? "ready"
    : isCalendar
      ? "ready · press play"
      : isSundayFound
        ? `★ sunday found: day ${currentDay}`
        : isDone
          ? `done · ${total} sunday${total === 1 ? "" : "s"}`
          : label === "scan"
            ? `scanning day ${currentDay}`
            : "—";

  const renderCell = (cell: CalendarCell) => {
    if (cell.day == null) {
      return <div key={cell.key} className={`${styles.cell} ${styles["cell--empty"]}`} />;
    }
    const day = cell.day;
    const status = dayStatus(day, currentDay);
    const isSunday = sundayDaySet.has(day);
    const isCurrent = status === "current";
    const isFanfareActive = fanfare?.day === day;

    const classes = [styles.cell];
    if (status === "future") classes.push(styles["cell--future"]);
    if (status === "past") classes.push(styles["cell--past"]);
    if (isCurrent) classes.push(styles["cell--current"]);
    if (isSunday) classes.push(styles["cell--sunday"]);
    if (isFanfareActive) classes.push(styles["cell--fanfare"]);

    return (
      <div
        key={`${cell.key}-${isFanfareActive ? "fanfare" : "plain"}`}
        className={classes.join(" ")}
      >
        {day}
        {isSunday && !isFanfareActive && <span className={styles.sundayBadge}>★</span>}
        {isFanfareActive && (
          <>
            <span className={styles.fanfareRing} aria-hidden="true" />
            {SPARKLE_CLASSES.map((cls, i) => (
              <span
                key={`sparkle-${day}-${i}`}
                className={`${styles.sparkle} ${cls}`}
                style={{ animationDelay: `${(i * 60) % FANFARE_DURATION_MS}ms` }}
              />
            ))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="scene">
      <div className={styles.sceneContent}>
        <div className={styles.header}>
          <h2 className={styles.monthTitle}>{MONTH_NAMES[month]} {year}</h2>
          <p className={styles.subtitle}>▸ get sundays</p>
        </div>

        <div className={styles.calendar}>
          <div className={styles.dayHeaders}>
            {DAY_HEADERS.map((d, i) => (
              <div
                key={`dh-${i}`}
                className={`${styles.dayHeader} ${i === 0 ? styles["dayHeader--sunday"] : ""}`}
              >
                {d}
              </div>
            ))}
          </div>

          <div className={styles.grid}>
            {cells.map(renderCell)}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footer__row}>
            <span className={styles.footer__label}>{label ?? "—"}</span>
            <span
              className={`${styles.footer__chip} ${styles["footer__chip--sorted"]} ${
                isSundayFound ? styles["footer__chip--success"] : ""
              }`}
            >
              {total} sunday{total === 1 ? "" : "s"} found
            </span>
            <span className={styles.footer__chip}>
              day {currentDay ?? "—"} / {daysOnTheMonth}
            </span>
            <span className={styles.footer__chip}>{statusText}</span>
          </div>

          {sundays.length > 0 && (
            <div className={styles.sundaysBlock}>
              <span className={styles.sundaysBlock__label}>▸ sundays</span>
              <div className={styles.sundaysList}>
                {sundays.map((s, i) => {
                  const isLatest = i === sundays.length - 1;
                  const isFanfareLatest = isLatest && fanfare?.day === Number(s.split("-")[2]);
                  return (
                    <span
                      key={`sun-${s}`}
                      className={`${styles.sundayItem} ${isFanfareLatest ? styles["sundayItem--fanfare"] : ""}`}
                    >
                      {s}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
