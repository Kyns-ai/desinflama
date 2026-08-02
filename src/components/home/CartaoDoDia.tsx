"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

export interface LinhaDoDia {
  icone: LucideIcon;
  rotulo: string;
  detalhe: string;
  feito: boolean;
  /** Navega (aula, check-in) OU marca na hora (água, sem gatilho). */
  href?: string;
  aoMarcar?: () => void | Promise<void>;
  sementes: number;
}

/**
 * O cartão do dia — a única coisa da home que pede ação.
 *
 * Antes a home tinha 11 cartões brancos idênticos empilhados ("sopa de card"):
 * tudo com o mesmo peso significa nada com peso, e a cliente rolava a tela
 * inteira pra descobrir o que fazer. Aqui é UM cartão, com a lista dentro dele.
 */
export function CartaoDoDia({
  dia,
  totalDias,
  fase,
  linhas,
  diaConcluido,
  fechadoOutroHoje,
  ocupado,
  aoFecharDia,
}: {
  dia: number;
  totalDias: number;
  fase: string;
  linhas: LinhaDoDia[];
  diaConcluido: boolean;
  fechadoOutroHoje: boolean;
  ocupado: boolean;
  aoFecharDia: () => void;
}) {
  const feitos = linhas.filter((l) => l.feito).length;
  const tudoFeito = feitos === linhas.length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-3xl bg-surface shadow-[var(--shadow-lift)]"
    >
      <header className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
        <div className="min-w-0">
          <p className="eyebrow">
            Dia {dia} de {totalDias} · {fase}
          </p>
          <h2 className="font-display text-h2 font-semibold text-ink">
            Seu dia de hoje
          </h2>
        </div>
        <AnelDoDia feitos={feitos} total={linhas.length} />
      </header>

      <ul className="divide-y divide-line-soft border-t border-line-soft">
        {linhas.map((l) => (
          <LinhaItem key={l.rotulo} linha={l} />
        ))}
      </ul>

      <div className="p-4">
        {diaConcluido ? (
          <p className="flex items-center justify-center gap-2 py-1 text-sm font-semibold text-rose-dark">
            <Check className="size-4" strokeWidth={3} /> Dia {dia} concluído
          </p>
        ) : fechadoOutroHoje ? (
          <p className="px-2 text-center text-sm leading-relaxed text-ink-soft">
            Um dia por dia. O Dia {dia} abre pra concluir amanhã — hoje você já
            fechou o seu.
          </p>
        ) : (
          <>
            <Button
              fullWidth
              size="lg"
              loading={ocupado}
              variant={tudoFeito ? "primary" : "secondary"}
              onClick={aoFecharDia}
            >
              {tudoFeito ? `Concluir Dia ${dia}` : "Fechar o dia mesmo assim"}
              {tudoFeito && <ArrowRight className="size-5" />}
            </Button>
            {!tudoFeito && (
              <p className="mt-2.5 text-center text-xs text-ink-faint">
                Faltam {linhas.length - feitos} de {linhas.length} — e dá pra
                fechar sem culpa.
              </p>
            )}
          </>
        )}
      </div>
    </motion.section>
  );
}

function LinhaItem({ linha }: { linha: LinhaDoDia }) {
  const router = useRouter();
  const [marcando, setMarcando] = useState(false);
  const Icone = linha.icone;

  async function acionar() {
    if (linha.href) {
      router.push(linha.href);
      return;
    }
    if (linha.feito || marcando) return;
    setMarcando(true);
    await linha.aoMarcar?.();
    setMarcando(false);
  }

  return (
    <li>
      <button
        onClick={acionar}
        disabled={linha.feito && !linha.href}
        className="flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors active:bg-cream-deep/40 disabled:opacity-100"
      >
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-2xl transition-colors",
            linha.feito ? "bg-rose text-white" : "bg-rose-tint text-rose-dark"
          )}
        >
          {linha.feito ? (
            <Check className="size-5" strokeWidth={2.8} />
          ) : (
            <Icone className="size-5" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block font-semibold tracking-tight",
              linha.feito ? "text-ink-faint line-through" : "text-ink"
            )}
          >
            {linha.rotulo}
          </span>
          <span className="block truncate text-sm text-ink-soft">
            {linha.detalhe}
          </span>
        </span>

        {/* O valor em sementes fica visível ANTES de fazer: é o preço que ela
            está deixando na mesa. Depois de feito, some — vira ruído. */}
        {!linha.feito && (
          <span className="shrink-0 text-sm font-semibold text-rose-deep">
            +{linha.sementes}
          </span>
        )}
        {linha.href && !linha.feito && (
          <ChevronRight className="size-5 shrink-0 text-ink-faint" />
        )}
      </button>
    </li>
  );
}

function AnelDoDia({ feitos, total }: { feitos: number; total: number }) {
  const lado = 46;
  const r = 19;
  const c = 2 * Math.PI * r;
  const pct = total ? feitos / total : 0;
  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: lado, height: lado }}
    >
      <svg width={lado} height={lado} className="-rotate-90">
        <circle
          cx={lado / 2}
          cy={lado / 2}
          r={r}
          fill="none"
          stroke="var(--color-cream-deep)"
          strokeWidth="5"
        />
        <motion.circle
          cx={lado / 2}
          cy={lado / 2}
          r={r}
          fill="none"
          stroke="var(--color-rose)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <span className="numeral absolute text-xs text-ink">
        {feitos}/{total}
      </span>
    </div>
  );
}
