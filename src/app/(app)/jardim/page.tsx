"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  HeartPulse,
  Lock,
  Shield,
  Sprout,
  Trophy,
  Wind,
} from "lucide-react";
import { Card, ProgressBar } from "@/components/ui";
import { Art } from "@/components/Art";
import { artId } from "@/content/cardArt";
import { useAppStore } from "@/store/useAppStore";
import { gardenFor, LEVELS, REWARDS, SEEDS, rewardUnlocked } from "@/lib/garden";
import { MAX_SHIELDS } from "@/types/domain";
import { cn } from "@/lib/cn";

export default function Jardim() {
  const router = useRouter();
  const seeds = useAppStore((s) => s.data.seeds);
  const shields = useAppStore((s) => s.data.streak.shields ?? MAX_SHIELDS);
  const g = gardenFor(seeds);

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3 pt-5">
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-display text-[1.6rem] font-semibold tracking-tight text-ink">
          Seu jardim
        </h1>
      </header>

      {/* Planta / nível atual */}
      <Card elevation="lift" className="flex flex-col items-center py-8 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
        >
          <Art
            id={g.level.art}
            emoji={g.level.emoji}
            className="size-36 rounded-3xl text-7xl"
          />
        </motion.div>
        <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink">
          {g.level.name}
        </h2>
        <p className="mt-1 inline-flex items-center gap-1.5 text-rose-deep">
          <Sprout className="size-4" />
          <span className="font-semibold">{seeds} sementes</span>
        </p>

        <div className="mt-5 w-full max-w-xs">
          <ProgressBar value={g.progress} height={10} />
          <p className="mt-2 text-sm text-ink-soft">
            {g.nextLevel
              ? `Faltam ${g.toNext} sementes para ${g.nextLevel.name}`
              : "Você cultivou o jardim completo"}
          </p>
        </div>
      </Card>

      {/* Como ganhar sementes — cada linha com o ícone da própria ação,
          não emoji (regra travada do padrão de design). */}
      <Card elevation="soft">
        <h3 className="mb-3 font-semibold tracking-tight text-ink">
          Como ganhar sementes
        </h3>
        <ul className="space-y-1">
          {(
            [
              [BookOpen, "Concluir uma aula", SEEDS.lesson],
              [HeartPulse, "Fazer o check-in do dia", SEEDS.checkin],
              [CheckCircle2, "Concluir um dia", SEEDS.completeDay],
              [Wind, "Calmaria do dia", SEEDS.calmaria],
              [Trophy, "Bater um marco (Dia 7, 14, 21)", SEEDS.milestone],
            ] as const
          ).map(([Icon, label, valor]) => (
            <li key={label} className="flex items-center gap-3 py-1.5">
              <Icon className="size-[18px] shrink-0 text-ink-faint" />
              <span className="min-w-0 flex-1 text-[15px] text-ink-soft">
                {label}
              </span>
              <span className="inline-flex items-center gap-1 text-[15px] font-semibold text-rose-deep">
                +{valor}
                <Sprout className="size-4" />
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Escudos — sequência perdoável */}
      <Card elevation="soft">
        <div className="flex items-center gap-3.5">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-rose-tint">
            <Shield className="size-6 text-rose-deep" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold tracking-tight text-ink">Escudos</p>
              <span className="text-sm font-semibold text-rose-deep">
                {shields} de {MAX_SHIELDS}
              </span>
            </div>
            <p className="text-sm text-ink-soft">
              Faltou um dia? Um escudo guarda sua sequência. Você ganha mais a
              cada marco (Dia 7, 14, 21). Aqui um deslize não te faz recomeçar.
            </p>
          </div>
        </div>
      </Card>

      {/* Recompensas */}
      <section>
        <h3 className="mb-3 text-base font-semibold tracking-tight text-ink">
          Recompensas
        </h3>
        <div className="space-y-3">
          {REWARDS.map((r) => {
            const unlocked = rewardUnlocked(r, seeds);
            const level = LEVELS.find((l) => l.id === r.levelNeeded);
            const inner = (
              <Card
                elevation="soft"
                className={cn(
                  "flex items-center gap-3.5",
                  unlocked
                    ? "transition-transform active:scale-[0.99]"
                    : "opacity-70"
                )}
              >
                {unlocked ? (
                  <Art
                    id={artId(r.emoji) ?? ""}
                    emoji={r.emoji}
                    className="size-12 shrink-0 rounded-2xl bg-gold-tint text-2xl"
                  />
                ) : (
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-cream-deep">
                    <Lock className="size-5 text-ink-faint" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold tracking-tight text-ink">{r.title}</p>
                  <p className="text-sm text-ink-soft">{r.desc}</p>
                </div>
                {unlocked ? (
                  <ChevronRight className="size-5 shrink-0 text-ink-faint" />
                ) : (
                  <span className="text-xs font-medium text-ink-faint">
                    {level?.name} {level?.emoji}
                  </span>
                )}
              </Card>
            );
            return unlocked ? (
              <Link key={r.id} href={r.href} className="block">
                {inner}
              </Link>
            ) : (
              <div key={r.id}>{inner}</div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
