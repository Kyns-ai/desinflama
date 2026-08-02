"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Celula, Chip, Linha, Tabela } from "@/components/painel";
import { calcularNota, FAIXAS, faixaDe } from "@/lib/notaPrato";
import {
  CATALOGO,
  paraItem,
  sugerirTroca,
  temFibra,
  type AlimentoCatalogo,
} from "@/content/catalogoPrato";
import { REINTRO_GROUPS } from "@/content/tolerance";
import type {
  BloatType,
  ReactionLevel,
  ReintroGroup,
  ToleranceResult,
} from "@/types/domain";
import { cn } from "@/lib/cn";

const PERFIS: { id: BloatType; nome: string }[] = [
  { id: "fermentacao", nome: "Fermentação" },
  { id: "retencao", nome: "Retenção" },
  { id: "lentidao", nome: "Trânsito lento" },
  { id: "estresse", nome: "Estresse" },
];

const REACOES: { valor: ReactionLevel | null; rotulo: string }[] = [
  { valor: null, rotulo: "não testou" },
  { valor: 0, rotulo: "tolerou" },
  { valor: 1, rotulo: "leve" },
  { valor: 2, rotulo: "moderou" },
  { valor: 3, rotulo: "forte" },
];

/**
 * Simulador da Nota Desinflama.
 *
 * Existe porque a pergunta que sempre aparece é "por que a nota dela deu
 * isso?", e a resposta em tabela estática nunca convence. Aqui dá pra montar
 * o prato, mexer no Mapa de Tolerância e no perfil, e VER a nota mudar — que
 * é a demonstração de que a nota é da pessoa, não do alimento.
 *
 * Usa exatamente a mesma função do app (`calcularNota`), não uma reimplementação.
 */
export function Simulador() {
  const [escolhidos, setEscolhidos] = useState<AlimentoCatalogo[]>(() =>
    CATALOGO.filter((a) =>
      ["Pão de trigo", "Queijo fresco / ricota", "Café"].includes(a.nome)
    )
  );
  const [perfil, setPerfil] = useState<BloatType | null>("fermentacao");
  const [reacoes, setReacoes] = useState<
    Partial<Record<ReintroGroup, ReactionLevel | null>>
  >({});
  const [busca, setBusca] = useState("");

  const tolerancia: ToleranceResult[] = useMemo(
    () =>
      Object.entries(reacoes)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([group, reaction]) => ({
          group: group as ReintroGroup,
          reaction: reaction as ReactionLevel,
          dateTested: "2026-01-01",
        })),
    [reacoes]
  );

  const itens = escolhidos.map(paraItem);
  const resultado = calcularNota(itens, {
    tolerancia,
    perfil,
    temFibra: temFibra(escolhidos),
  });
  const faixa = faixaDe(resultado.nota);
  const corFaixa = { "cai-bem": "boa", depende: "media", incha: "ruim" } as const;

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase();
    const base = t
      ? CATALOGO.filter((a) => a.nome.toLowerCase().includes(t))
      : CATALOGO;
    return base.slice(0, 40);
  }, [busca]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      {/* montagem */}
      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {escolhidos.map((a) => (
            <button
              key={a.nome}
              onClick={() =>
                setEscolhidos((c) => c.filter((x) => x.nome !== a.nome))
              }
              className="rounded-full bg-rose px-3 py-1.5 text-xs font-semibold text-white"
            >
              {a.nome} ×
            </button>
          ))}
          {!escolhidos.length && (
            <p className="text-sm text-ink-faint">
              Nenhum alimento — a nota fica 100.
            </p>
          )}
        </div>

        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar no catálogo…"
          className="mb-3 h-10 w-full rounded-xl border border-line bg-canvas px-3.5 text-sm text-ink placeholder:text-ink-faint focus:border-rose focus:outline-none"
        />

        <div className="max-h-[280px] overflow-y-auto">
          <div className="flex flex-wrap gap-1.5">
            {filtrados.map((a) => {
              const ativo = escolhidos.some((e) => e.nome === a.nome);
              return (
                <button
                  key={a.nome}
                  onClick={() =>
                    setEscolhidos((c) =>
                      ativo ? c.filter((x) => x.nome !== a.nome) : [...c, a]
                    )
                  }
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs transition-colors",
                    ativo
                      ? "border-rose bg-rose-tint font-semibold text-rose-dark"
                      : "border-line text-ink-soft hover:bg-canvas"
                  )}
                >
                  {ativo && <Check className="size-3" strokeWidth={3} />}
                  {a.nome}
                  {a.grupo && (
                    <span className="text-[10px] text-ink-faint">{a.grupo}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* controles + resultado */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-line bg-surface p-5 text-center">
          <p className="numeral font-display text-[3.25rem] leading-none text-ink">
            {resultado.nota}
          </p>
          <div className="mt-2">
            <Chip tom={corFaixa[faixa]}>{FAIXAS[faixa].veredito}</Chip>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="eyebrow mb-2">Perfil de inchaço</p>
          <div className="flex flex-wrap gap-1.5">
            {[{ id: null, nome: "sem perfil" }, ...PERFIS].map((p) => (
              <button
                key={String(p.id)}
                onClick={() => setPerfil(p.id as BloatType | null)}
                className={cn(
                  "rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors",
                  perfil === p.id
                    ? "bg-rose text-white"
                    : "bg-canvas text-ink-soft"
                )}
              >
                {p.nome}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="eyebrow mb-2">Mapa de Tolerância dela</p>
          <div className="space-y-2.5">
            {REINTRO_GROUPS.map((g) => (
              <div key={g.group}>
                <p className="mb-1 text-xs font-medium text-ink">{g.nome}</p>
                <div className="flex flex-wrap gap-1">
                  {REACOES.map((r) => (
                    <button
                      key={String(r.valor)}
                      onClick={() =>
                        setReacoes((c) => ({ ...c, [g.group]: r.valor }))
                      }
                      className={cn(
                        "rounded-lg px-2 py-1 text-[11px] font-medium transition-colors",
                        (reacoes[g.group] ?? null) === r.valor
                          ? "bg-rose-dark text-white"
                          : "bg-canvas text-ink-soft"
                      )}
                    >
                      {r.rotulo}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* de onde saiu cada ponto */}
      <div className="lg:col-span-2">
        <Tabela colunas={["De onde saiu o ponto", "Pontos", "Motivo"]}>
          {resultado.porques.length === 0 ? (
            <Linha>
              <Celula className="text-ink-faint" >
                Nada tirou ponto deste prato.
              </Celula>
              <Celula numerica>0</Celula>
              <Celula className="text-ink-faint">—</Celula>
            </Linha>
          ) : (
            resultado.porques.map((p, i) => (
              <Linha key={`${p.causa}-${i}`}>
                <Celula>{p.causa}</Celula>
                <Celula numerica className="text-rose-dark">
                  −{p.pontos}
                </Celula>
                <Celula className="text-ink-soft">{p.motivo}</Celula>
              </Linha>
            ))
          )}
        </Tabela>

        <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
          <p className="eyebrow mb-1.5">A troca que ela recebe</p>
          <p className="text-sm leading-relaxed text-ink">
            {sugerirTroca(itens)}
          </p>
        </div>
      </div>
    </div>
  );
}
