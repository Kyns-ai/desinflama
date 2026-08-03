/**
 * O cardápio DELA — receitas ordenadas pelo que ela gosta e pelo que o corpo
 * dela tolera.
 *
 * Por que isto existe (e não só o cardápio fixo por fase):
 * o padrão está em todos os funis grandes de saúde — o Homemade Method faz a
 * pessoa tocar "gosto / não é pra mim" em alimentos ANTES de mostrar preço,
 * porque plano montado com comida que ela já come é plano que ela segue, e
 * plano genérico é o que ela abandona na terça-feira. É a mesma lógica do
 * Mapa de Tolerância aplicada ao prazer, não ao sintoma.
 *
 * A ordem de prioridade é deliberada:
 *   1. NUNCA sugerir o que ela marcou que não come (isso é respeito, não algoritmo);
 *   2. evitar o que o Mapa de Tolerância já mostrou que a incha;
 *   3. entre as que sobram, preferir as que têm mais coisa que ela gosta.
 *
 * Determinístico: a mesma semana com as mesmas preferências dá sempre o mesmo
 * cardápio. Cardápio que muda sozinho a cada abertura destrói a lista de
 * compras — ela compra na segunda o que o app esquece na quarta.
 */

import { RECIPES, type Recipe } from "@/content/recipes";
import { CATALOGO } from "@/content/catalogoPrato";
import { fatorDeReacao } from "@/lib/notaPrato";
import { phaseForDay } from "@/lib/journey";
import type { JourneyPhase, ReintroGroup, ToleranceResult } from "@/types/domain";

export interface PreferenciasComida {
  gosta: string[];
  evita: string[];
}

export interface ContextoCardapio {
  preferencias: PreferenciasComida;
  tolerancia: ToleranceResult[];
}

const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

/** Um dia do cardápio pessoal. */
export interface DiaDoCardapio {
  dia: number;
  diaSemana: string;
  fase: JourneyPhase;
  cafe: Recipe | null;
  almoco: Recipe | null;
  jantar: Recipe | null;
}

/* --------------------------- casar receita × gosto --------------------------- */

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** A receita menciona este alimento (em qualquer ingrediente)? */
function receitaTem(receita: Recipe, alimento: string): boolean {
  const alvo = normalizar(alimento).split(/[\s/(]/)[0]; // "Queijo fresco / ricota" -> "queijo"
  if (alvo.length < 3) return false;
  return receita.ingredientes.some((i) => normalizar(i).includes(alvo));
}

/** Grupos FODMAP que a receita provavelmente carrega, via catálogo. */
function gruposDaReceita(receita: Recipe): ReintroGroup[] {
  const grupos = new Set<ReintroGroup>();
  for (const a of CATALOGO) {
    if (a.grupo && receitaTem(receita, a.nome)) grupos.add(a.grupo);
  }
  return [...grupos];
}

/**
 * Nota de adequação da receita para ELA. Quanto maior, mais acima ela aparece.
 * `-Infinity` significa "não oferecer" — é o que ela disse que não come.
 */
export function pontuarReceita(receita: Recipe, ctx: ContextoCardapio): number {
  // 1. o que ela não come não entra. Sem exceção, sem "mas é saudável".
  if (ctx.preferencias.evita.some((a) => receitaTem(receita, a))) {
    return -Infinity;
  }

  let pontos = 0;

  // 2. o que já se sabe que incha ELA pesa contra (mas não elimina: porção
  //    pequena de um moderado continua sendo escolha dela)
  for (const grupo of gruposDaReceita(receita)) {
    pontos -= fatorDeReacao(grupo, ctx.tolerancia) * 10;
  }

  // 3. o que ela gosta puxa pra cima
  for (const a of ctx.preferencias.gosta) {
    if (receitaTem(receita, a)) pontos += 6;
  }

  return pontos;
}

/* ------------------------------ montar a semana ------------------------------ */

/**
 * Desempate estável: sem isto, receitas empatadas trocariam de posição a cada
 * render (a ordem de `sort` não é garantida para iguais) e o cardápio pareceria
 * mudar sozinho.
 */
function ordenar(receitas: Recipe[], ctx: ContextoCardapio): Recipe[] {
  return receitas
    .map((r) => ({ r, p: pontuarReceita(r, ctx) }))
    .filter((x) => x.p > -Infinity)
    .sort((a, b) => b.p - a.p || a.r.id.localeCompare(b.r.id))
    .map((x) => x.r);
}

function escolher(
  candidatas: Recipe[],
  indice: number,
  usadas: Set<string>
): Recipe | null {
  if (!candidatas.length) return null;
  // Varre a partir do índice do dia para variar ao longo da semana, mas evita
  // repetir a mesma receita duas vezes antes de esgotar as opções.
  for (let i = 0; i < candidatas.length; i++) {
    const c = candidatas[(indice + i) % candidatas.length];
    if (!usadas.has(c.id)) {
      usadas.add(c.id);
      return c;
    }
  }
  return candidatas[indice % candidatas.length];
}

export function cardapioDaSemana(
  semana: number,
  ctx: ContextoCardapio
): DiaDoCardapio[] {
  const primeiroDia = (semana - 1) * 7 + 1;
  const usadas = { cafe: new Set<string>(), almoco: new Set<string>(), jantar: new Set<string>() };

  return Array.from({ length: 7 }, (_, i) => {
    const dia = primeiroDia + i;
    const fase = phaseForDay(dia, "reset21").phase;

    // A fase manda no que pode entrar; a preferência manda na ordem.
    const daFase = (tipo: Recipe["tipo"]) => {
      const naFase = RECIPES.filter((r) => r.tipo === tipo && r.phase === fase);
      const base = naFase.length ? naFase : RECIPES.filter((r) => r.tipo === tipo);
      return ordenar(base, ctx);
    };

    return {
      dia,
      diaSemana: DIAS_SEMANA[i],
      fase,
      cafe: escolher(daFase("Café"), i, usadas.cafe),
      almoco: escolher(daFase("Almoço"), i, usadas.almoco),
      jantar: escolher(daFase("Jantar"), i, usadas.jantar),
    };
  });
}

/**
 * Alternativas para o botão "trocar" — mesmo tipo e mesma fase, ordenadas
 * pelo gosto dela. Trocar é o que impede o cardápio de virar imposição.
 */
export function alternativasPara(
  receita: Recipe,
  ctx: ContextoCardapio,
  quantas = 4
): Recipe[] {
  const mesmasCondicoes = RECIPES.filter(
    (r) => r.tipo === receita.tipo && r.id !== receita.id
  );
  return ordenar(mesmasCondicoes, ctx).slice(0, quantas);
}

/** Alimentos oferecidos nos toques de "gosto / não é pra mim". */
export function alimentosParaEscolher(): string[] {
  // Só o que aparece de fato nas receitas: perguntar sobre comida que o app
  // nunca vai sugerir é fazer a pessoa trabalhar de graça.
  return CATALOGO.filter((a) => RECIPES.some((r) => receitaTem(r, a.nome))).map(
    (a) => a.nome
  );
}
