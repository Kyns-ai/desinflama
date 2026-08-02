"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { TABS } from "@/lib/nav";
import { cn } from "@/lib/cn";

/** Telas imersivas (respiração, leitor de aula) têm navegação própria (voltar/
 *  fechar) e ocupam a tela inteira — a tab bar fixa atrapalharia e seu botão
 *  central "+" sobrepunha o CTA principal. Some nelas. */
const IMMERSIVE = [
  /^\/calmaria(\/|$)/,
  /^\/jornada\/[^/]+\/aula(\/|$)/,
];

export function TabBar() {
  const pathname = usePathname();
  if (IMMERSIVE.some((re) => re.test(pathname))) return null;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-cream/85 backdrop-blur-xl pb-safe"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch justify-between px-2">
        <div className="flex flex-1 justify-around">
          {left.map((t) => (
            <TabLink key={t.href} item={t} active={isActive(t.href)} />
          ))}
        </div>

        {/* Botão central — Registrar. Sobe acima da barra: com ele deitado
            dentro dos 64px, o círculo cobria a própria palavra "Registrar"
            (medido: rótulo em 822–838, círculo em 784–840). */}
        <div className="relative w-20 shrink-0">
          <Link
            href="/registrar"
            aria-label="Registrar como você está"
            className={cn(
              "absolute left-1/2 -top-3 -translate-x-1/2 grid size-12 place-items-center rounded-full",
              "bg-coral text-white shadow-[var(--shadow-coral)] transition-transform active:scale-95",
              isActive("/registrar") && "ring-4 ring-coral-tint"
            )}
          >
            <Plus className="size-6" strokeWidth={2.5} />
          </Link>
          <span className="absolute inset-x-0 bottom-2 text-center text-[11px] font-medium text-ink-faint">
            Registrar
          </span>
        </div>

        <div className="flex flex-1 justify-around">
          {right.map((t) => (
            <TabLink key={t.href} item={t} active={isActive(t.href)} />
          ))}
        </div>
      </div>
    </nav>
  );
}

function TabLink({
  item,
  active,
}: {
  item: (typeof TABS)[number];
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex w-16 flex-col items-center justify-center gap-1 pt-1 transition-colors",
        active ? "text-rose-deep" : "text-ink-faint"
      )}
    >
      <Icon className="size-6" strokeWidth={active ? 2.4 : 2} />
      <span className="text-[11px] font-medium">{item.label}</span>
    </Link>
  );
}
