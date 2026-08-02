"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { faixaDe, FAIXAS } from "@/lib/notaPrato";
import { cn } from "@/lib/cn";

/**
 * Medidor em arco 0–100 — esqueleto da ZOE (docs/referencia/zoe-03.jpg).
 *
 * O que a gente copiou: o arco semicircular com a trilha inteira colorida, o
 * botão marcando a posição, a palavra do veredito acima e o número gigante
 * embaixo. Copiamos porque funciona: a trilha colorida inteira dá a escala
 * (você vê onde poderia estar), enquanto uma barra que só enche mostra o
 * valor sem contexto nenhum.
 *
 * O que a gente NÃO copiou: o amarelo da marca deles e o vocabulário de
 * microbioma que a gente não mede.
 */
export function MedidorArco({
  nota,
  rotulo = "Nota Desinflama de hoje",
  tamanho = 260,
  className,
}: {
  /** 0–100. */
  nota: number;
  rotulo?: string;
  tamanho?: number;
  className?: string;
}) {
  const raio = 96;
  const cx = 110;
  const cy = 118;
  const largura = 14;
  const alturaSvg = (tamanho * 132) / 220;

  const reduzido = useRef(false);
  useEffect(() => {
    reduzido.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const progresso = useMotionValue(0);
  const [exibido, setExibido] = useState(0);

  useEffect(() => {
    const alvo = Math.max(0, Math.min(100, nota)) / 100;
    const a = animate(progresso, alvo, {
      duration: reduzido.current ? 0 : 1,
      ease: [0.22, 1, 0.36, 1],
    });
    const n = animate(exibido, nota, {
      duration: reduzido.current ? 0 : 1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setExibido(Math.round(v)),
    });
    return () => {
      a.stop();
      n.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nota]);

  // O botão anda pelo arco: ângulo 180° (esquerda) a 360° (direita).
  const bx = useTransform(progresso, (p) => cx + raio * Math.cos(Math.PI * (1 + p)));
  const by = useTransform(progresso, (p) => cy + raio * Math.sin(Math.PI * (1 + p)));

  const faixa = faixaDe(nota);
  const corTexto = {
    "cai-bem": "text-[var(--color-nota-boa)]",
    depende: "text-[var(--color-nota-media)]",
    incha: "text-[var(--color-nota-ruim)]",
  }[faixa];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg
        viewBox="0 0 220 132"
        width={tamanho}
        height={alturaSvg}
        role="img"
        aria-label={`${rotulo}: ${nota} de 100, ${FAIXAS[faixa].veredito}`}
      >
        <defs>
          <linearGradient id="arco-nota" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-nota-ruim)" />
            <stop offset="45%" stopColor="var(--color-nota-media)" />
            <stop offset="100%" stopColor="var(--color-nota-boa)" />
          </linearGradient>
        </defs>

        <path
          d={`M ${cx - raio} ${cy} A ${raio} ${raio} 0 0 1 ${cx + raio} ${cy}`}
          fill="none"
          stroke="url(#arco-nota)"
          strokeWidth={largura}
          strokeLinecap="round"
        />

        {/* Botão da posição: anel branco grosso pra ele existir por cima de
            qualquer ponto do gradiente, inclusive do verde claro. */}
        <motion.circle
          cx={bx}
          cy={by}
          r={9}
          fill="var(--color-surface)"
          stroke="currentColor"
          strokeWidth={4}
          className={corTexto}
        />
      </svg>

      {/* Tudo aqui é PROPORCIONAL ao tamanho do medidor. Com deslocamento e
          corpo de texto fixos em px, o medidor pequeno (a prévia no rodapé)
          escrevia por cima do próprio arco — funcionava só no tamanho grande,
          que foi onde ele nasceu. */}
      <div
        className="flex flex-col items-center"
        style={{ marginTop: -(alturaSvg * 0.34) }}
      >
        <p
          className={cn("font-semibold", corTexto)}
          style={{ fontSize: Math.max(11, tamanho * 0.054) }}
        >
          {FAIXAS[faixa].veredito}
        </p>
        <p
          className="numeral font-display leading-none text-ink"
          style={{ fontSize: tamanho * 0.215 }}
        >
          {exibido}
        </p>
        <p className="eyebrow mt-1.5">{rotulo}</p>
      </div>
    </div>
  );
}

/** Círculo pequeno com a nota — usado na miniatura da refeição (ZOE). */
export function SeloDaNota({
  nota,
  tamanho = 34,
  className,
}: {
  nota: number;
  tamanho?: number;
  className?: string;
}) {
  const faixa = faixaDe(nota);
  const fundo = {
    "cai-bem": "bg-[var(--color-nota-boa)]",
    depende: "bg-[var(--color-nota-media)]",
    incha: "bg-[var(--color-nota-ruim)]",
  }[faixa];

  return (
    <span
      style={{ width: tamanho, height: tamanho }}
      className={cn(
        "numeral grid place-items-center rounded-full text-[13px] text-white ring-2 ring-surface",
        fundo,
        className
      )}
    >
      {nota}
    </span>
  );
}
