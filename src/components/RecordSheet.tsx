"use client";

import { useEffect, useState } from "react";
import { createId, nowTime } from "@/lib/time";
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
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    if (record) {
      setStartTime(record.startTime);
      setEndTime(record.endTime ?? "");
      setCategoryId(record.categoryId);
      setNote(record.note);
      return;
    }

    const current = nowTime();
    setStartTime(current);
    setEndTime(current);
    setCategoryId(categories[0]?.id ?? "");
    setNote("");
  }, [categories, open, record]);

  if (!open) return null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextEndTime = endTime || null;
    onSave({
      id: record?.id ?? createId("record"),
      date: record?.date ?? date,
      startTime,
      endTime: nextEndTime,
      categoryId,
      note: note.trim(),
      isRunning: nextEndTime ? false : Boolean(record?.isRunning),
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

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-600">开始</span>
            <input className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-600">结束</span>
            <input className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3" type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
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

        {record?.isRunning ? (
          <p className="mt-3 text-xs text-slate-500">如果填写结束时间，这条记录会自动从进行中变为已完成。</p>
        ) : null}

        <button type="submit" className="mt-5 h-12 w-full rounded-lg bg-ink text-base font-semibold text-white disabled:opacity-40" disabled={!categoryId}>
          保存
        </button>
      </form>
    </div>
  );
}
