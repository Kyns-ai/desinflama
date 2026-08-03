"use client";

import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { Celula, Chip, Linha, Tabela } from "@/components/painel";
import {
  alimentosParaEscolher,
  cardapioDaSemana,
  pontuarReceita,
  type ContextoCardapio,
} from "@/lib/cardapioPessoal";
import { RECIPES } from "@/content/recipes";
import { REINTRO_GROUPS } from "@/content/tolerance";
import type { ReactionLevel, ReintroGroup, ToleranceResult } from "@/types/domain";
import { cn } from "@/lib/cn";

/**
 * Simulador do cardápio pessoal.
 *
 * Mesma ideia do simulador da Nota: a pergunta que sempre chega é "por que ela
 * recebeu ESSE cardápio?", e tabela estática não responde. Aqui dá pra marcar
 * gosto/não-gosto e reação, e ver a semana inteira se remontar — rodando a
 * mesma `cardapioDaSemana()` do app, não uma cópia.
 */
export function SimuladorCardapio() {
  const alimentos = useMemo(() => alimentosParaEscolher(), []);
  const [gosta, setGosta] = useState<string[]>([]);
  const [evita, setEvita] = useState<string[]>([]);
  const [reacoes, setReacoes] = useState<Partial<Record<ReintroGroup, ReactionLevel>>>({});
  const [semana, setSemana] = useState(1);

  const tolerancia: ToleranceResult[] = useMemo(
    () =>
      Object.entries(reacoes).map(([group, reaction]) => ({
        group: group as ReintroGroup,
        reaction: reaction as ReactionLevel,
        dateTested: "2026-01-01",
      })),
    [reacoes]
  );

  const ctx: ContextoCardapio = { preferencias: { gosta, evita }, tolerancia };
  const dias = cardapioDaSemana(semana, ctx);

  const excluidas = RECIPES.filter(
    (r) => pontuarReceita(r, ctx) === -Infinity
  );

  function alternar(a: string, lista: "gosta" | "evita") {
    const [atual, set] = lista === "gosta" ? [gosta, setGosta] : [evita, setEvita];
    const [outra, setOutra] = lista === "gosta" ? [evita, setEvita] : [gosta, setGosta];
    if (atual.includes(a)) set(atual.filter((x) => x !== a));
    else {
      set([...atual, a]);
      if (outra.includes(a)) setOutra(outra.filter((x) => x !== a));
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="eyebrow mb-2">Gosto / não é pra mim</p>
          <div className="max-h-[300px] space-y-1 overflow-y-auto">
            {alimentos.map((a) => (
              <div key={a} className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm text-ink">
                  {a}
                </span>
                <button
                  onClick={() => alternar(a, "gosta")}
                  aria-label={`Gosta de ${a}`}
                  className={cn(
                    "grid size-7 place-items-center rounded-lg transition-colors",
                    gosta.includes(a)
                      ? "bg-rose text-white"
                      : "bg-canvas text-ink-faint"
                  )}
                >
                  <Check className="size-3.5" strokeWidth={3} />
                </button>
                <button
                  onClick={() => alternar(a, "evita")}
                  aria-label={`Não come ${a}`}
                  className={cn(
                    "grid size-7 place-items-center rounded-lg transition-colors",
                    evita.includes(a)
                      ? "bg-ink text-white"
                      : "bg-canvas text-ink-faint"
                  )}
                >
                  <X className="size-3.5" strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="eyebrow mb-2">Mapa de Tolerância</p>
          <div className="space-y-2">
            {REINTRO_GROUPS.map((g) => (
              <div key={g.group}>
                <p className="mb-1 text-xs font-medium text-ink">{g.nome}</p>
                <div className="flex gap-1">
                  {([undefined, 0, 1, 2, 3] as const).map((r) => (
                    <button
                      key={String(r)}
                      onClick={() =>
                        setReacoes((c) => ({ ...c, [g.group]: r as ReactionLevel }))
                      }
                      className={cn(
                        "rounded-lg px-2 py-1 text-[11px] font-medium transition-colors",
                        reacoes[g.group] === r
                          ? "bg-rose-dark text-white"
                          : "bg-canvas text-ink-soft"
                      )}
                    >
                      {r === undefined ? "—" : ["tolerou", "leve", "moderou", "forte"][r]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {excluidas.length > 0 && (
          <div className="rounded-2xl border border-gold/40 bg-gold-tint/40 p-4">
            <p className="eyebrow mb-1.5">
              {excluidas.length} receitas fora do cardápio dela
            </p>
            <p className="text-xs leading-relaxed text-ink-soft">
              {excluidas.map((r) => r.nome).join(" · ")}
            </p>
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex gap-2">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setSemana(s)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                semana === s ? "bg-rose text-white" : "bg-canvas text-ink-soft"
              )}
            >
              Semana {s}
            </button>
          ))}
        </div>

        <Tabela colunas={["Dia", "Fase", "Café", "Almoço", "Jantar"]}>
          {dias.map((d) => (
            <Linha key={d.dia}>
              <Celula className="whitespace-nowrap font-semibold">
                {d.diaSemana} · {d.dia}
              </Celula>
              <Celula>
                <Chip>{d.fase}</Chip>
              </Celula>
              <Celula className="text-ink-soft">{d.cafe?.nome ?? "—"}</Celula>
              <Celula className="text-ink-soft">{d.almoco?.nome ?? "—"}</Celula>
              <Celula className="text-ink-soft">{d.jantar?.nome ?? "—"}</Celula>
            </Linha>
          ))}
        </Tabela>
      </div>
    </div>
  );
}
