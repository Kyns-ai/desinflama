"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BookOpen,
  CreditCard,
  Flower2,
  LayoutDashboard,
  ListChecks,
  Map,
  Microscope,
  Quote,
  Route,
  ShoppingCart,
  Sparkles,
  Sprout,
  TrafficCone,
  Trophy,
  UtensilsCrossed,
  Users,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { Marca } from "@/components/Marca";
import { cn } from "@/lib/cn";

interface Item {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * A navegação espelha o app inteiro, em três blocos.
 *
 * NEGÓCIO é dado de gente (muda sozinho). PRODUTO é o que a cliente lê.
 * MECÂNICAS são as regras do jogo — as que ninguém vê e todo mundo sente.
 * A separação existe porque são três perguntas diferentes: "como estamos
 * indo", "o que ela está lendo hoje" e "por que o número dela é esse".
 */
export const GRUPOS: { titulo: string; itens: Item[] }[] = [
  {
    titulo: "Negócio",
    itens: [
      { href: "/", label: "Visão geral", icon: LayoutDashboard },
      { href: "/usuarias", label: "Usuárias", icon: Users },
      { href: "/leads", label: "Leads", icon: Sparkles },
      { href: "/assinaturas", label: "Assinaturas", icon: CreditCard },
    ],
  },
  {
    titulo: "Produto",
    itens: [
      { href: "/conteudo/jornada", label: "Jornada (21 dias)", icon: Route },
      { href: "/conteudo/receitas", label: "Receitas", icon: UtensilsCrossed },
      { href: "/conteudo/cardapio", label: "Cardápio e compras", icon: ShoppingCart },
      { href: "/conteudo/semaforo", label: "Semáforo e gatilhos", icon: TrafficCone },
      { href: "/conteudo/biblioteca", label: "Biblioteca", icon: BookOpen },
      { href: "/conteudo/calmaria", label: "Calmaria", icon: Wind },
      { href: "/conteudo/desafios", label: "Desafios mensais", icon: Trophy },
      { href: "/conteudo/ciencia", label: "Ciência e fontes", icon: Microscope },
    ],
  },
  {
    titulo: "Mecânicas",
    itens: [
      { href: "/mecanicas/broto", label: "O Broto", icon: Flower2 },
      { href: "/mecanicas/sementes", label: "Sementes", icon: Sprout },
      { href: "/mecanicas/prazeres", label: "Prazeres", icon: Award },
      { href: "/mecanicas/nota", label: "Nota do prato", icon: ListChecks },
      { href: "/mecanicas/frases", label: "Frases do dia", icon: Quote },
      { href: "/mecanicas/conquistas", label: "Conquistas", icon: Trophy },
      { href: "/mecanicas/tolerancia", label: "Mapa de Tolerância", icon: Map },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const ativo = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto border-r border-line bg-surface px-3 py-5 lg:flex">
      <div className="flex items-center gap-2.5 px-3 pb-6">
        <Marca size={36} className="rounded-xl" />
        <div className="leading-tight">
          <p className="font-display text-lg font-semibold text-ink">Desinflama</p>
          <p className="eyebrow">Admin</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-5">
        {GRUPOS.map((g) => (
          <div key={g.titulo}>
            <p className="eyebrow px-3 pb-1.5">{g.titulo}</p>
            <div className="flex flex-col gap-0.5">
              {g.itens.map((item) => {
                const Icon = item.icon;
                const on = ativo(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      on
                        ? "bg-rose-tint text-rose-dark"
                        : "text-ink-soft hover:bg-canvas"
                    )}
                  >
                    <Icon
                      className="size-[18px] shrink-0"
                      strokeWidth={on ? 2.4 : 2}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <p className="px-3 pt-5 text-[11px] text-ink-faint">v2 · painel interno</p>
    </aside>
  );
}
