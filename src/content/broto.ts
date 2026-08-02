/**
 * A fala do Broto — uma frase curta por dia, do conteúdo local.
 *
 * De propósito SEM IA: é a frase que aparece toda vez que ela abre o app, e
 * pagar token por ela seria pagar o custo mais alto do produto pelo texto mais
 * barato. Determinística pelo dia, então não muda a cada re-render (frase que
 * pisca a cada toque destrói a sensação de "alguém está aqui comigo").
 *
 * Regra de tom: o Broto nunca cobra e nunca culpa. No pior dia ele sente
 * falta; ele não repreende.
 */
import type { BrotoHumor } from "@/lib/broto";

const FALAS: Record<BrotoHumor, string[]> = {
  desanimado: [
    "Senti sua falta hoje. Começa por uma coisinha só.",
    "Tá tudo bem ir devagar. Eu espero.",
    "Um copo de água já conta. Sério.",
    "Dia difícil também faz parte. Bora do jeito que der.",
    "Não precisa fazer tudo. Faz uma.",
  ],
  neutro: [
    "Começou. Isso já é o mais difícil.",
    "Tá indo bem. Falta pouco pro dia fechar.",
    "Gostei de te ver por aqui hoje.",
    "Cada marcação dessas o seu intestino sente.",
    "Passo a passo é assim mesmo.",
  ],
  animado: [
    "Olha só você hoje. Tô orgulhoso.",
    "Esse é o ritmo que desinflama.",
    "Você cuidou de mim e de você. Dois em um.",
    "Dias assim são os que mudam o mês.",
    "Sente essa leveza? É trabalho seu.",
  ],
  comemorando: [
    "Dia fechado. A gente conseguiu.",
    "É isso. Mais um dia que o seu corpo agradece.",
    "Fechou! Amanhã a gente continua.",
    "Que dia bom. Descansa que você merece.",
    "Você foi inteira hoje. Guarda essa.",
  ],
};

/**
 * Frase do dia. `semente` é o dia da jornada (ou qualquer inteiro estável no
 * dia) — usar a data crua faria a frase mudar à meia-noite no meio de uma
 * sessão de uso.
 */
export function falaDoBroto(humor: BrotoHumor, semente: number): string {
  const lista = FALAS[humor];
  return lista[Math.abs(semente) % lista.length];
}
