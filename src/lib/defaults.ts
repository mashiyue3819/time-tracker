import type { Category } from "@/types/time";

export const defaultCategories: Category[] = [
  { id: "work", name: "工作", emoji: "💻", color: "#2563eb" },
  { id: "study", name: "学习", emoji: "📖", color: "#7c3aed" },
  { id: "exercise", name: "运动", emoji: "🏃", color: "#16a34a" },
  { id: "rest", name: "休息", emoji: "😴", color: "#64748b" },
  { id: "meal", name: "吃饭", emoji: "🍚", color: "#ea580c" },
  { id: "social", name: "社交", emoji: "👥", color: "#db2777" },
  { id: "traffic", name: "交通", emoji: "🚗", color: "#0891b2" },
  { id: "other", name: "其他", emoji: "📌", color: "#52525b" },
];
