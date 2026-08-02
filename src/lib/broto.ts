/**
 * O Broto — o personagem que mora na Hoje.
 *
 * Copiado do Finch no que importa (Seção 4 do PLANO): um bichinho que reage ao
 * cuidado de hoje e NUNCA pune. A pesquisa de gamificação é dura nisso — punição
 * visível vira ansiedade e a pessoa abandona o app. O Finch, maior do mundo na
 * categoria, não pune ninguém. O nosso, no pior dia, fica desanimado.
 *
 * Duas escalas independentes, de propósito:
 *  - NÍVEL vem das sementes acumuladas na vida (`seedsLifetime`) e nunca cai,
 *    nem quando ela gasta sementes na loja de Prazeres. Perder o bichinho por
 *    ter se dado um brigadeiro seria punir exatamente o comportamento que a
 *    gente quer normalizar.
 *  - HUMOR vem só do cuidado de HOJE, e volta ao normal amanhã.
 */

export type BrotoNivel = "semente" | "broto" | "planta" | "florada";
export type BrotoHumor = "desanimado" | "neutro" | "animado" | "comemorando";

export interface NivelDef {
  id: BrotoNivel;
  nome: string;
  /** Sementes acumuladas na vida para ALCANÇAR este nível. */
  limiar: number;
  /** O que a chegada neste nível abre. */
  abre?: string;
}

export const NIVEIS: NivelDef[] = [
  { id: "semente", nome: "Semente", limiar: 0 },
  { id: "broto", nome: "Broto", limiar: 120, abre: "Receitas da nutri" },
  {
    id: "planta",
    nome: "Planta",
    limiar: 400,
    abre: "Cardápio + lista de compras",
  },
  { id: "florada", nome: "Florada", limiar: 900, abre: "Comer fora sem inchar" },
];

export interface EstadoBroto {
  nivel: NivelDef;
  proximo: NivelDef | null;
  /** 0–1 até o próximo nível. */
  progresso: number;
  /** Sementes que faltam para o próximo nível. */
  faltam: number;
  humor: BrotoHumor;
}

export function nivelPara(seedsLifetime: number): NivelDef {
  let atual = NIVEIS[0];
  for (const n of NIVEIS) if (seedsLifetime >= n.limiar) atual = n;
  return atual;
}

/**
 * Humor do dia a partir de quantas ações de cuidado ela fez hoje.
 * Fechar o dia é o único gatilho de comemoração — o resto é gradiente.
 */
export function humorPara(
  acoesHoje: number,
  diaFechado: boolean
): BrotoHumor {
  if (diaFechado) return "comemorando";
  if (acoesHoje >= 3) return "animado";
  if (acoesHoje >= 1) return "neutro";
  return "desanimado";
}

export function estadoBroto(
  seedsLifetime: number,
  acoesHoje: number,
  diaFechado: boolean
): EstadoBroto {
  const nivel = nivelPara(seedsLifetime);
  const idx = NIVEIS.findIndex((n) => n.id === nivel.id);
  const proximo = NIVEIS[idx + 1] ?? null;

  if (!proximo) {
    return {
      nivel,
      proximo: null,
      progresso: 1,
      faltam: 0,
      humor: humorPara(acoesHoje, diaFechado),
    };
  }

  const vao = proximo.limiar - nivel.limiar;
  const dentro = seedsLifetime - nivel.limiar;
  return {
    nivel,
    proximo,
    progresso: Math.max(0, Math.min(1, dentro / vao)),
    faltam: Math.max(0, proximo.limiar - seedsLifetime),
    humor: humorPara(acoesHoje, diaFechado),
  };
}

/** Subiu de nível ao ir de `antes` para `depois` sementes acumuladas? */
export function subiuDeNivel(antes: number, depois: number): NivelDef | null {
  const a = NIVEIS.findIndex((n) => n.id === nivelPara(antes).id);
  const b = NIVEIS.findIndex((n) => n.id === nivelPara(depois).id);
  return b > a ? NIVEIS[b] : null;
}
