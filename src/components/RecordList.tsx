import { formatMinutes, recordDuration } from "@/lib/time";
import type { Category, TimeRecord } from "@/types/time";

export function RecordList({
  records,
  categories,
  onEdit,
  onDelete,
}: {
  records: TimeRecord[];
  categories: Category[];
  onEdit: (record: TimeRecord) => void;
  onDelete: (id: string) => void;
}) {
  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  if (records.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 text-center shadow-sm">
        <p className="text-base font-medium text-slate-700">这一天还没有记录</p>
        <p className="mt-1 text-sm text-slate-500">可以点“开始”实时记录，也可以点右下角加号手动补录。</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => {
        const category = categoryMap.get(record.categoryId);
        const minutes = recordDuration(record);
        return (
          <article key={record.id} className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl"
                style={{ backgroundColor: `${category?.color ?? "#71717a"}18` }}
              >
                {category?.emoji ?? "？"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="truncate text-base font-semibold">{category?.name ?? "未知/已删除分类"}</h2>
                  <span className="shrink-0 text-sm text-slate-500">
                    {record.endTime ? formatMinutes(minutes) : "进行中"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {record.startTime} - {record.endTime ?? "未结束"}
                </p>
                {record.note ? <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{record.note}</p> : null}
                {record.endTime && minutes === 0 ? (
                  <p className="mt-2 text-xs text-amber-600">结束时间早于或等于开始时间，已按 0 分钟处理。</p>
                ) : null}
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
