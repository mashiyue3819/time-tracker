import type { TimeRecord } from "@/types/time";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "long",
  day: "numeric",
  weekday: "short",
});

export function todayKey() {
  return toDateKey(new Date());
}

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

export function addDays(dateKey: string, amount: number) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

export function displayDate(dateKey: string) {
  return dateFormatter.format(new Date(`${dateKey}T12:00:00`));
}

export function getDateRange(days: number) {
  const end = new Date();
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(end);
    date.setDate(end.getDate() - i);
    dates.push(toDateKey(date));
  }
  return dates;
}

export function durationMinutes(startTime: string, endTime: string | null) {
  if (!endTime) return 0;

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  if ([startHour, startMinute, endHour, endMinute].some(Number.isNaN)) {
    return 0;
  }

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  return Math.max(0, end - start);
}

export function recordDuration(record: TimeRecord) {
  return durationMinutes(record.startTime, record.endTime);
}

export function runningDurationMinutes(record: TimeRecord, now = new Date()) {
  if (!record.isRunning) return recordDuration(record);
  return durationMinutes(record.startTime, toTimeKey(now));
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
