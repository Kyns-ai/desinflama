/**
 * Sementes — a tabela de ganho por ação (Seção 5 do PLANO).
 *
 * Este arquivo era o "jardim": tinha níveis, recompensas e uma tela própria.
 * Tudo isso morreu por decisão do plano — o jardim virou O BROTO, que mora na
 * Hoje, e as recompensas viraram a loja de Prazeres. O que sobrou aqui é só a
 * tabela de ganho, que é a única coisa que continuou verdadeira.
 *
 * Motivo de ter apagado em vez de deixar quieto: os níveis daqui ainda diziam
 * 10/25/50 sementes enquanto o Broto usa 120/400/900. Dois sistemas de nível
 * no mesmo app é drift garantido — alguém ia ler o errado.
 *
 * Nível e progresso: `src/lib/broto.ts`.
 * Recompensas: `src/content/prazeres.ts`.
 */

/**
 * Sementes ganhas por ação.
 *
 * Os valores antigos (1, 1, 2, 3) vinham de uma época sem loja: serviam só
 * para subir de nível. Com os Prazeres, o número precisa ter PREÇO — a média
 * de quem faz tudo é ~65/dia, então uma taça de vinho (80) sai em pouco mais
 * de um dia bem feito e a pizza (200) exige três.
 */
export const SEEDS = {
  checkin: 10,
  lesson: 10,
  agua: 5,
  tarefa: 5,
  foto: 5,
  semGatilho: 15,
  calmaria: 5,
  completeDay: 20,
  /** Fechar a semana inteira (dias 7/14/21). */
  milestone: 50,
} as const;
