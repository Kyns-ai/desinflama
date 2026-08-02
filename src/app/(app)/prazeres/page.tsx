"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, Sprout, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button, Card, Input } from "@/components/ui";
import { Confetti } from "@/components/Confetti";
import { useAppStore } from "@/store/useAppStore";
import { PRAZERES_PADRAO, TETO_SEMANAL_SUGERIDO } from "@/content/prazeres";
import { estadoBroto } from "@/lib/broto";
import { todayKey, diffDays } from "@/lib/date";
import { haptic } from "@/lib/haptics";
import type { Prazer } from "@/types/domain";
import { cn } from "@/lib/cn";

export default function Prazeres() {
  const data = useAppStore((s) => s.data);
  const resgatarPrazer = useAppStore((s) => s.resgatarPrazer);
  const removerPrazer = useAppStore((s) => s.removerPrazer);

  const [comemorando, setComemorando] = useState<Prazer | null>(null);
  const [criando, setCriando] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);

  const saldo = data.seeds;
  const broto = estadoBroto(data.seedsLifetime, 0, false);

  const lista = useMemo(
    () =>
      [...PRAZERES_PADRAO, ...data.prazeresProprios].sort(
        (a, b) => a.preco - b.preco
      ),
    [data.prazeresProprios]
  );

  // Gasto dos últimos 7 dias — o "orçamento semanal de prazer" do WW.
  const hoje = todayKey();
  const gastoNaSemana = data.resgates
    .filter((r) => diffDays(hoje, r.date) < 7)
    .reduce((s, r) => s + r.preco, 0);

  async function resgatar(p: Prazer) {
    setOcupado(p.id);
    const r = await resgatarPrazer(p);
    setOcupado(null);
    if (r.resgatado) {
      void haptic("success");
      setComemorando(p);
    }
  }

  return (
    <div className="pb-4">
      <PageHeader
        eyebrow="Prazeres"
        title="O que você comprou com cuidado"
        subtitle="Isto não é escapada. É o prazer que você construiu — e ele está no seu plano."
      />

      {/* saldo — o número que manda na tela */}
      <Card elevation="lift" className="mt-5 bg-rose-dark text-white">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-label font-semibold uppercase tracking-[0.06em] text-white/55">
              Suas sementes
            </p>
            <p className="numeral mt-1 flex items-center gap-2 font-display text-[2.75rem] leading-none">
              <Sprout className="size-8" />
              {saldo}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/70">{broto.nivel.nome}</p>
            <p className="text-xs text-white/50">
              nível não cai quando você gasta
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-baseline justify-between text-xs text-white/70">
            <span>Seu prazer da semana</span>
            <span>
              {gastoNaSemana} de ~{TETO_SEMANAL_SUGERIDO}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20">
            <motion.div
              className={cn(
                "h-full rounded-full",
                gastoNaSemana > TETO_SEMANAL_SUGERIDO
                  ? "bg-[var(--color-nota-media)]"
                  : "bg-white"
              )}
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (gastoNaSemana / TETO_SEMANAL_SUGERIDO) * 100)}%`,
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/55">
            É uma sugestão, não uma trava. Serve pra loja não virar compulsão
            financiada por pontos.
          </p>
        </div>
      </Card>

      {/* a loja */}
      <section className="mt-6">
        <h2 className="eyebrow mb-3">Trocar sementes por</h2>
        <ul className="space-y-2">
          {lista.map((p) => {
            const podeComprar = saldo >= p.preco;
            return (
              <li key={p.id}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border bg-surface py-1 pl-4 pr-1 transition-opacity",
                    podeComprar ? "border-line" : "border-line-soft opacity-55"
                  )}
                >
                  <span className="min-w-0 flex-1 py-2.5 text-[15px] text-ink">
                    {p.nome}
                  </span>

                  {p.proprio && (
                    <button
                      onClick={() => void removerPrazer(p.id)}
                      aria-label={`Apagar ${p.nome}`}
                      className="shrink-0 rounded-full p-2 text-ink-faint transition-colors active:bg-black/5"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}

                  <button
                    onClick={() => void resgatar(p)}
                    disabled={!podeComprar || ocupado === p.id}
                    className={cn(
                      "numeral inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                      podeComprar
                        ? "bg-rose-tint text-rose-dark active:bg-rose active:text-white"
                        : "bg-cream-deep text-ink-faint"
                    )}
                  >
                    <Sprout className="size-4" />
                    {p.preco}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <button
          onClick={() => setCriando(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface py-3.5 text-sm font-semibold text-ink-soft transition-colors active:bg-cream-deep"
        >
          <Plus className="size-4" /> Criar o meu prazer
        </button>
      </section>

      {/* histórico — o que ela já trocou */}
      {data.resgates.length > 0 && (
        <section className="mt-7">
          <h2 className="eyebrow mb-3">Já foi seu</h2>
          <ul className="space-y-1.5">
            {[...data.resgates]
              .reverse()
              .slice(0, 8)
              .map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-xl bg-surface px-4 py-2.5"
                >
                  <Check className="size-4 shrink-0 text-rose-deep" strokeWidth={3} />
                  <span className="min-w-0 flex-1 truncate text-[15px] text-ink">
                    {r.nome}
                  </span>
                  <span className="numeral shrink-0 text-sm text-ink-faint">
                    {r.preco}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}

      <AnimatePresence>
        {comemorando && (
          <EstavaNoSeuPlano
            prazer={comemorando}
            aoFechar={() => setComemorando(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {criando && <NovoPrazer aoFechar={() => setCriando(false)} />}
      </AnimatePresence>
    </div>
  );
}

/**
 * A tela do resgate. A frase é o produto inteiro desta fase.
 *
 * "Estava no seu plano" existe porque a alternativa — qualquer variação de
 * "você saiu da dieta" — é o que faz a mulher esconder o que comeu. E o que
 * ela esconde, a gente não consegue ajudar a entender.
 */
function EstavaNoSeuPlano({
  prazer,
  aoFechar,
}: {
  prazer: Prazer;
  aoFechar: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-cream px-8 text-center"
    >
      <Confetti />
      <div>
        <motion.p
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
          className="font-display text-display font-semibold text-rose-dark"
        >
          Estava no seu plano.
        </motion.p>
        <p className="mx-auto mt-4 max-w-xs text-[17px] leading-relaxed text-ink-soft">
          {prazer.nome} — comprado com {prazer.preco} sementes de cuidado. Isso
          não é recaída, é resultado.
        </p>
        <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-ink-faint">
          Amanhã eu te pergunto como o seu corpo reagiu. Não é cobrança — é
          assim que o seu mapa fica mais preciso.
        </p>
        <Button size="lg" className="mt-8" onClick={aoFechar}>
          Aproveitar
        </Button>
      </div>
    </motion.div>
  );
}

function NovoPrazer({ aoFechar }: { aoFechar: () => void }) {
  const criarPrazer = useAppStore((s) => s.criarPrazer);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("60");
  const [salvando, setSalvando] = useState(false);

  const valido = nome.trim().length >= 2 && Number(preco) >= 5;

  async function salvar() {
    if (!valido) return;
    setSalvando(true);
    await criarPrazer(nome, Number(preco));
    setSalvando(false);
    aoFechar();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-cream px-5 pt-safe"
    >
      <header className="flex items-center justify-between py-3">
        <h1 className="font-display text-h3 font-semibold text-ink">
          Criar o meu prazer
        </h1>
        <button
          onClick={aoFechar}
          aria-label="Fechar"
          className="grid size-9 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
        >
          <X className="size-5" />
        </button>
      </header>

      <p className="text-[15px] leading-relaxed text-ink-soft">
        O prazer é seu, então o preço também. Coisa pequena do dia a dia entre
        30 e 60; coisa grande, de 150 pra cima.
      </p>

      <div className="mt-5 space-y-4">
        <Input
          label="O que é"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: um capítulo do livro na varanda"
          maxLength={60}
        />
        <Input
          label="Preço em sementes"
          type="number"
          inputMode="numeric"
          min={5}
          max={999}
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />
      </div>

      <Button
        fullWidth
        size="lg"
        className="mt-6"
        disabled={!valido}
        loading={salvando}
        onClick={salvar}
      >
        Adicionar à minha loja
      </Button>
    </motion.div>
  );
}
