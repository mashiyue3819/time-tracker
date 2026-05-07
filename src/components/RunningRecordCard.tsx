"use client";

import { useEffect, useMemo, useState } from "react";
import { displayDateTime, formatMinutes, getRecordStart, runningDurationMinutes } from "@/lib/time";
import type { Category, TimeRecord } from "@/types/time";

export function RunningRecordCard({
  record,
  categories,
  onFinish,
  onEdit,
}: {
  record: TimeRecord;
  categories: Category[];
  onFinish: () => void;
  onEdit: () => void;
}) {
  const [now, setNow] = useState(() => new Date());
  const category = useMemo(() => categories.find((item) => item.id === record.categoryId), [categories, record.categoryId]);
  const minutes = runningDurationMinutes(record, now);
  const startedAt = getRecordStart(record);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="mb-4 rounded-xl bg-ink p-4 text-white shadow-soft">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/12 text-2xl">
          {category?.emoji ?? "？"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-white/65">当前进行中</p>
              <h2 className="truncate text-lg font-semibold">{category?.name ?? "未知/已删除分类"}</h2>
            </div>
            <span className="shrink-0 rounded-full bg-white/12 px-3 py-1 text-sm">{formatMinutes(minutes)}</span>
          </div>
          <p className="mt-2 text-sm text-white/75">开始于 {startedAt ? displayDateTime(startedAt) : record.startTime}</p>
          {record.note ? <p className="mt-2 whitespace-pre-wrap text-sm text-white/90">{record.note}</p> : null}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" className="h-11 rounded-lg bg-white/12 text-sm font-semibold" onClick={onEdit}>
          编辑
        </button>
        <button type="button" className="h-11 rounded-lg bg-white text-sm font-semibold text-ink" onClick={onFinish}>
          结束
        </button>
      </div>
    </section>
  );
}
