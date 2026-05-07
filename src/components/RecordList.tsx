import { displaySegmentTime, formatMinutes } from "@/lib/time";
import type { Category, TimeRecord, TimeRecordSegment } from "@/types/time";

export function RecordList({
  segments,
  categories,
  onEdit,
  onDelete,
}: {
  segments: TimeRecordSegment[];
  categories: Category[];
  onEdit: (record: TimeRecord) => void;
  onDelete: (id: string) => void;
}) {
  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  if (segments.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 text-center shadow-sm">
        <p className="text-base font-medium text-slate-700">这一天还没有记录</p>
        <p className="mt-1 text-sm text-slate-500">可以点“开始”实时记录，也可以点右下角加号手动补录。</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {segments.map((segment) => {
        const record = segment.record;
        const category = categoryMap.get(record.categoryId);
        return (
          <article key={`${record.id}-${segment.logicalDay}-${segment.segmentStart.toISOString()}`} className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl"
                style={{ backgroundColor: `${category?.color ?? "#71717a"}18` }}
              >
                {category?.emoji ?? "？"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="truncate text-base font-semibold">{category?.name ?? "未知分类/已删除分类"}</h2>
                  <span className="shrink-0 text-sm text-slate-500">{formatMinutes(segment.minutes)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{displaySegmentTime(segment.segmentStart, segment.segmentEnd)}</p>
                {record.note ? <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{record.note}</p> : null}
                {segment.isRunning ? <p className="mt-2 text-xs text-sky-600">这条记录仍在进行中，当前只显示本逻辑日内的片段。</p> : null}
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium" onClick={() => onEdit(record)}>
                编辑
              </button>
              <button className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600" onClick={() => onDelete(record.id)}>
                删除
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
