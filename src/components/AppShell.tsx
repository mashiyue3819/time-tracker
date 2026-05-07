import Link from "next/link";
import type { ReactNode } from "react";

type Tab = "today" | "stats" | "settings";

const tabs: Array<{ id: Tab; href: string; label: string; icon: string }> = [
  { id: "today", href: "/", label: "今日", icon: "◷" },
  { id: "stats", href: "/stats", label: "统计", icon: "▰" },
  { id: "settings", href: "/settings", label: "设置", icon: "⚙" },
];

export function AppShell({ activeTab, children }: { activeTab: Tab; children: ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-md bg-paper px-4">
      {children}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-5 pt-2 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex min-h-12 flex-col items-center justify-center rounded-lg text-xs font-medium ${
                  active ? "bg-slate-100 text-ink" : "text-slate-500"
                }`}
              >
                <span className="text-lg leading-5">{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
