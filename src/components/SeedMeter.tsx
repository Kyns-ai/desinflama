"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, ProgressBar } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { gardenFor } from "@/lib/garden";

/** Medidor de nível do jardim (sementes → planta). Compacto, p/ a home. */
export function SeedMeter() {
  const seeds = useAppStore((s) => s.data.seeds);
  const g = gardenFor(seeds);

  return (
    <Link href="/jardim" className="block">
      <Card elevation="soft" className="transition-transform active:scale-[0.99]">
        <div className="flex items-center gap-3.5">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sage-tint text-2xl">
            {g.level.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold tracking-tight text-ink">
                {g.level.name}
              </p>
              <span className="text-sm font-semibold text-sage-deep">
                {seeds} 🌱
              </span>
            </div>
            <p className="text-sm text-ink-soft">
              {g.nextLevel
                ? `Faltam ${g.toNext} para ${g.nextLevel.name} ${g.nextLevel.emoji}`
                : "Jardim completo 🎉"}
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-ink-faint" />
        </div>
        <div className="mt-3">
          <ProgressBar value={g.progress} height={7} />
        </div>
      </Card>
    </Link>
  );
}
