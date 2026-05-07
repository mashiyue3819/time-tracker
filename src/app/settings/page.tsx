"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CategorySheet } from "@/components/CategorySheet";
import { deleteCategory, getCategories, saveCategory } from "@/lib/db";
import type { Category } from "@/types/time";

export default function SettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setCategories(await getCategories());
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  async function handleSave(category: Category) {
    await saveCategory(category);
    setSheetOpen(false);
    setEditingCategory(null);
    await loadCategories();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("删除分类后，已有记录会显示为“未知/已删除分类”。确定删除吗？")) return;
    await deleteCategory(id);
    await loadCategories();
  }

  return (
    <AppShell activeTab="settings">
      <main className="safe-top pb-28">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">设置</h1>
            <p className="mt-1 text-sm text-slate-500">管理常用分类。</p>
          </div>
          <button
            className="h-10 rounded-lg bg-ink px-4 text-sm font-semibold text-white"
            onClick={() => {
              setEditingCategory(null);
              setSheetOpen(true);
            }}
          >
            新增
          </button>
        </header>

        {loading ? (
          <div className="rounded-lg bg-white p-5 text-center text-slate-500 shadow-sm">正在读取分类...</div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <article key={category.id} className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl" style={{ backgroundColor: `${category.color}18` }}>
                  {category.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">{category.name}</h2>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                    <span>{category.color}</span>
                  </div>
                </div>
                <button className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium" onClick={() => {
                  setEditingCategory(category);
                  setSheetOpen(true);
                }}>
                  编辑
                </button>
                <button className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600" onClick={() => handleDelete(category.id)}>
                  删除
                </button>
              </article>
            ))}
          </div>
        )}
      </main>

      <CategorySheet
        open={sheetOpen}
        category={editingCategory}
        onClose={() => {
          setSheetOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSave}
      />
    </AppShell>
  );
}
