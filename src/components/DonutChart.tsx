import { formatMinutes } from "@/lib/time";
import type { CategoryStat } from "@/lib/stats";

export function DonutChart({ stats, totalMinutes }: { stats: CategoryStat[]; totalMinutes: number }) {
  const size = 210;
  const radius = 76;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <section className="mb-4 rounded-lg bg-white p-5 shadow-sm">
      <div className="relative mx-auto h-[210px] w-[210px]">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="分类时间占比圆环图">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
          {stats.map((item) => {
            const length = totalMinutes > 0 ? (item.minutes / totalMinutes) * circumference : 0;
            const dashOffset = -offset;
            offset += length;
            return (
              <circle
                key={item.categoryId}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-slate-500">总时长</p>
          <p className="mt-1 max-w-32 text-xl font-semibold leading-tight text-ink">{formatMinutes(totalMinutes)}</p>
        </div>
      </div>
    </section>
  );
}
