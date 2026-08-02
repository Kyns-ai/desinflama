"use client";

/**
 * Mapa de Tolerância — a lista pessoal "tolera / modera / evita" que se constrói
 * a cada teste de reintrodução. É o payoff tangível do método 5R, o que nenhuma
 * dieta genérica entrega. Honesto: grupo sem teste = "ainda não testou".
 */
import { Card } from "@/components/ui";
import { Art } from "@/components/Art";
import { artId } from "@/content/cardArt";
import { useAppStore } from "@/store/useAppStore";
import {
  REINTRO_GROUPS,
  verdictFor,
  testedCount,
  VERDICT_LABEL,
  type Verdict,
} from "@/content/tolerance";
import { cn } from "@/lib/cn";

const VERDICT_STYLE: Record<Verdict, string> = {
  avontade: "bg-rose-tint text-rose-dark",
  moderar: "bg-gold-tint text-[#7c5d18]",
  evitar: "bg-coral-tint text-coral-dark",
  naotestado: "bg-cream-deep text-ink-faint",
};

export function ToleranceMapCard() {
  const tolerance = useAppStore((s) => s.data.tolerance);
  const n = testedCount(tolerance);

  return (
    <Card elevation="card">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
          Seu Mapa de Tolerância
        </h2>
        <span className="text-sm font-semibold text-rose-deep">{n}/5</span>
      </div>
      <p className="text-sm leading-relaxed text-ink-soft">
        {n === 0
          ? "Seu mapa começa em branco. A cada teste da reintrodução (dias 8–11), um grupo se acende aqui — a sua lista pessoal, que nenhuma dieta genérica te dá."
          : "Sua lista pessoal: o que o SEU corpo tolera, modera e evita."}
      </p>

      <ul className="mt-4 space-y-2">
        {REINTRO_GROUPS.map((g) => {
          const verdict = verdictFor(g.group, tolerance);
          return (
            <li
              key={g.group}
              className="flex items-center gap-3 rounded-2xl bg-surface px-3.5 py-2.5"
            >
              <Art
                id={artId(g.emoji) ?? ""}
                className="size-9 shrink-0 rounded-xl"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold tracking-tight text-ink">
                  {g.nome}
                </p>
                <p className="truncate text-xs text-ink-faint">{g.resumo}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                  VERDICT_STYLE[verdict]
                )}
              >
                {VERDICT_LABEL[verdict]}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-ink-faint">
        O mapa é vivo: você pode retestar qualquer grupo na Manutenção, com calma.
      </p>
    </Card>
  );
}
