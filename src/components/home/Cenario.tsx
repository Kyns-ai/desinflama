"use client";

import { Broto } from "@/components/broto/Broto";
import type { BrotoHumor, BrotoNivel } from "@/lib/broto";

/**
 * O cenário da Hoje — metade de cima da tela, esqueleto do Finch
 * (docs/referencia/finch-02.jpg): paisagem ilustrada em cima, cartão do dia
 * flutuando por cima da linha do horizonte.
 *
 * O que a gente copiou do Finch é a ESTRUTURA (cenário + cartão) e a ausência
 * de punição. O que a gente não copiou é o visual infantil azul: aqui o céu é
 * o rosa profundo da marca e o chão é o creme que vira a folha de conteúdo, de
 * modo que o cenário e o resto do app são a mesma peça, não um adesivo colado.
 */
export function Cenario({
  nivel,
  humor,
  children,
}: {
  nivel: BrotoNivel;
  humor: BrotoHumor;
  /** Cabeçalho (saudação + contadores) desenhado sobre o céu. */
  children: React.ReactNode;
}) {
  return (
    <div className="relative -mx-5 -mt-safe overflow-hidden bg-rose-dark px-5 pt-safe">
      {/* Colinas — dois arcos só, sem textura nem gradiente arco-íris.
          A elipse creme é a MESMA cor da folha de conteúdo logo abaixo: é o
          que faz o cenário e o resto do app lerem como uma peça só em vez de
          um banner colado no topo. */}
      <svg
        viewBox="0 0 390 190"
        preserveAspectRatio="none"
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[190px] w-full"
      >
        <ellipse cx="80" cy="196" rx="215" ry="96" fill="var(--color-rose-deep)" />
        <ellipse
          cx="330"
          cy="198"
          rx="195"
          ry="80"
          fill="var(--color-rose)"
          opacity="0.5"
        />
        <ellipse cx="195" cy="238" rx="320" ry="118" fill="var(--color-cream)" />
      </svg>

      <div className="relative pt-3">
        {children}
        {/* O Broto encosta o vaso na linha do horizonte creme: personagem
            flutuando no meio do céu foi a primeira tentativa e lia como
            adesivo. O -mb puxa a folha de conteúdo pra logo abaixo dos pés. */}
        <div className="-mb-2 mt-1 flex justify-center">
          <Broto nivel={nivel} humor={humor} size={208} />
        </div>
      </div>
    </div>
  );
}
