"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { Card } from "@/components/ui";
import { Art } from "@/components/Art";
import { artId } from "@/content/cardArt";
import { SEMAFORO, TIER_STYLE } from "@/content/semaforo";
import { cn } from "@/lib/cn";

export default function Semaforo() {
  const router = useRouter();

  return (
    <div className="space-y-5 pb-8">
      <header className="flex items-center gap-3 pt-5">
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Guia rápido
          </p>
          <h1 className="font-display text-[1.6rem] font-semibold tracking-tight text-ink">
            Semáforo dos alimentos
          </h1>
        </div>
      </header>

      <div className="flex items-start gap-2.5 rounded-2xl bg-cream-deep/50 px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-ink-faint" />
        <p className="text-[13px] leading-relaxed text-ink-faint">
          Não é “bom ou ruim” — é conforto provável. Nada é proibido: a maioria
          reage só a alguns alimentos, e a reintrodução devolve quase tudo. Seu
          corpo manda mais que a tabela.
        </p>
      </div>

      {SEMAFORO.map((tier) => {
        const style = TIER_STYLE[tier.tier];
        return (
          <Card key={tier.tier} elevation="soft" className={cn("border", style.ring)}>
            <div className="mb-3 flex items-center gap-2.5">
              <span className={cn("size-3.5 rounded-full", style.dot)} />
              <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
                {tier.label}
              </h2>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-ink-soft">{tier.desc}</p>
            <div className="flex flex-wrap gap-2">
              {tier.foods.map((f) => (
                <span
                  key={f.nome}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium",
                    style.chip
                  )}
                >
                  <Art
                    id={artId(f.emoji) ?? ""}
                    emoji={f.emoji}
                    className="size-5 rounded-md text-sm"
                  />
                  {f.nome}
                </span>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
