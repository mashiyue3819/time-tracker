"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/types/time";

export function QuickStartSheet({
  open,
  categories,
  onClose,
  onStart,
}: {
  open: boolean;
  categories: Category[];
  onClose: () => void;
  onStart: (categoryId: string, note: string) => void;
}) {
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setCategoryId(categories[0]?.id ?? "");
    setNote("");
  }, [categories, open]);

  if (!open) return null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onStart(categoryId, note.trim());
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-slate-900/30" role="dialog" aria-modal="true">
      <button className="absolute inset-0 h-full w-full" onClick={onClose} aria-label="关闭" />
      <form className="safe-bottom relative w-full rounded-t-2xl bg-white px-5 pb-5 pt-4 shadow-soft" onSubmit={submit}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">开始记录</h2>
          <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-sm" onClick={onClose}>
            取消
          </button>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-600">当前活动</span>
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

        <p className="mt-3 text-xs text-slate-500">确认后会使用你点击当下的本地时间作为开始时间。</p>

        <button type="submit" className="mt-5 h-12 w-full rounded-lg bg-ink text-base font-semibold text-white disabled:opacity-40" disabled={!categoryId}>
          确认开始
        </button>
      </form>
    </div>
  );
}
