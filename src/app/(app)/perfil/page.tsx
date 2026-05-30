"use client";

import Link from "next/link";
import {
  Crown,
  Map,
  Award,
  Bell,
  ShieldCheck,
  HelpCircle,
  ChevronRight,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { Card, IconCircle, Badge } from "@/components/ui";

// Semente da Fase 0 — a Fase 2 conecta ao usuário real; a Fase 10, ao plano.
const SEED = { nome: "Marina", email: "marina@email.com", plano: "Avaliação" };

interface Row {
  icon: LucideIcon;
  label: string;
  caption?: string;
  href: string;
  tone: "sage" | "coral" | "gold" | "sky" | "plum" | "neutral";
}

const GRUPOS: { titulo: string; rows: Row[] }[] = [
  {
    titulo: "Você",
    rows: [
      { icon: Map, label: "Meu Mapa de Inchaço", href: "/perfil", tone: "sage" },
      { icon: Award, label: "Conquistas e níveis", href: "/perfil", tone: "gold" },
    ],
  },
  {
    titulo: "Conta",
    rows: [
      { icon: Bell, label: "Notificações", href: "/perfil", tone: "coral" },
      {
        icon: Crown,
        label: "Meu plano",
        caption: "Gerencie ou cancele quando quiser",
        href: "/perfil",
        tone: "gold",
      },
      { icon: ShieldCheck, label: "Privacidade", href: "/perfil", tone: "sky" },
      { icon: HelpCircle, label: "Ajuda", href: "/perfil", tone: "neutral" },
    ],
  },
];

export default function Perfil() {
  return (
    <div className="space-y-6">
      <header className="pt-5">
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-ink">
          Perfil
        </h1>
      </header>

      <Card elevation="card" className="flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-sage text-xl font-semibold text-white">
          {SEED.nome[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold tracking-tight text-ink">
            {SEED.nome}
          </p>
          <p className="truncate text-sm text-ink-soft">{SEED.email}</p>
        </div>
        <Badge tone="gold">{SEED.plano}</Badge>
      </Card>

      {/* Ancoragem do anual (Fase 10 conecta ao paywall real) */}
      <Link href="/inicio" className="block">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sage-deep to-sage-dark p-5 text-white shadow-[var(--shadow-sage)] transition-transform active:scale-[0.99]">
          <div className="flex items-center gap-2">
            <Crown className="size-5" />
            <span className="font-semibold">Desinflama Anual</span>
          </div>
          <p className="mt-1.5 text-[15px] text-white/85">
            Manutenção é o que impede de voltar a inchar. Garanta seu plano
            anual e economize.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">
            Ver planos <ChevronRight className="size-4" />
          </span>
        </div>
      </Link>

      {GRUPOS.map((g) => (
        <section key={g.titulo}>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {g.titulo}
          </h2>
          <Card elevation="soft" className="divide-y divide-line p-0">
            {g.rows.map((r) => (
              <Link
                key={r.label}
                href={r.href}
                className="flex items-center gap-3.5 p-4 transition-colors active:bg-cream-deep/50"
              >
                <IconCircle icon={r.icon} tone={r.tone} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium tracking-tight text-ink">
                    {r.label}
                  </p>
                  {r.caption && (
                    <p className="text-sm text-ink-soft">{r.caption}</p>
                  )}
                </div>
                <ChevronRight className="size-5 shrink-0 text-ink-faint" />
              </Link>
            ))}
          </Card>
        </section>
      ))}

      <Link
        href="/"
        className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-ink-faint"
      >
        <LogOut className="size-4" /> Sair
      </Link>
    </div>
  );
}
