"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Flame, Lock } from "lucide-react";
import { Card } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { ACHIEVEMENTS, reconcileAchievements } from "@/lib/achievements";
import { todayKey } from "@/lib/date";
import { cn } from "@/lib/cn";
import { Art } from "@/components/Art";
import { artId } from "@/content/cardArt";

export default function Conquistas() {
  const router = useRouter();
  const data = useAppStore((s) => s.data);

  // estado ao vivo (caso ainda não reconciliado por uma ação)
  const { list } = reconcileAchievements(data, todayKey());
  const byId = new Map(list.map((a) => [a.id, a]));
  const unlockedCount = list.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3 pt-5">
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-display text-[1.6rem] font-semibold tracking-tight text-ink">
          Conquistas
        </h1>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Card elevation="soft" className="text-center">
          <p className="font-display text-3xl font-semibold text-rose-deep">
            {unlockedCount}/{ACHIEVEMENTS.length}
          </p>
          <p className="text-sm text-ink-soft">desbloqueadas</p>
        </Card>
        <Card elevation="soft" className="text-center">
          <p className="flex items-center justify-center gap-1 font-display text-3xl font-semibold text-coral-dark">
            <Flame className="size-6" /> {data.streak.longest}
          </p>
          <p className="text-sm text-ink-soft">recorde de ofensiva</p>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((def) => {
          const unlocked = byId.get(def.id)?.unlocked ?? false;
          return (
            <div
              key={def.id}
              className={cn(
                "flex flex-col items-center rounded-2xl border p-3 text-center transition-all",
                unlocked
                  ? "border-gold/30 bg-gold-tint/40"
                  : "border-line bg-cream-deep/30"
              )}
            >
              <span
                className={cn(
                  "grid size-12 place-items-center rounded-full text-2xl",
                  unlocked ? "bg-white shadow-[var(--shadow-soft)]" : "bg-cream-deep"
                )}
              >
                {unlocked ? (
                  <Art
                    id={artId(def.emoji) ?? ""}
                    emoji={def.emoji}
                    className="size-9 rounded-full text-2xl"
                  />
                ) : (
                  <Lock className="size-5 text-ink-faint" />
                )}
              </span>
              <p
                className={cn(
                  "mt-2 text-xs font-semibold leading-tight",
                  unlocked ? "text-ink" : "text-ink-faint"
                )}
              >
                {def.title}
              </p>
              <p className="mt-0.5 text-[10px] leading-tight text-ink-faint">
                {def.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
