"use client";

/**
 * Janela de inchaço hormonal — o mesmo card no Mapa do onboarding e em /mapa.
 * Um lugar só: a copy "é hormônio, não recaída" não pode divergir entre as
 * duas telas que mostram a mesma previsão.
 */
import { Moon } from "lucide-react";
import { nextBloatWindow } from "@/lib/cycle";
import { humanDayMonth } from "@/lib/date";

export function BloatWindowCard({ cycleStart }: { cycleStart: string | null }) {
  if (!cycleStart) return null;
  const win = nextBloatWindow(cycleStart);

  return (
    <div className="rounded-2xl border border-plum/25 bg-plum-tint/50 p-5">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-plum">
        <Moon className="size-3.5" />
        {win.active
          ? "Você está na janela de inchaço hormonal"
          : "Sua próxima janela de inchaço hormonal"}
      </p>
      <p className="mt-2 font-display text-xl font-semibold text-ink">
        ~{humanDayMonth(win.start)} – {humanDayMonth(win.end)}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
        {win.active
          ? "Se a barriga estufar nestes dias, é hormônio fazendo o trabalho dele — não recaída. Continue normalmente."
          : "Se o inchaço aumentar nesses dias, é hormonal e passa — não é recaída."}
      </p>
    </div>
  );
}
