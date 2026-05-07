"use client";

import { useEffect, useState } from "react";
import {
  createId,
  getLogicalDayKey,
  getLogicalDayRange,
  makeLocalDateTime,
  parseDateTimeLocalValue,
  parseStoredDate,
  toDateTimeLocalValue,
  toTimeKey,
} from "@/lib/time";
import type { Category, TimeRecord } from "@/types/time";

export function RecordSheet({
  open,
  date,
  record,
  categories,
  onClose,
  onSave,
}: {
  open: boolean;
  date: string;
  record: TimeRecord | null;
  categories: Category[];
  onClose: () => void;
  onSave: (record: TimeRecord) => void;
}) {
  const [startValue, setStartValue] = useState("");
  const [endValue, setEndValue] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;

    if (record) {
      const start = parseStoredDate(record.startedAt);
      const end = parseStoredDate(record.endedAt);
      setStartValue(start ? toDateTimeLocalValue(start) : "");
      setEndValue(end ? toDateTimeLocalValue(end) : "");
      setCategoryId(record.categoryId);
      setNote(record.note);
      return;
    }

    const now = new Date();
    const isCurrentLogicalDay = getLogicalDayKey(now) === date;
    const start = isCurrentLogicalDay ? now : makeLocalDateTime(date, "09:00") ?? getLogicalDayRange(date)[0];
    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    setStartValue(toDateTimeLocalValue(start));
    setEndValue(toDateTimeLocalValue(end));
    setCategoryId(categories[0]?.id ?? "");
    setNote("");
  }, [categories, date, open, record]);

  if (!open) return null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const start = parseDateTimeLocalValue(startValue);
    if (!start) {
      window.alert("开始时间无效，请重新选择。");
      return;
    }

    let end = endValue ? parseDateTimeLocalValue(endValue) : null;
    if (end && end <= start) {
      const sameNaturalDay = startValue.slice(0, 10) === endValue.slice(0, 10);
      if (sameNaturalDay) {
        end = new Date(end);
        end.setDate(end.getDate() + 1);
      } else {
        window.alert("结束时间不能早于开始时间。");
        return;
      }
    }

    onSave({
      id: record?.id ?? createId("record"),
      categoryId,
      note: note.trim(),
      isRunning: !end,
      startedAt: start.toISOString(),
      endedAt: end ? end.toISOString() : null,
      date: getLogicalDayKey(start),
      startTime: toTimeKey(start),
      endTime: end ? toTimeKey(end) : null,
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-slate-900/30" role="dialog" aria-modal="true">
      <button className="absolute inset-0 h-full w-full" onClick={onClose} aria-label="关闭" />
      <form className="safe-bottom relative w-full rounded-t-2xl bg-white px-5 pb-5 pt-4 shadow-soft" onSubmit={submit}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{record ? "编辑记录" : "手动补录"}</h2>
          <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-sm" onClick={onClose}>
            取消
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-600">开始时间</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"
              type="datetime-local"
              value={startValue}
              onChange={(event) => setStartValue(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-600">结束时间</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"
              type="datetime-local"
              value={endValue}
              onChange={(event) => setEndValue(event.target.value)}
            />
          </label>
        </div>

        <label className="mt-3 block">
          <span className="text-sm font-medium text-slate-600">分类</span>
          <select className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.emoji} {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-3 block">
          <span className="text-sm font-medium text-slate-600">备注</span>
          <textarea className="mt-1 min-h-24 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="可选" />
        </label>

        <p className="mt-3 text-xs text-slate-500">清空结束时间会把这条记录设为进行中；保存时会自动保证同时只有一条进行中记录。</p>

        <button type="submit" className="mt-5 h-12 w-full rounded-lg bg-ink text-base font-semibold text-white disabled:opacity-40" disabled={!categoryId}>
          保存
        </button>
      </form>
    </div>
  );
}
