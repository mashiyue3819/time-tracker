"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DonutChart } from "@/components/DonutChart";
import { aggregateByCategory } from "@/lib/stats";
import { formatMinutes, getDateRange } from "@/lib/time";
import { getAllRecords, getCategories } from "@/lib/db";
import type { Category, TimeRecord } from "@/types/time";

export default function StatsPage() {
  const [range, setRange] = useState<7 | 30>(7);
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const [nextCategories, nextRecords] = await Promise.all([getCategories(), getAllRecords()]);
      setCategories(nextCategories);
      setRecords(nextRecords);
      setNow(new Date());
      setLoading(false);
    }
    void loadStats();
  }, [range]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const dayKeys = useMemo(() => getDateRange(range, now), [now, range]);
  const stats = useMemo(() => aggregateByCategory(records, categories, dayKeys, now), [categories, dayKeys, now, records]);
  const totalMinutes = stats.reduce((sum, item) => sum + item.minutes, 0);

  return (
    <AppShell activeTab="stats">
      <main className="safe-top pb-28">
        <header className="mb-5">
          <h1 className="text-2xl font-semibold">统计</h1>
          <p className="mt-1 text-sm text-slate-500">按 04:00 切换的逻辑日汇总最近的时间投入。</p>
        </header>

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-200 p-1">
          {[7, 30].map((days) => (
            <button
              key={days}
              type="button"
              className={`h-10 rounded-md text-sm font-semibold ${range === days ? "bg-white text-ink shadow-sm" : "text-slate-600"}`}
              onClick={() => setRange(days as 7 | 30)}
            >
              近 {days} 天
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-lg bg-white p-5 text-center text-slate-500 shadow-sm">正在统计...</div>
        ) : stats.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-center shadow-sm">
            <p className="font-medium text-slate-700">还没有可统计的数据</p>
            <p className="mt-1 text-sm text-slate-500">记录几段时间后这里会显示分类比例。</p>
          </div>
        ) : (
          <>
            <DonutChart stats={stats} totalMinutes={totalMinutes} />

            <div className="space-y-3">
              {stats.map((item) => {
                const percent = totalMinutes > 0 ? (item.minutes / totalMinutes) * 100 : 0;
                return (
                  <article key={item.categoryId} className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex items-center gap-2">
                        <span className="text-lg">{item.emoji}</span>
                        <span className="truncate font-semibold">{item.label}</span>
                      </div>
                      <span className="shrink-0 text-sm text-slate-500">{percent.toFixed(1)}%</span>
                    </div>
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
                      <span>{formatMinutes(item.minutes)}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${Math.max(3, percent)}%`, backgroundColor: item.color }} />
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </main>
    </AppShell>
  );
}
