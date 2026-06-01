"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Check, Sprout, Shield } from "lucide-react";
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
        <p className="mt-1 inline-flex items-center gap-1.5 text-sage-deep">
          <Sprout className="size-4" />
          <span className="font-semibold">{seeds} sementes</span>
        </p>

        <div className="mt-5 w-full max-w-xs">
          <ProgressBar value={g.progress} height={10} />
          <p className="mt-2 text-sm text-ink-soft">
            {g.nextLevel
              ? `Faltam ${g.toNext} sementes para ${g.nextLevel.name} ${g.nextLevel.emoji}`
              : "Você cultivou o jardim completo 🎉"}
          </p>
        </div>
      </Card>

      {/* Como ganhar sementes */}
      <Card elevation="soft">
        <h3 className="mb-3 font-semibold tracking-tight text-ink">
          Como ganhar sementes
        </h3>
        <ul className="space-y-2 text-[15px] text-ink-soft">
          <li className="flex justify-between">
            <span>📖 Concluir uma aula</span>
            <span className="font-semibold text-sage-deep">+{SEEDS.lesson} 🌱</span>
          </li>
          <li className="flex justify-between">
            <span>💚 Fazer o check-in do dia</span>
            <span className="font-semibold text-sage-deep">+{SEEDS.checkin} 🌱</span>
          </li>
          <li className="flex justify-between">
            <span>✅ Concluir um dia</span>
            <span className="font-semibold text-sage-deep">+{SEEDS.completeDay} 🌱</span>
          </li>
          <li className="flex justify-between">
            <span>🏆 Bater um marco (Dia 7, 14, 21)</span>
            <span className="font-semibold text-sage-deep">+{SEEDS.milestone} 🌱</span>
          </li>
        </ul>
      </Card>

      {/* Escudos — sequência perdoável */}
      <Card elevation="soft">
        <div className="flex items-center gap-3.5">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sage-tint">
            <Shield className="size-6 text-sage-deep" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold tracking-tight text-ink">Escudos</p>
              <span className="text-sm font-semibold text-sage-deep">
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
            return (
              <Card
                key={r.id}
                elevation="soft"
                className={cn(
                  "flex items-center gap-3.5",
                  !unlocked && "opacity-70"
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
                  <span className="inline-flex items-center gap-1 rounded-full bg-sage-tint px-2.5 py-1 text-xs font-semibold text-sage-dark">
                    <Check className="size-3.5" strokeWidth={3} /> Liberado
                  </span>
                ) : (
                  <span className="text-xs font-medium text-ink-faint">
                    {level?.name} {level?.emoji}
                  </span>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
