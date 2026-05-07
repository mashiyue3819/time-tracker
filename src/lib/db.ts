"use client";

import { openDB, type DBSchema } from "idb";
import { defaultCategories } from "@/lib/defaults";
import type { Category, TimeRecord } from "@/types/time";

interface TimeTrackerDB extends DBSchema {
  records: {
    key: string;
    value: TimeRecord;
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

function normalizeRecord(record: TimeRecord): TimeRecord {
  return {
    ...record,
    endTime: record.endTime ?? null,
    isRunning: Boolean(record.isRunning && !record.endTime),
  };
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

export async function getRecordsByDate(date: string) {
  const db = await getDb();
  const records = await db.getAllFromIndex("records", "by-date", date);
  return records.map(normalizeRecord).sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export async function getRecordsByDates(dates: string[]) {
  const groups = await Promise.all(dates.map((date) => getRecordsByDate(date)));
  return groups.flat();
}

export async function saveRecord(record: TimeRecord) {
  const db = await getDb();
  await db.put("records", normalizeRecord(record));
}

export async function getRunningRecord() {
  const db = await getDb();
  const records = await db.getAll("records");
  return records.map(normalizeRecord).find((record) => record.isRunning) ?? null;
}

export async function startRunningRecord(record: TimeRecord) {
  const db = await getDb();
  const records = (await db.getAll("records")).map(normalizeRecord);
  const tx = db.transaction("records", "readwrite");

  for (const item of records) {
    if (item.isRunning) {
      await tx.store.put({ ...item, isRunning: false, endTime: item.endTime ?? item.startTime });
    }
  }

  await tx.store.put(normalizeRecord({ ...record, endTime: null, isRunning: true }));
  await tx.done;
}

export async function finishRunningRecord(id: string, endTime: string) {
  const db = await getDb();
  const record = await db.get("records", id);
  if (!record) return;
  await db.put("records", normalizeRecord({ ...record, endTime, isRunning: false }));
}

export async function deleteRecord(id: string) {
  const db = await getDb();
  await db.delete("records", id);
}
