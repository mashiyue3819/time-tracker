import type { TimeRecord, TimeRecordSegment } from "@/types/time";

export const LOGICAL_DAY_BOUNDARY_HOUR = 4;

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "long",
  day: "numeric",
  weekday: "short",
});

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toTimeKey(date: Date) {
  return `${date.getHours()}`.padStart(2, "0") + ":" + `${date.getMinutes()}`.padStart(2, "0");
}

export function nowTime() {
  return toTimeKey(new Date());
}

export function todayKey() {
  return getLogicalDayKey(new Date());
}

export function addDays(dateKey: string, amount: number) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

export function displayDate(dateKey: string) {
  return dateFormatter.format(parseDateKey(dateKey));
}

export function displayDateTime(date: Date) {
  return `${toDateKey(date)} ${toTimeKey(date)}`;
}

export function displaySegmentTime(start: Date, end: Date) {
  const sameNaturalDay = toDateKey(start) === toDateKey(end);
  if (sameNaturalDay) return `${toTimeKey(start)} - ${toTimeKey(end)}`;
  return `${displayDateTime(start)} - ${displayDateTime(end)}`;
}

export function getDateRange(days: number, now = new Date()) {
  const endKey = getLogicalDayKey(now);
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    dates.push(addDays(endKey, -i));
  }
  return dates;
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  if ([year, month, day].some(Number.isNaN)) return new Date();
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function makeLocalDateTime(dateKey: string, timeKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = timeKey.split(":").map(Number);
  if ([year, month, day, hour, minute].some(Number.isNaN)) return null;
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function parseStoredDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toDateTimeLocalValue(date: Date) {
  return `${toDateKey(date)}T${toTimeKey(date)}`;
}

export function parseDateTimeLocalValue(value: string) {
  if (!value) return null;
  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return null;
  return makeLocalDateTime(datePart, timePart);
}

export function getLogicalDayKey(date: Date, boundaryHour = LOGICAL_DAY_BOUNDARY_HOUR) {
  const local = new Date(date);
  if (local.getHours() < boundaryHour) {
    local.setDate(local.getDate() - 1);
  }
  return toDateKey(local);
}

export function getLogicalDayRange(dayKey: string, boundaryHour = LOGICAL_DAY_BOUNDARY_HOUR) {
  const start = makeLocalDateTime(dayKey, `${`${boundaryHour}`.padStart(2, "0")}:00`) ?? new Date();
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return [start, end] as const;
}

export function durationBetweenDates(start: Date, end: Date) {
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}

export function durationMinutes(startTime: string, endTime: string | null) {
  if (!endTime) return 0;
  const start = makeLocalDateTime("2000-01-01", startTime);
  let end = makeLocalDateTime("2000-01-01", endTime);
  if (!start || !end) return 0;
  if (end < start) {
    end = new Date(end);
    end.setDate(end.getDate() + 1);
  }
  return durationBetweenDates(start, end);
}

export function getRecordStart(record: TimeRecord) {
  return parseStoredDate(record.startedAt);
}

export function getRecordEnd(record: TimeRecord, now = new Date()) {
  if (record.endedAt) return parseStoredDate(record.endedAt);
  if (record.isRunning) return now;
  return null;
}

export function recordDuration(record: TimeRecord, now = new Date()) {
  const start = getRecordStart(record);
  const end = getRecordEnd(record, now);
  if (!start || !end) return 0;
  return durationBetweenDates(start, end);
}

export function runningDurationMinutes(record: TimeRecord, now = new Date()) {
  return recordDuration(record, now);
}

export function getRecordSegmentForLogicalDay(
  record: TimeRecord,
  dayKey: string,
  boundaryHour = LOGICAL_DAY_BOUNDARY_HOUR,
  now = new Date(),
): TimeRecordSegment | null {
  const recordStart = getRecordStart(record);
  const recordEnd = getRecordEnd(record, now);
  if (!recordStart || !recordEnd || recordEnd <= recordStart) return null;

  const [dayStart, dayEnd] = getLogicalDayRange(dayKey, boundaryHour);
  const segmentStart = new Date(Math.max(recordStart.getTime(), dayStart.getTime()));
  const segmentEnd = new Date(Math.min(recordEnd.getTime(), dayEnd.getTime()));
  const minutes = durationBetweenDates(segmentStart, segmentEnd);
  if (minutes <= 0) return null;

  return {
    record,
    logicalDay: dayKey,
    segmentStart,
    segmentEnd,
    minutes,
    isRunning: Boolean(record.isRunning && !record.endedAt),
  };
}

export function splitRecordByLogicalDays(
  record: TimeRecord,
  dayKeys: string[],
  boundaryHour = LOGICAL_DAY_BOUNDARY_HOUR,
  now = new Date(),
) {
  return dayKeys
    .map((dayKey) => getRecordSegmentForLogicalDay(record, dayKey, boundaryHour, now))
    .filter((segment): segment is TimeRecordSegment => Boolean(segment));
}

export function getSegmentsForLogicalDay(records: TimeRecord[], dayKey: string, now = new Date()) {
  return records
    .map((record) => getRecordSegmentForLogicalDay(record, dayKey, LOGICAL_DAY_BOUNDARY_HOUR, now))
    .filter((segment): segment is TimeRecordSegment => Boolean(segment))
    .sort((a, b) => a.segmentStart.getTime() - b.segmentStart.getTime());
}

export function formatMinutes(minutes: number) {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  if (hours === 0) return `${mins} 分钟`;
  if (mins === 0) return `${hours} 小时`;
  return `${hours} 小时 ${mins} 分钟`;
}

export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
