/**
 * A Nota Desinflama — 0 a 100 para a foto de um prato.
 *
 * Regra da Seção 6 do PLANO. A divisão de trabalho é o ponto:
 *  - a IA faz só o que IA faz bem: OLHAR a foto e dizer quais alimentos estão
 *    ali e a que grupo FODMAP cada um pertence;
 *  - a NOTA é calculada aqui, no aparelho, por regra determinística.
 *
 * Por que não deixar a IA dar a nota (que seria uma linha de prompt):
 *  1. a mesma foto tem que dar sempre a mesma nota — modelo não garante isso;
 *  2. dá pra explicar de onde cada ponto saiu (`porques`), e explicação é o
 *     que sustenta a confiança quando a nota contraria a intuição dela;
 *  3. não se paga token para calcular;
 *  4. e o principal: a nota é DELA, não do alimento. A ZOE pontua o prato; a
 *     gente pontua o prato PARA ESTE CORPO — a mesma lasanha muda de nota
 *     conforme o Mapa de Tolerância dela evolui.
 */

import type {
  BloatType,
  ItemPrato,
  MarcadorPrato,
  ReintroGroup,
  ToleranceResult,
} from "@/types/domain";

/* ------------------------------ entrada ------------------------------ */

// Apelidos locais para o vocabulário do domínio. O tipo é UM só: se a forma
// do item divergisse entre o que se persiste e o que se pontua, a nota
// gravada e a nota recalculada poderiam discordar em silêncio.
export type MarcadorItem = MarcadorPrato;
export type ItemDoPrato = ItemPrato;

export interface ContextoDaNota {
  /** Testes de reintrodução já feitos — é o que personaliza a nota. */
  tolerancia: ToleranceResult[];
  /** Perfil de inchaço do onboarding. */
  perfil: BloatType | null;
  /** O prato tem alguma fonte de fibra? Usado só no perfil "lentidao". */
  temFibra?: boolean;
}

/* ------------------------------ pesos ------------------------------ */

/**
 * Peso base de cada grupo, em pontos da nota.
 * A ordem vem da frequência com que cada grupo aparece como gatilho na
 * literatura low-FODMAP: frutano é o campeão, frutose isolada é o mais raro.
 */
const PESO_GRUPO: Record<ReintroGroup, number> = {
  frutanos: 22,
  gos: 20,
  lactose: 18,
  polioles: 16,
  frutose: 14,
};

/** Peso base dos marcadores não-FODMAP. */
const PESO_MARCADOR: Record<MarcadorItem, number> = {
  ultraprocessado: 12,
  sodioAlto: 10,
  fritura: 10,
  gorduraPesada: 8,
  cafeina: 8,
};

/**
 * Sensibilidade dela ao grupo, a partir do Mapa de Tolerância.
 * "Não testado" fica em 0,5 de propósito: sem dado, a nota não pode nem
 * assustar (1,0) nem tranquilizar (0,15) — ela fica no meio e vai ficando
 * mais precisa conforme os testes acontecem.
 */
const FATOR_REACAO: Record<number, number> = {
  3: 1.0, // reagiu forte
  2: 0.6, // moderou
  1: 0.35, // reação leve
  0: 0.15, // tolerou bem
};
const FATOR_NAO_TESTADO = 0.5;

/**
 * Ajuste por perfil de inchaço. Cada perfil sente coisas diferentes:
 * quem fermenta sofre com frutano/GOS; quem retém sofre com sódio e
 * ultraprocessado; quem tem trânsito lento sofre com falta de fibra; e quem
 * incha por estresse sente cafeína.
 */
const AJUSTE_PERFIL: Record<
  BloatType,
  { grupos: Partial<Record<ReintroGroup, number>>; marcadores: Partial<Record<MarcadorItem, number>>; padraoGrupo: number }
> = {
  fermentacao: {
    padraoGrupo: 1,
    grupos: { frutanos: 1.3, gos: 1.3 },
    marcadores: {},
  },
  retencao: {
    padraoGrupo: 0.85,
    grupos: {},
    marcadores: { sodioAlto: 1.4, ultraprocessado: 1.4 },
  },
  lentidao: {
    padraoGrupo: 0.9,
    grupos: {},
    marcadores: { gorduraPesada: 1.2, fritura: 1.2 },
  },
  estresse: {
    padraoGrupo: 0.9,
    grupos: {},
    marcadores: { cafeina: 1.4 },
  },
};

/* ------------------------------ saída ------------------------------ */

export type FaixaNota = "cai-bem" | "depende" | "incha";

export interface Porque {
  /** O que tirou ponto (nome do alimento ou do marcador). */
  causa: string;
  /** Quantos pontos saíram, já arredondado. */
  pontos: number;
  /** Explicação curta, em português de gente. */
  motivo: string;
}

export interface NotaPrato {
  nota: number;
  faixa: FaixaNota;
  /** Palavra do veredito, no esqueleto da ZOE. */
  veredito: string;
  /** De onde cada ponto saiu, do maior para o menor. */
  porques: Porque[];
}

export const FAIXAS: Record<FaixaNota, { veredito: string; minimo: number }> = {
  "cai-bem": { veredito: "Cai bem pra você", minimo: 80 },
  depende: { veredito: "Depende da porção", minimo: 50 },
  incha: { veredito: "Esse costuma te inchar", minimo: 0 },
};

export function faixaDe(nota: number): FaixaNota {
  if (nota >= FAIXAS["cai-bem"].minimo) return "cai-bem";
  if (nota >= FAIXAS.depende.minimo) return "depende";
  return "incha";
}

/* ------------------------------ cálculo ------------------------------ */

/** Sensibilidade dela a um grupo — o teste MAIS RECENTE é o que vale. */
export function fatorDeReacao(
  grupo: ReintroGroup,
  tolerancia: ToleranceResult[]
): number {
  const doGrupo = tolerancia
    .filter((t) => t.group === grupo)
    .sort((a, b) => a.dateTested.localeCompare(b.dateTested));
  const ultimo = doGrupo.at(-1);
  if (!ultimo) return FATOR_NAO_TESTADO;
  return FATOR_REACAO[ultimo.reaction] ?? FATOR_NAO_TESTADO;
}

const NOME_GRUPO: Record<ReintroGroup, string> = {
  lactose: "lactose",
  frutose: "frutose",
  frutanos: "frutanos (trigo, cebola, alho)",
  gos: "leguminosas (GOS)",
  polioles: "polióis",
};

const MOTIVO_MARCADOR: Record<MarcadorItem, string> = {
  ultraprocessado: "ultraprocessado — costuma vir com aditivo e sódio",
  sodioAlto: "muito sódio — puxa retenção de líquido",
  cafeina: "cafeína — acelera o intestino de quem é sensível",
  gorduraPesada: "gordura pesada — atrasa o esvaziamento do estômago",
  fritura: "fritura — atrasa a digestão",
};

export function calcularNota(
  itens: ItemDoPrato[],
  ctx: ContextoDaNota
): NotaPrato {
  const ajuste = ctx.perfil ? AJUSTE_PERFIL[ctx.perfil] : null;
  const porques: Porque[] = [];
  let desconto = 0;

  for (const item of itens) {
    if (item.grupo) {
      const peso = PESO_GRUPO[item.grupo];
      const fator = fatorDeReacao(item.grupo, ctx.tolerancia);
      const mult =
        ajuste?.grupos[item.grupo] ?? ajuste?.padraoGrupo ?? 1;
      const pontos = peso * fator * mult;
      if (pontos > 0.5) {
        desconto += pontos;
        porques.push({
          causa: item.nome,
          pontos: Math.round(pontos),
          motivo: explicaGrupo(item.grupo, fator),
        });
      }
    }

    for (const marcador of item.marcadores ?? []) {
      const peso = PESO_MARCADOR[marcador];
      const mult = ajuste?.marcadores[marcador] ?? 1;
      const pontos = peso * mult;
      desconto += pontos;
      porques.push({
        causa: item.nome,
        pontos: Math.round(pontos),
        motivo: MOTIVO_MARCADOR[marcador],
      });
    }
  }

  // Trânsito lento é o único perfil em que a AUSÊNCIA de algo tira ponto:
  // prato sem fibra nenhuma é o que trava quem já é travada.
  if (ctx.perfil === "lentidao" && ctx.temFibra === false && itens.length > 0) {
    desconto += 10;
    porques.push({
      causa: "Sem fibra no prato",
      pontos: 10,
      motivo: "seu perfil é de trânsito lento — fibra é o que faz andar",
    });
  }

  // TETO DO GATILHO CONFIRMADO.
  //
  // Sem isto, um prato com um único item de um grupo que ela JÁ REAGIU FORTE
  // fechava em 82 e a tela dizia "Cai bem pra você". Isso é mentir sobre o
  // gatilho dela — e é justamente a coisa que o app existe pra não fazer.
  // Um gatilho confirmado no prato nunca pode passar de "Depende da porção".
  const temGatilhoConfirmado = itens.some(
    (i) => i.grupo && fatorDeReacao(i.grupo, ctx.tolerancia) >= 1
  );
  const teto = temGatilhoConfirmado ? FAIXAS["cai-bem"].minimo - 1 : 100;

  const nota = Math.max(0, Math.min(teto, Math.round(100 - desconto)));
  porques.sort((a, b) => b.pontos - a.pontos);
  const faixa = faixaDe(nota);

  return { nota, faixa, veredito: FAIXAS[faixa].veredito, porques };
}

function explicaGrupo(grupo: ReintroGroup, fator: number): string {
  const nome = NOME_GRUPO[grupo];
  if (fator >= 1) return `${nome} — você já reagiu forte a esse grupo`;
  if (fator >= 0.6) return `${nome} — você modera esse grupo`;
  if (fator <= 0.2) return `${nome} — mas você tolera bem esse grupo`;
  if (fator === FATOR_NAO_TESTADO) return `${nome} — você ainda não testou esse grupo`;
  return `${nome} — sua reação foi leve`;
}

/* --------------------------- normalização --------------------------- */

/**
 * A IA devolve o grupo em texto livre ("Frutanos", "FODMAP: GOS",
 * "leguminosas"). Isto traz para o vocabulário canônico — sem isso, um
 * "Frutano" no singular passaria despercebido e o prato ganharia nota alta
 * indevida, que é o pior erro possível aqui.
 */
export function normalizarGrupo(bruto: string | null | undefined): ReintroGroup | null {
  if (!bruto) return null;
  // ̀-ͯ é a faixa de acentos combinantes que o NFD separa da letra.
  // Escrito com escape de propósito: o caractere literal é invisível no editor
  // e some em copiar/colar — foi assim que "polióis" voltava null.
  const t = bruto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (/lactose|leite|laticinio/.test(t)) return "lactose";
  if (/frutano|trigo|cebola|alho/.test(t)) return "frutanos";
  if (/gos|leguminosa|feijao|grao|lentilha/.test(t)) return "gos";
  // `poli(ol|oi)` cobre singular e plural: sem acento, "polióis" vira
  // "poliois", que NÃO contém "poliol" — com só o singular, um prato com
  // adoçante diet passava batido e ganhava nota alta indevida.
  if (/poli(ol|oi)|sorbitol|xilitol|manitol/.test(t)) return "polioles";
  if (/frutose|mel/.test(t)) return "frutose";
  return null;
}
