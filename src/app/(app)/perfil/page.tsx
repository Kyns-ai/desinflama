"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  Crown,
  Map,
  Award,
  Bell,
  ShieldCheck,
  HelpCircle,
  ChevronRight,
  LogOut,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { Card, IconCircle, Badge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";

interface Row {
  icon: LucideIcon;
  label: string;
  caption?: string;
  href: string;
  tone: "sage" | "coral" | "gold" | "sky" | "plum" | "neutral";
  kind?: "link" | "toggle";
}

const GRUPOS: { titulo: string; rows: Row[] }[] = [
  {
    titulo: "Você",
    rows: [
      { icon: Map, label: "Meu Mapa de Inchaço", href: "/perfil", tone: "sage" },
      { icon: BookOpen, label: "Biblioteca da nutri", href: "/aprender", tone: "plum" },
      { icon: Award, label: "Conquistas e níveis", href: "/conquistas", tone: "gold" },
    ],
  },
  {
    titulo: "Conta",
    rows: [
      { icon: Bell, label: "Notificações", href: "/perfil", tone: "coral", kind: "toggle" },
      {
        icon: Crown,
        label: "Meu plano",
        caption: "Gerencie ou cancele quando quiser",
        href: "/plano",
        tone: "gold",
      },
      { icon: ShieldCheck, label: "Privacidade", href: "/plano", tone: "sky" },
      { icon: HelpCircle, label: "Ajuda", href: "/plano", tone: "neutral" },
    ],
  },
];

export default function Perfil() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const subscription = useAppStore((s) => s.data.subscription);
  const signOut = useAppStore((s) => s.signOut);

  const nome = user?.name ?? "você";
  const planoLabel = subscription.isPremium
    ? subscription.plan === "annual"
      ? "Anual"
      : subscription.plan === "monthly"
        ? "Mensal"
        : "Premium"
    : "Avaliação";

  async function handleSignOut() {
    await signOut();
    router.replace("/");
  }

  return (
    <div className="space-y-6">
      <header className="pt-5">
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-ink">
          Perfil
        </h1>
      </header>

      <Card elevation="card" className="flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-sage text-xl font-semibold text-white">
          {nome.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold tracking-tight text-ink">
            {nome}
          </p>
          <p className="truncate text-sm text-ink-soft">{user?.email}</p>
        </div>
        <Badge tone="gold">{planoLabel}</Badge>
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
            {g.rows.map((r) =>
              r.kind === "toggle" ? (
                <NotifToggle key={r.label} row={r} />
              ) : (
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
              )
            )}
          </Card>
        </section>
      ))}

      <button
        onClick={handleSignOut}
        className="flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-ink-faint transition-colors active:text-ink-soft"
      >
        <LogOut className="size-4" /> Sair
      </button>
    </div>
  );
}

function NotifToggle({ row }: { row: Row }) {
  const enabled = useAppStore((s) => s.data.flags.notifications ?? false);
  const enable = useAppStore((s) => s.enableNotifications);
  const disable = useAppStore((s) => s.disableNotifications);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    if (enabled) await disable();
    else await enable();
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-3.5 p-4">
      <IconCircle icon={row.icon} tone={row.tone} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="font-medium tracking-tight text-ink">{row.label}</p>
        <p className="text-sm text-ink-soft">
          Lembretes do seu dia e da ofensiva
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={busy}
        role="switch"
        aria-checked={enabled}
        aria-label="Ativar notificações"
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          enabled ? "bg-sage" : "bg-cream-deep"
        )}
      >
        <span
          className={cn(
            "absolute top-1 size-5 rounded-full bg-white shadow transition-all",
            enabled ? "left-6" : "left-1"
          )}
        />
      </button>
    </div>
  );
}
