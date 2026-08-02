"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Plus, Trash2, UtensilsCrossed, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/ui";
import { MedidorArco, SeloDaNota } from "@/components/prato/MedidorArco";
import { NovaRefeicao } from "./NovaRefeicao";
import { useAppStore } from "@/store/useAppStore";
import { blobStore } from "@/data/storage";
import { faixaDe, FAIXAS } from "@/lib/notaPrato";
import { todayKey } from "@/lib/date";
import type { RefeicaoAnalisada } from "@/types/domain";
import { cn } from "@/lib/cn";

const ROTULO_MOMENTO: Record<RefeicaoAnalisada["momento"], string> = {
  cafe: "Café",
  almoco: "Almoço",
  jantar: "Jantar",
  lanche: "Lanche",
};

export default function Prato() {
  const refeicoes = useAppStore((s) => s.data.refeicoes);
  const [montando, setMontando] = useState(false);
  const [aberta, setAberta] = useState<string | null>(null);

  const hoje = todayKey();
  const doDia = useMemo(
    () =>
      refeicoes
        .filter((r) => r.date === hoje)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [refeicoes, hoje]
  );

  // A nota do dia é a MÉDIA das refeições, não a pior nem a última: um deslize
  // no lanche não pode apagar um dia inteiro bem feito — seria o mesmo tipo de
  // punição que a gente tirou do resto do app.
  const notaDoDia = doDia.length
    ? Math.round(doDia.reduce((s, r) => s + r.nota, 0) / doDia.length)
    : null;

  const selecionada = doDia.find((r) => r.id === aberta) ?? null;

  return (
    <div className="pb-4">
      <PageHeader
        eyebrow="Prato"
        title="Nota Desinflama"
        subtitle="A nota é sua, não do alimento: ela muda conforme você descobre o que o seu corpo tolera."
      />

      {notaDoDia === null ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="Nenhuma refeição hoje"
          description="Monte o que você comeu e veja o quanto aquilo costuma inchar VOCÊ — com o seu Mapa de Tolerância na conta."
          action={
            <button
              onClick={() => setMontando(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose px-5 py-3 text-[15px] font-semibold text-white shadow-[var(--shadow-rose)] transition-transform active:scale-95"
            >
              <Camera className="size-5" /> Registrar refeição
            </button>
          }
        />
      ) : (
        <>
          <section className="mt-6 flex flex-col items-center">
            <MedidorArco nota={notaDoDia} />
            <p className="mt-3 max-w-[19rem] text-center text-[15px] leading-relaxed text-ink-soft">
              {microcopia(notaDoDia, doDia.length)}
            </p>
          </section>

          <section className="mt-7">
            <h2 className="eyebrow mb-3">Refeições de hoje</h2>
            <ul className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {doDia.map((r) => (
                <li key={r.id} className="shrink-0">
                  <button
                    onClick={() => setAberta(r.id)}
                    className="relative block w-[104px] text-left"
                  >
                    <MiniaturaRefeicao refeicao={r} />
                    <p className="mt-1.5 truncate text-xs font-medium text-ink-soft">
                      {ROTULO_MOMENTO[r.momento]}
                    </p>
                  </button>
                </li>
              ))}
              <li className="shrink-0">
                <button
                  onClick={() => setMontando(true)}
                  className="grid h-[104px] w-[104px] place-items-center rounded-2xl border border-dashed border-line bg-surface text-ink-faint transition-colors active:bg-cream-deep"
                  aria-label="Adicionar refeição"
                >
                  <Plus className="size-6" />
                </button>
                <p className="mt-1.5 text-xs font-medium text-ink-soft">
                  Adicionar
                </p>
              </li>
            </ul>
          </section>
        </>
      )}

      <AnimatePresence>
        {montando && <NovaRefeicao aoFechar={() => setMontando(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {selecionada && (
          <CartaoDaRefeicao
            refeicao={selecionada}
            aoFechar={() => setAberta(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function microcopia(nota: number, quantas: number): string {
  const plural = quantas === 1 ? "1 refeição" : `${quantas} refeições`;
  if (nota >= 80) return `Média de ${plural} hoje. Esse é o tipo de dia que desinflama.`;
  if (nota >= 50)
    return `Média de ${plural} hoje. Nada errado — só depende do tamanho da porção.`;
  return `Média de ${plural} hoje. Amanhã dá pra trocar uma coisa só e a nota sobe.`;
}

/** Miniatura com a foto (ou um azulejo desenhado quando não houver). */
function MiniaturaRefeicao({ refeicao }: { refeicao: RefeicaoAnalisada }) {
  const foto = useFotoDaRefeicao(refeicao.fotoRef);

  return (
    <span className="relative block">
      {foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={foto}
          alt=""
          className="h-[104px] w-[104px] rounded-2xl object-cover"
        />
      ) : (
        <span className="grid h-[104px] w-[104px] place-items-center rounded-2xl bg-cream-deep text-ink-faint">
          <UtensilsCrossed className="size-7" />
        </span>
      )}
      <SeloDaNota
        nota={refeicao.nota}
        className="absolute -bottom-1.5 -right-1.5"
      />
    </span>
  );
}

/**
 * Cartão da refeição — esqueleto da ZOE (docs/referencia/zoe-02.jpg): foto
 * sangrando até a borda, nome grande por cima, círculo com a nota, veredito
 * ao lado e os ingredientes com o grupo FODMAP embaixo.
 */
function CartaoDaRefeicao({
  refeicao,
  aoFechar,
}: {
  refeicao: RefeicaoAnalisada;
  aoFechar: () => void;
}) {
  const remover = useAppStore((s) => s.removerRefeicao);
  const foto = useFotoDaRefeicao(refeicao.fotoRef);
  const faixa = faixaDe(refeicao.nota);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-cream"
    >
      <div className="relative">
        {/* Sem foto, o cabeçalho encolhe. Manter os 300px cheios de rosa
            escuro dava um bloco vazio no topo — "buraco desenhado de caro". */}
        <div
          className={cn(
            "relative w-full overflow-hidden bg-rose-dark",
            foto ? "h-[300px]" : "h-[210px]"
          )}
        >
          {foto ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto} alt="" className="size-full object-cover" />
              {/* véu escuro só onde o texto pousa — sem ele o nome do prato
                  some em foto clara, que é a maioria das fotos de comida */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
            </>
          ) : (
            <OrnamentoSemFoto />
          )}

          <button
            onClick={aoFechar}
            aria-label="Fechar"
            className="absolute left-4 top-4 grid size-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-transform active:scale-95 pt-safe"
          >
            <X className="size-5" />
          </button>

          <div className="absolute inset-x-0 bottom-0 p-5">
            <h2 className="font-display text-h2 font-semibold leading-tight text-white">
              {refeicao.nome}
            </h2>
            <div className="mt-3 flex items-center gap-2.5">
              <SeloDaNota nota={refeicao.nota} tamanho={44} />
              <span className="text-[15px] font-semibold text-white">
                {FAIXAS[faixa].veredito}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-5 py-6">
          <section>
            <h3 className="eyebrow mb-2">A troca de hoje</h3>
            <p className="rounded-2xl bg-rose-tint px-4 py-3.5 text-[15px] leading-relaxed text-rose-dark">
              {refeicao.troca}
            </p>
          </section>

          <section>
            <h3 className="eyebrow mb-2">O que tinha no prato</h3>
            <ul className="divide-y divide-line-soft overflow-hidden rounded-2xl border border-line bg-surface">
              {refeicao.itens.map((i) => (
                <li
                  key={i.nome}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <span className="min-w-0 flex-1 text-[15px] text-ink">
                    {i.nome}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                      i.grupo
                        ? "bg-[var(--color-nota-media-tint)] text-[var(--color-nota-media)]"
                        : "bg-[var(--color-nota-boa-tint)] text-[var(--color-nota-boa)]"
                    )}
                  >
                    {i.grupo ?? "cai bem"}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <button
            onClick={async () => {
              await remover(refeicao.id);
              aoFechar();
            }}
            className="flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-ink-faint transition-colors active:text-danger"
          >
            <Trash2 className="size-4" /> Apagar esta refeição
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/** Textura de linha para quando não há foto — vazio desenhado, não bloco morto. */
function OrnamentoSemFoto() {
  return (
    <svg
      viewBox="0 0 390 210"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className="absolute inset-0 size-full"
      fill="none"
      stroke="#fff"
      strokeOpacity="0.12"
      strokeWidth="1.2"
      strokeLinecap="round"
    >
      <circle cx="316" cy="52" r="46" />
      <circle cx="316" cy="52" r="28" strokeOpacity="0.08" />
      <path d="M270 52h92M316 6v92" strokeOpacity="0.08" />
      <path d="M-10 176 C 60 140 130 140 200 176" />
      <path d="M40 40 c 10 14 10 30 0 44" strokeOpacity="0.09" />
    </svg>
  );
}

/** Lê a foto do blobStore (elas não ficam no estado — são pesadas demais). */
function useFotoDaRefeicao(ref?: string) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    // Sem `ref` não há o que carregar nem o que limpar: chamar setState direto
    // aqui provocava um render extra à toa em toda miniatura sem foto.
    if (!ref) return;
    let vivo = true;
    void blobStore.load(ref).then((v) => {
      if (vivo) setUrl(v);
    });
    return () => {
      vivo = false;
    };
  }, [ref]);

  return ref ? url : null;
}
