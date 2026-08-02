import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Peças de leitura do painel.
 *
 * O admin é, na maior parte, tabela e definição — e é aí que painel vira
 * "sopa de card" igual a home era. Estas peças existem pra que toda página
 * tenha a MESMA régua de tabela, mesma altura de linha, mesmo cabeçalho.
 */

export function Secao({
  titulo,
  descricao,
  acao,
  children,
  className,
}: {
  titulo: string;
  descricao?: React.ReactNode;
  acao?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-9", className)}>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-h2 font-semibold text-ink">{titulo}</h2>
          {descricao && (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-soft">
              {descricao}
            </p>
          )}
        </div>
        {acao}
      </div>
      {children}
    </section>
  );
}

export function Tabela({
  colunas,
  children,
  className,
}: {
  colunas: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-line bg-surface",
        className
      )}
    >
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            {colunas.map((c) => (
              <th
                key={c}
                className="eyebrow whitespace-nowrap px-4 py-3 font-semibold"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">{children}</tbody>
      </table>
    </div>
  );
}

export function Linha({ children }: { children: React.ReactNode }) {
  return <tr className="align-top transition-colors hover:bg-canvas/60">{children}</tr>;
}

export function Celula({
  children,
  className,
  numerica,
}: {
  children: React.ReactNode;
  className?: string;
  numerica?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-sm text-ink",
        numerica && "numeral whitespace-nowrap",
        className
      )}
    >
      {children}
    </td>
  );
}

/** Aviso de contexto — usado pra dizer o que é editável e o que não é. */
export function Nota({
  icone: Icone,
  titulo,
  children,
  tom = "neutro",
}: {
  icone: LucideIcon;
  titulo: string;
  children: React.ReactNode;
  tom?: "neutro" | "atencao";
}) {
  return (
    <div
      className={cn(
        "mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3.5",
        tom === "atencao"
          ? "border-gold/40 bg-gold-tint/50"
          : "border-line bg-surface"
      )}
    >
      <Icone
        className={cn(
          "mt-0.5 size-[18px] shrink-0",
          tom === "atencao" ? "text-gold-dark" : "text-ink-faint"
        )}
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{titulo}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{children}</p>
      </div>
    </div>
  );
}

/** Bloco de número grande com rótulo — para as regras numéricas. */
export function Numero({
  valor,
  rotulo,
  detalhe,
  tom = "rose",
}: {
  valor: React.ReactNode;
  rotulo: string;
  detalhe?: string;
  tom?: "rose" | "gold" | "neutro";
}) {
  const cor = {
    rose: "text-rose-dark",
    gold: "text-gold-dark",
    neutro: "text-ink",
  }[tom];
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-3.5">
      <p className={cn("numeral font-display text-[1.65rem] leading-none", cor)}>
        {valor}
      </p>
      <p className="mt-1.5 text-sm font-medium text-ink">{rotulo}</p>
      {detalhe && <p className="mt-0.5 text-xs text-ink-soft">{detalhe}</p>}
    </div>
  );
}

/** Chip de rótulo curto (grupo FODMAP, fase, tipo). */
export function Chip({
  children,
  tom = "neutro",
}: {
  children: React.ReactNode;
  tom?: "neutro" | "rose" | "boa" | "media" | "ruim";
}) {
  const estilos = {
    neutro: "bg-canvas text-ink-soft",
    rose: "bg-rose-tint text-rose-dark",
    boa: "bg-[var(--color-nota-boa-tint)] text-[var(--color-nota-boa)]",
    media: "bg-[var(--color-nota-media-tint)] text-[var(--color-nota-media)]",
    ruim: "bg-[var(--color-nota-ruim-tint)] text-[var(--color-nota-ruim)]",
  }[tom];
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
        estilos
      )}
    >
      {children}
    </span>
  );
}
