"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  BookOpen,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/usuarias", label: "Usuárias", icon: Users },
  { href: "/leads", label: "Leads", icon: Sparkles },
  { href: "/conteudo", label: "Conteúdo", icon: BookOpen },
  { href: "/assinaturas", label: "Assinaturas", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface px-3 py-5 lg:flex">
      <div className="flex items-center gap-2.5 px-3 pb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand.svg" alt="" className="size-9 rounded-xl" />
        <div className="leading-tight">
          <p className="font-display text-lg font-semibold text-ink">Desinflama</p>
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
            Admin
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const on = active(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                on
                  ? "bg-sage-tint text-sage-dark"
                  : "text-ink-soft hover:bg-canvas"
              )}
            >
              <Icon className="size-[18px]" strokeWidth={on ? 2.4 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pt-4 text-[11px] text-ink-faint">v1.0 · painel interno</div>
    </aside>
  );
}
