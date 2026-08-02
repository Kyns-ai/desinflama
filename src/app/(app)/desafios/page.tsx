"use client";

import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, ProgressBar } from "@/components/ui";
import { Art } from "@/components/Art";
import { artId } from "@/content/cardArt";
import { MONTHLY_CHALLENGES } from "@/content/challenges";
import { useAppStore } from "@/store/useAppStore";

/**
 * Índice dos desafios mensais.
 *
 * Existia só `/desafios/[id]`: a Manutenção linkava para `/desafios` e caía
 * num 404 — link que não leva a lugar nenhum é pior que link ausente, porque
 * ela clica achando que o app tem mais e descobre que não tem.
 */
export default function Desafios() {
  const flags = useAppStore((s) => s.data.flags);

  return (
    <div className="pb-4">
      <PageHeader
        eyebrow="Manutenção"
        title="Desafios mensais"
        subtitle="Sete dias temáticos para quando a jornada principal já acabou e a vida continua."
      />

      <ul className="mt-5 space-y-3">
        {MONTHLY_CHALLENGES.map((c) => {
          const feitos = c.dias.filter((d) => flags[`mc:${c.id}:${d.day}`]).length;
          const completo = feitos === c.dias.length;

          return (
            <li key={c.id}>
              <Link href={`/desafios/${c.id}`} className="block">
                <Card
                  elevation="soft"
                  className="flex items-center gap-4 transition-transform active:scale-[0.99]"
                >
                  <Art
                    id={artId(c.emoji) ?? ""}
                    className="size-12 shrink-0 rounded-2xl bg-cream-deep"
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="flex items-center gap-1.5 font-semibold tracking-tight text-ink">
                      {c.nome}
                      {completo && <Trophy className="size-4 text-gold" />}
                    </h2>
                    <p className="mt-0.5 truncate text-sm text-ink-soft">
                      {feitos > 0
                        ? `${feitos} de ${c.dias.length} dias`
                        : c.descricao}
                    </p>
                    {feitos > 0 && (
                      <ProgressBar
                        className="mt-2"
                        value={feitos / c.dias.length}
                        height={6}
                      />
                    )}
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-ink-faint" />
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
