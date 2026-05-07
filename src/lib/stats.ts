import { splitRecordByLogicalDays } from "@/lib/time";
import type { Category, TimeRecord } from "@/types/time";

export type CategoryStat = {
  categoryId: string;
  label: string;
  emoji: string;
  color: string;
  minutes: number;
};

export function aggregateByCategory(
  records: TimeRecord[],
  categories: Category[],
  dayKeys: string[],
  now = new Date(),
) {
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const minutesByCategory = new Map<string, number>();

  for (const record of records) {
    const segments = splitRecordByLogicalDays(record, dayKeys, undefined, now);
    for (const segment of segments) {
      minutesByCategory.set(record.categoryId, (minutesByCategory.get(record.categoryId) ?? 0) + segment.minutes);
    }
  }

  return Array.from(minutesByCategory.entries())
    .map(([categoryId, minutes]) => {
      const category = categoryMap.get(categoryId);
      return {
        categoryId,
        label: category?.name ?? "未知分类/已删除分类",
        emoji: category?.emoji ?? "？",
        color: category?.color ?? "#71717a",
        minutes,
      };
    })
    .filter((stat) => stat.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);
}
