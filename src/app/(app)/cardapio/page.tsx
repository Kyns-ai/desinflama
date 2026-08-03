"use client";

/**
 * O cardápio DELA + a lista de compras que sai dele.
 *
 * Antes era um cardápio fixo por fase, igual para todo mundo. Agora é montado
 * a partir do "gosto / não é pra mim" — o padrão que os funis grandes de saúde
 * usam (Homemade Method) porque plano com comida que ela já come é plano que
 * ela segue, e plano genérico é o que ela abandona na terça.
 *
 * Cada refeição tem TROCA. Sem troca, cardápio vira imposição — e imposição em
 * comida é exatamente o que faz a pessoa largar.
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Coffee,
  MessageCircle,
  Moon,
  RefreshCw,
  Settings2,
  ShoppingCart,
  Sun,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { Preferencias } from "./Preferencias";
import { useAppStore } from "@/store/useAppStore";
import {
  alternativasPara,
  cardapioDaSemana,
  type ContextoCardapio,
  type DiaDoCardapio,
} from "@/lib/cardapioPessoal";
import { RECIPES, type Recipe } from "@/content/recipes";
import {
  buildShoppingList,
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  itemSlug,
} from "@/lib/shoppingList";
import { cn } from "@/lib/cn";

const SEMANAS = [1, 2, 3];
const REFEICOES = [
  { chave: "cafe", rotulo: "Café", icone: Coffee },
  { chave: "almoco", rotulo: "Almoço", icone: Sun },
  { chave: "jantar", rotulo: "Jantar", icone: Moon },
] as const;

type ChaveRefeicao = (typeof REFEICOES)[number]["chave"];

export default function Cardapio() {
  const router = useRouter();
  const data = useAppStore((s) => s.data);
  const trocarRefeicao = useAppStore((s) => s.trocarRefeicao);

  const [semana, setSemana] = useState(1);
  const [aba, setAba] = useState<"menu" | "lista">("menu");
  const [editandoGostos, setEditandoGostos] = useState(false);
  const [trocando, setTrocando] = useState<{
    chave: string;
    receita: Recipe;
  } | null>(null);

  const ctx: ContextoCardapio = useMemo(
    () => ({ preferencias: data.preferencias, tolerancia: data.tolerance }),
    [data.preferencias, data.tolerance]
  );

  const semPreferencias =
    data.preferencias.gosta.length === 0 && data.preferencias.evita.length === 0;

  const dias = useMemo(() => cardapioDaSemana(semana, ctx), [semana, ctx]);

  /** Aplica as trocas que ela fez por cima do cardápio calculado. */
  const diasComTrocas = useMemo(
    () =>
      dias.map((d) => {
        const aplicar = (tipo: ChaveRefeicao, atual: Recipe | null) => {
          const id = data.trocasCardapio[`${semana}:${d.dia}:${tipo}`];
          return id ? (RECIPES.find((r) => r.id === id) ?? atual) : atual;
        };
        return {
          ...d,
          cafe: aplicar("cafe", d.cafe),
          almoco: aplicar("almoco", d.almoco),
          jantar: aplicar("jantar", d.jantar),
        } satisfies DiaDoCardapio;
      }),
    [dias, data.trocasCardapio, semana]
  );

  const receitasDaSemana = useMemo(() => {
    const vistas = new Map<string, Recipe>();
    for (const d of diasComTrocas) {
      for (const r of [d.cafe, d.almoco, d.jantar]) if (r) vistas.set(r.id, r);
    }
    return [...vistas.values()];
  }, [diasComTrocas]);

  const lista = useMemo(
    () => buildShoppingList(receitasDaSemana),
    [receitasDaSemana]
  );

  return (
    <div className="pb-4">
      <header className="flex items-center gap-3 pt-5">
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-display text-h2 font-semibold text-ink">
          Seu cardápio
        </h1>
      </header>

      {/* Chamada para personalizar — some assim que ela responde */}
      {semPreferencias ? (
        <button
          onClick={() => setEditandoGostos(true)}
          className="mt-4 block w-full rounded-3xl bg-rose-dark p-5 text-left transition-transform active:scale-[0.99]"
        >
          <p className="text-label font-semibold uppercase tracking-[0.06em] text-white/55">
            Falta 1 minuto
          </p>
          <p className="mt-1.5 font-display text-h3 font-semibold text-white">
            Monte o cardápio com a comida que você já gosta
          </p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-white/70">
            Você marca o que come e o que não come. O resto a gente monta — e dá
            pra trocar qualquer refeição depois.
          </p>
        </button>
      ) : (
        <button
          onClick={() => setEditandoGostos(true)}
          className="mt-4 flex w-full items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3 text-left text-sm transition-colors active:bg-cream-deep"
        >
          <Settings2 className="size-4 shrink-0 text-rose-deep" />
          <span className="min-w-0 flex-1 text-ink">
            Montado com {data.preferencias.gosta.length}{" "}
            {data.preferencias.gosta.length === 1 ? "coisa" : "coisas"} que você
            gosta
          </span>
          <span className="shrink-0 font-semibold text-rose-dark">Ajustar</span>
        </button>
      )}

      {/* semanas */}
      <div className="mt-4 flex gap-2">
        {SEMANAS.map((s) => (
          <button
            key={s}
            onClick={() => setSemana(s)}
            className={cn(
              "flex-1 rounded-xl py-2 text-sm font-semibold transition-colors",
              semana === s ? "bg-rose text-white" : "bg-cream-deep text-ink-soft"
            )}
          >
            Semana {s}
          </button>
        ))}
      </div>

      {/* abas */}
      <div className="mt-4 flex gap-2">
        {(
          [
            ["menu", "Cardápio", UtensilsCrossed],
            ["lista", "Lista de compras", ShoppingCart],
          ] as const
        ).map(([id, rotulo, Icone]) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
              aba === id ? "bg-ink text-white" : "bg-cream-deep text-ink-soft"
            )}
          >
            <Icone className="size-4" />
            {rotulo}
          </button>
        ))}
      </div>

      {aba === "menu" ? (
        <ul className="mt-4 space-y-3">
          {diasComTrocas.map((d) => (
            <li key={d.dia}>
              <Card elevation="soft" className="p-0">
                <div className="flex items-baseline justify-between px-4 pb-2 pt-3.5">
                  <p className="font-semibold tracking-tight text-ink">
                    {d.diaSemana}
                  </p>
                  <p className="text-xs text-ink-faint">
                    dia {d.dia} · {d.fase}
                  </p>
                </div>
                <ul className="divide-y divide-line-soft border-t border-line-soft">
                  {REFEICOES.map(({ chave, rotulo, icone: Icone }) => {
                    const receita = d[chave];
                    return (
                      <li
                        key={chave}
                        className="flex items-center gap-3 px-4 py-2.5"
                      >
                        <Icone className="size-4 shrink-0 text-ink-faint" />
                        <span className="w-14 shrink-0 text-xs font-medium text-ink-faint">
                          {rotulo}
                        </span>
                        <span className="min-w-0 flex-1 text-[15px] text-ink">
                          {receita?.nome ?? "—"}
                        </span>
                        {receita && (
                          <button
                            onClick={() =>
                              setTrocando({
                                chave: `${semana}:${d.dia}:${chave}`,
                                receita,
                              })
                            }
                            aria-label={`Trocar ${rotulo} de ${d.diaSemana}`}
                            className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-faint transition-colors active:bg-cream-deep"
                          >
                            <RefreshCw className="size-4" />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <ListaDeCompras lista={lista} />
      )}

      {/* Tirar dúvida sobre o cardápio — a conversa é FUNÇÃO daqui, não uma
          aba própria: o produto não é uma nutricionista de IA. */}
      <Link
        href="/duvida?sobre=cardapio"
        className="mt-5 flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 transition-colors active:bg-cream-deep"
      >
        <MessageCircle className="size-5 shrink-0 text-rose-deep" />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold tracking-tight text-ink">
            Ficou com dúvida?
          </span>
          <span className="block text-sm text-ink-soft">
            Pergunte sobre qualquer refeição do seu cardápio
          </span>
        </span>
      </Link>

      <AnimatePresence>
        {editandoGostos && (
          <Preferencias aoFechar={() => setEditandoGostos(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {trocando && (
          <EscolherTroca
            atual={trocando.receita}
            ctx={ctx}
            aoEscolher={async (id) => {
              await trocarRefeicao(trocando.chave, id);
              setTrocando(null);
            }}
            aoFechar={() => setTrocando(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ListaDeCompras({
  lista,
}: {
  lista: ReturnType<typeof buildShoppingList>;
}) {
  const flags = useAppStore((s) => s.data.flags);
  const update = useAppStore((s) => s.update);

  const grupos = CATEGORY_ORDER.map((cat) => ({
    cat,
    itens: lista[cat] ?? [],
  })).filter((g) => g.itens.length);

  if (!grupos.length) {
    return (
      <p className="mt-6 rounded-2xl bg-surface px-4 py-6 text-center text-sm text-ink-soft">
        A lista aparece quando o cardápio da semana estiver montado.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {grupos.map((g) => (
        <Card key={g.cat} elevation="soft">
          <h2 className="eyebrow mb-2.5">{CATEGORY_LABEL[g.cat].nome}</h2>
          <ul className="space-y-1">
            {g.itens.map((i) => {
              const chave = `compra:${itemSlug(i.item)}`;
              const marcado = !!flags[chave];
              return (
                <li key={i.item}>
                  <button
                    onClick={() =>
                      void update((d) => {
                        d.flags[chave] = !d.flags[chave];
                      })
                    }
                    className="flex w-full items-center gap-3 py-1.5 text-left"
                  >
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors",
                        marcado ? "border-rose bg-rose" : "border-line"
                      )}
                    >
                      {marcado && (
                        <svg viewBox="0 0 12 12" className="size-3 text-white">
                          <path
                            d="M2 6.5 4.5 9 10 3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span
                      className={cn(
                        "min-w-0 flex-1 text-[15px]",
                        marcado ? "text-ink-faint line-through" : "text-ink"
                      )}
                    >
                      {i.item}
                    </span>
                    {i.qtys.length > 0 && (
                      <span className="shrink-0 text-xs text-ink-faint">
                        {i.qtys.join(" · ")}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      ))}
    </div>
  );
}

function EscolherTroca({
  atual,
  ctx,
  aoEscolher,
  aoFechar,
}: {
  atual: Recipe;
  ctx: ContextoCardapio;
  aoEscolher: (id: string) => void;
  aoFechar: () => void;
}) {
  const opcoes = alternativasPara(atual, ctx, 6);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/30"
      onClick={aoFechar}
    >
      <motion.div
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 40 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-t-[2rem] bg-cream px-5 pb-safe pt-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-h3 font-semibold text-ink">
              Trocar por
            </h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              Mesmo tipo de refeição, ordenadas pelo que você gosta.
            </p>
          </div>
          <button
            onClick={aoFechar}
            aria-label="Fechar"
            className="grid size-9 shrink-0 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
          >
            <X className="size-5" />
          </button>
        </div>

        <ul className="mb-4 mt-4 space-y-1.5">
          {opcoes.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => aoEscolher(r.id)}
                className="flex w-full items-center gap-3 rounded-2xl bg-surface px-4 py-3 text-left transition-transform active:scale-[0.99]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-ink">{r.nome}</span>
                  <span className="block text-xs text-ink-faint">
                    {r.tempo} · {r.phase}
                  </span>
                </span>
                <RefreshCw className="size-4 shrink-0 text-rose-deep" />
              </button>
            </li>
          ))}
          {!opcoes.length && (
            <li className="rounded-2xl bg-surface px-4 py-6 text-center text-sm text-ink-soft">
              Não sobrou alternativa depois dos seus &ldquo;não é pra mim&rdquo;.
              Ajuste as preferências para liberar mais opções.
            </li>
          )}
        </ul>
      </motion.div>
    </motion.div>
  );
}
