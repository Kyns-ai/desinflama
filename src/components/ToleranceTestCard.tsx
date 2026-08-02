"use client";

/**
 * Card "Teste de hoje" da reintrodução (dias 8–11). É AQUI que o Mapa de
 * Tolerância é construído — em vez de a usuária só anotar a refeição em texto,
 * ela registra estruturado: grupo testado + nível de reação. Cada teste acende
 * um grupo no mapa pessoal.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, FlaskConical } from "lucide-react";
import { Card } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { todayKey } from "@/lib/date";
import { haptic } from "@/lib/haptics";
import {
  DAY_TO_GROUPS,
  REACTIONS,
  groupDef,
} from "@/content/tolerance";
import type { ReintroGroup, ReactionLevel } from "@/types/domain";
import { cn } from "@/lib/cn";

export function ToleranceTestCard({ day }: { day: number }) {
  const groups = DAY_TO_GROUPS[day];
  const tolerance = useAppStore((s) => s.data.tolerance);
  const addToleranceResult = useAppStore((s) => s.addToleranceResult);

  const today = todayKey();
  // dia 11 oferece escolha (GOS ou polióis); demais têm grupo único
  const [chosen, setChosen] = useState<ReintroGroup>(groups?.[0] ?? "lactose");
  const [busy, setBusy] = useState(false);

  if (!groups) return null;

  const existing = tolerance.find(
    (t) => t.group === chosen && t.dateTested === today
  );

  async function registrar(reaction: ReactionLevel) {
    setBusy(true);
    void haptic("success");
    await addToleranceResult({
      group: chosen,
      dateTested: today,
      reaction,
      day,
    });
    setBusy(false);
  }

  const def = groupDef(chosen);

  return (
    <Card elevation="card" className="border border-plum/25 bg-plum-tint/20">
      <div className="flex items-center gap-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-plum-tint text-plum">
          <FlaskConical className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-plum">
            Teste de hoje
          </p>
          <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
            {def.emoji} {def.nome}
          </h2>
        </div>
      </div>

      {/* dia 11: escolher qual grupo testar */}
      {groups.length > 1 && (
        <div className="mt-3 flex gap-2">
          {groups.map((g) => {
            const gd = groupDef(g);
            const active = chosen === g;
            return (
              <button
                key={g}
                onClick={() => setChosen(g)}
                className={cn(
                  "flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-all active:scale-95",
                  active
                    ? "bg-plum text-white"
                    : "bg-cream-deep text-ink-soft"
                )}
              >
                {gd.emoji} {gd.nome}
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        Coma uma porção de <strong className="text-ink">{def.exemplos}</strong>{" "}
        e observe seu corpo nas próximas horas.
      </p>

      <p className="mt-3 text-sm font-semibold text-ink">Como seu corpo reagiu?</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {REACTIONS.map((r) => {
          const active = existing?.reaction === r.level;
          return (
            <button
              key={r.level}
              onClick={() => registrar(r.level)}
              disabled={busy}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-semibold transition-all active:scale-95 disabled:opacity-60",
                active
                  ? "bg-plum text-white shadow-[var(--shadow-soft)]"
                  : "bg-cream-deep text-ink-soft hover:bg-line"
              )}
            >
              <span className="text-base">{r.emoji}</span> {r.label}
            </button>
          );
        })}
      </div>

      {existing && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-plum"
        >
          <Check className="size-4" strokeWidth={3} /> Anotado no seu Mapa de
 Tolerância
        </motion.p>
      )}
    </Card>
  );
}
