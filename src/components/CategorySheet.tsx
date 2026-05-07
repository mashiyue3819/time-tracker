"use client";

import { useEffect, useState } from "react";
import { createId } from "@/lib/time";
import type { Category } from "@/types/time";

const colorOptions = ["#2563eb", "#7c3aed", "#16a34a", "#ea580c", "#db2777", "#0891b2", "#64748b", "#52525b"];

export function CategorySheet({
  open,
  category,
  onClose,
  onSave,
}: {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (category: Category) => void;
}) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📌");
  const [color, setColor] = useState(colorOptions[0]);

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setEmoji(category?.emoji ?? "📌");
    setColor(category?.color ?? colorOptions[0]);
  }, [category, open]);

  if (!open) return null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({
      id: category?.id ?? createId("category"),
      name: name.trim(),
      emoji: emoji.trim() || "📌",
      color,
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-slate-900/30" role="dialog" aria-modal="true">
      <button className="absolute inset-0 h-full w-full" onClick={onClose} aria-label="关闭" />
      <form className="safe-bottom relative w-full rounded-t-2xl bg-white px-5 pb-5 pt-4 shadow-soft" onSubmit={submit}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{category ? "编辑分类" : "新增分类"}</h2>
          <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-sm" onClick={onClose}>
            取消
          </button>
        </div>

        <div className="grid grid-cols-[5.5rem_1fr] gap-3">
          <label>
            <span className="text-sm font-medium text-slate-600">Emoji</span>
            <input className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-center text-xl" value={emoji} onChange={(event) => setEmoji(event.target.value)} maxLength={4} required />
          </label>
          <label>
            <span className="text-sm font-medium text-slate-600">名称</span>
            <input className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3" value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：家务" required />
          </label>
        </div>

        <div className="mt-4">
          <span className="text-sm font-medium text-slate-600">颜色</span>
          <div className="mt-2 grid grid-cols-8 gap-2">
            {colorOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`h-9 rounded-full border-2 ${color === option ? "border-ink" : "border-transparent"}`}
                style={{ backgroundColor: option }}
                onClick={() => setColor(option)}
                aria-label={`选择颜色 ${option}`}
              />
            ))}
          </div>
        </div>

        <button type="submit" className="mt-5 h-12 w-full rounded-lg bg-ink text-base font-semibold text-white" disabled={!name.trim()}>
          保存
        </button>
      </form>
    </div>
  );
}
