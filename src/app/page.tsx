"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { QuickStartSheet } from "@/components/QuickStartSheet";
import { RecordList } from "@/components/RecordList";
import { RecordSheet } from "@/components/RecordSheet";
import { RunningRecordCard } from "@/components/RunningRecordCard";
import { addDays, createId, displayDate, nowTime, toDateKey, toTimeKey, todayKey } from "@/lib/time";
import {
  deleteRecord,
  finishRunningRecord,
  getCategories,
  getRecordsByDate,
  getRunningRecord,
  saveRecord,
  startRunningRecord,
} from "@/lib/db";
import type { Category, TimeRecord } from "@/types/time";

export default function TodayPage() {
  const [date, setDate] = useState(todayKey);
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [runningRecord, setRunningRecord] = useState<TimeRecord | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingRecord, setEditingRecord] = useState<TimeRecord | null>(null);
  const [recordSheetOpen, setRecordSheetOpen] = useState(false);
  const [quickStartOpen, setQuickStartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [nextCategories, nextRecords, nextRunningRecord] = await Promise.all([
      getCategories(),
      getRecordsByDate(date),
      getRunningRecord(),
    ]);
    setCategories(nextCategories);
    setRunningRecord(nextRunningRecord);
    setRecords(nextRecords.filter((record) => record.id !== nextRunningRecord?.id));
    setLoading(false);
  }, [date]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const title = useMemo(() => (date === todayKey() ? "今天" : displayDate(date)), [date]);

  async function handleSave(record: TimeRecord) {
    await saveRecord(record);
    setRecordSheetOpen(false);
    setEditingRecord(null);
    await loadData();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("确定删除这条记录吗？")) return;
    await deleteRecord(id);
    await loadData();
  }

  async function handleQuickStart(categoryId: string, note: string) {
    const clickedAt = new Date();
    await startRunningRecord({
      id: createId("record"),
      date: toDateKey(clickedAt),
      startTime: toTimeKey(clickedAt),
      endTime: null,
      categoryId,
      note,
      isRunning: true,
    });
    setQuickStartOpen(false);
    await loadData();
  }

  async function handleFinishRunning() {
    if (!runningRecord) return;
    await finishRunningRecord(runningRecord.id, nowTime());
    await loadData();
  }

  return (
    <AppShell activeTab="today">
      <header className="safe-top sticky top-0 z-10 -mx-4 bg-paper/90 px-4 pb-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="h-10 w-10 rounded-full bg-white text-xl shadow-sm"
            onClick={() => setDate((value) => addDays(value, -1))}
            aria-label="前一天"
          >
            ‹
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
            <p className="mt-0.5 text-sm text-slate-500">{date}</p>
          </div>
          <button
            type="button"
            className="h-10 w-10 rounded-full bg-white text-xl shadow-sm"
            onClick={() => setDate((value) => addDays(value, 1))}
            aria-label="后一天"
          >
            ›
          </button>
        </div>
      </header>

      <main className="pb-28 pt-3">
        {loading ? (
          <div className="rounded-lg bg-white p-5 text-center text-slate-500 shadow-sm">正在读取记录...</div>
        ) : (
          <>
            {runningRecord ? (
              <RunningRecordCard
                record={runningRecord}
                categories={categories}
                onFinish={handleFinishRunning}
                onEdit={() => {
                  setEditingRecord(runningRecord);
                  setRecordSheetOpen(true);
                }}
              />
            ) : (
              <button
                type="button"
                className="mb-4 flex w-full items-center justify-between rounded-xl bg-ink p-4 text-left text-white shadow-soft"
                onClick={() => setQuickStartOpen(true)}
              >
                <span>
                  <span className="block text-lg font-semibold">开始记录</span>
                  <span className="mt-1 block text-sm text-white/70">用点击当下的本地时间开始计时</span>
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl leading-none text-ink">+</span>
              </button>
            )}

            <RecordList
              records={records}
              categories={categories}
              onEdit={(record) => {
                setEditingRecord(record);
                setRecordSheetOpen(true);
              }}
              onDelete={handleDelete}
            />
          </>
        )}
      </main>

      <button
        type="button"
        className="fixed bottom-24 right-5 z-20 h-14 w-14 rounded-full bg-white text-3xl leading-none text-ink shadow-soft"
        onClick={() => {
          setEditingRecord(null);
          setRecordSheetOpen(true);
        }}
        aria-label="手动补录"
      >
        +
      </button>

      <QuickStartSheet
        open={quickStartOpen}
        categories={categories}
        onClose={() => setQuickStartOpen(false)}
        onStart={handleQuickStart}
      />

      <RecordSheet
        open={recordSheetOpen}
        date={date}
        record={editingRecord}
        categories={categories}
        onClose={() => {
          setRecordSheetOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSave}
      />
    </AppShell>
  );
}
