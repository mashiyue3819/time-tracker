"use client";

import { openDB, type DBSchema } from "idb";
import { defaultCategories } from "@/lib/defaults";
import {
  getLogicalDayKey,
  getRecordSegmentForLogicalDay,
  makeLocalDateTime,
  parseStoredDate,
  toTimeKey,
} from "@/lib/time";
import type { Category, TimeRecord } from "@/types/time";

type StoredRecord = Partial<TimeRecord> & {
  id: string;
  categoryId: string;
  note?: string;
  date?: string;
  startTime?: string;
  endTime?: string | null;
  isRunning?: boolean;
  startedAt?: string;
  endedAt?: string | null;
};

interface TimeTrackerDB extends DBSchema {
  records: {
    key: string;
    value: StoredRecord;
    indexes: {
      "by-date": string;
    };
  };
  categories: {
    key: string;
    value: Category;
  };
}

const dbPromise =
  typeof window === "undefined"
    ? null
    : openDB<TimeTrackerDB>("time-tracker-pwa", 1, {
        upgrade(db) {
          const recordStore = db.createObjectStore("records", { keyPath: "id" });
          recordStore.createIndex("by-date", "date");
          db.createObjectStore("categories", { keyPath: "id" });
        },
      });

async function getDb() {
  if (!dbPromise) {
    throw new Error("IndexedDB 只能在浏览器中使用");
  }
  return dbPromise;
}

function getLegacyStart(raw: StoredRecord) {
  const dateKey = raw.date || getLogicalDayKey(new Date());
  const timeKey = raw.startTime || "00:00";
  return makeLocalDateTime(dateKey, timeKey) ?? new Date();
}

function getLegacyEnd(raw: StoredRecord, start: Date) {
  if (!raw.endTime) return null;
  let end = makeLocalDateTime(raw.date || getLogicalDayKey(start), raw.endTime);
  if (!end) return null;

  if (raw.startTime && raw.endTime < raw.startTime) {
    end = new Date(end);
    end.setDate(end.getDate() + 1);
  }

  return end;
}

function normalizeRecord(raw: StoredRecord): { record: TimeRecord; migrated: boolean } {
  const parsedStart = parseStoredDate(raw.startedAt);
  const start = parsedStart ?? getLegacyStart(raw);
  const parsedEndedAt = raw.endedAt === null ? null : parseStoredDate(raw.endedAt);
  const legacyEnd = raw.endedAt === undefined ? getLegacyEnd(raw, start) : null;
  let end = parsedEndedAt ?? legacyEnd;

  if (end && end < start) {
    end = new Date(end);
    end.setDate(end.getDate() + 1);
  }

  const record: TimeRecord = {
    id: raw.id,
    categoryId: raw.categoryId,
    note: raw.note ?? "",
    isRunning: Boolean(raw.isRunning && !end),
    startedAt: start.toISOString(),
    endedAt: end ? end.toISOString() : null,
    date: getLogicalDayKey(start),
    startTime: toTimeKey(start),
    endTime: end ? toTimeKey(end) : null,
  };

  const migrated =
    raw.startedAt !== record.startedAt ||
    (raw.endedAt ?? null) !== record.endedAt ||
    raw.date !== record.date ||
    raw.startTime !== record.startTime ||
    (raw.endTime ?? null) !== record.endTime ||
    raw.isRunning !== record.isRunning ||
    raw.note !== record.note;

  return { record, migrated };
}

async function writeMigratedRecords(records: TimeRecord[]) {
  if (records.length === 0) return;
  const db = await getDb();
  const tx = db.transaction("records", "readwrite");
  await Promise.all(records.map((record) => tx.store.put(record)));
  await tx.done;
}

export async function ensureDefaultCategories() {
  const db = await getDb();
  const count = await db.count("categories");
  if (count > 0) return;

  const tx = db.transaction("categories", "readwrite");
  await Promise.all(defaultCategories.map((category) => tx.store.put(category)));
  await tx.done;
}

export async function getCategories() {
  await ensureDefaultCategories();
  const db = await getDb();
  return db.getAll("categories");
}

export async function saveCategory(category: Category) {
  const db = await getDb();
  await db.put("categories", category);
}

export async function deleteCategory(id: string) {
  const db = await getDb();
  await db.delete("categories", id);
}

export async function getAllRecords() {
  const db = await getDb();
  const rawRecords = await db.getAll("records");
  const normalized = rawRecords.map(normalizeRecord);
  await writeMigratedRecords(normalized.filter((item) => item.migrated).map((item) => item.record));
  return normalized.map((item) => item.record).sort((a, b) => a.startedAt.localeCompare(b.startedAt));
}

export async function getRecordsByDate(dayKey: string) {
  const records = await getAllRecords();
  const now = new Date();
  return records.filter((record) => getRecordSegmentForLogicalDay(record, dayKey, undefined, now));
}

export async function getRecordsByDates(dayKeys: string[]) {
  const records = await getAllRecords();
  const now = new Date();
  const dayKeySet = new Set(dayKeys);
  return records.filter((record) => {
    for (const dayKey of dayKeySet) {
      if (getRecordSegmentForLogicalDay(record, dayKey, undefined, now)) return true;
    }
    return false;
  });
}

export async function saveRecord(record: TimeRecord) {
  const db = await getDb();
  const normalized = normalizeRecord(record).record;

  if (normalized.isRunning) {
    const records = await getAllRecords();
    const tx = db.transaction("records", "readwrite");
    await Promise.all(
      records
        .filter((item) => item.id !== normalized.id && item.isRunning)
        .map((item) =>
          tx.store.put({
            ...item,
            isRunning: false,
            endedAt: normalized.startedAt,
            endTime: toTimeKey(new Date(normalized.startedAt)),
          }),
        ),
    );
    await tx.store.put(normalized);
    await tx.done;
    return;
  }

  await db.put("records", normalized);
}

export async function getRunningRecord() {
  const records = await getAllRecords();
  return records.find((record) => record.isRunning && !record.endedAt) ?? null;
}

export async function startRunningRecord(record: TimeRecord) {
  const db = await getDb();
  const normalized = normalizeRecord({ ...record, endedAt: null, endTime: null, isRunning: true }).record;
  const records = await getAllRecords();
  const startDate = new Date(normalized.startedAt);
  const tx = db.transaction("records", "readwrite");

  await Promise.all(
    records
      .filter((item) => item.isRunning)
      .map((item) =>
        tx.store.put({
          ...item,
          isRunning: false,
          endedAt: normalized.startedAt,
          endTime: toTimeKey(startDate),
        }),
      ),
  );

  await tx.store.put(normalized);
  await tx.done;
}

export async function finishRunningRecord(id: string, endedAt: string) {
  const db = await getDb();
  const rawRecord = await db.get("records", id);
  if (!rawRecord) return;

  const record = normalizeRecord(rawRecord).record;
  const end = parseStoredDate(endedAt) ?? new Date();
  await db.put("records", {
    ...record,
    endedAt: end.toISOString(),
    endTime: toTimeKey(end),
    isRunning: false,
  });
}

export async function deleteRecord(id: string) {
  const db = await getDb();
  await db.delete("records", id);
}
