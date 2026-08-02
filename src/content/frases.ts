/**
 * Frases do dia — o motor do "efeito manada" (Seção 7 do PLANO).
 *
 * O que faz o I am ter 12,5 milhões de downloads não é a frase: é a frase
 * virar imagem bonita que a pessoa posta, com a marca junto. Por isso cada
 * frase aqui é escrita para caber em um card quadrado e fazer sentido fora do
 * app — quem vê no Stories não tem contexto nenhum.
 *
 * O que a gente NÃO copia do I am: afirmação genérica de autoajuda. Toda frase
 * daqui fala do corpo dela, não do universo.
 */

export type MomentoFrase =
  | "manha"
  | "tpm"
  | "diaDificil"
  | "vitoria"
  | "recaida";

export interface Frase {
  texto: string;
  momento: MomentoFrase;
}

export const FRASES: Frase[] = [
  // manhã — o momento de maior abertura do app
  { momento: "manha", texto: "Hoje eu como para desinflamar, não para caber." },
  { momento: "manha", texto: "Meu corpo não é um problema a resolver." },
  { momento: "manha", texto: "Barriga leve começa antes do almoço." },
  { momento: "manha", texto: "Eu escuto o que meu intestino diz." },
  { momento: "manha", texto: "Um dia de cada vez é o plano inteiro." },

  // TPM — normaliza a oscilação hormonal em vez de tratar como recaída
  { momento: "tpm", texto: "Inchaço de TPM não é recaída. É hormônio, e passa." },
  { momento: "tpm", texto: "Meu corpo muda com o mês. Eu também posso." },
  { momento: "tpm", texto: "Hoje eu sou mais gentil comigo do que ontem." },

  // dia difícil
  { momento: "diaDificil", texto: "Progresso não é linha reta. É teimosia." },
  { momento: "diaDificil", texto: "O que eu fiz hoje conta, mesmo pouco." },
  { momento: "diaDificil", texto: "Não desisti. Isso já é bastante." },
  { momento: "diaDificil", texto: "Meu corpo está trabalhando, mesmo quando eu não vejo." },

  // vitória
  { momento: "vitoria", texto: "Eu descobri o que me incha. Ninguém tira isso de mim." },
  { momento: "vitoria", texto: "Hoje minha barriga está do meu lado." },
  { momento: "vitoria", texto: "Eu fiz. E dá pra fazer de novo amanhã." },

  // recaída — a frase mais importante do conjunto
  { momento: "recaida", texto: "Comer com prazer estava no meu plano." },
  { momento: "recaida", texto: "Um dia fora não apaga catorze dentro." },
  { momento: "recaida", texto: "Eu recomeço quantas vezes for preciso." },
];

/**
 * Escolhe a frase do dia. Determinística pela semente (dia da jornada), para
 * não trocar a cada re-render — frase que pisca não é frase, é banner.
 */
export function fraseDoDia(momento: MomentoFrase, semente: number): Frase {
  const doMomento = FRASES.filter((f) => f.momento === momento);
  const lista = doMomento.length ? doMomento : FRASES;
  return lista[Math.abs(semente) % lista.length];
}

/** Momento do dia a partir do contexto — a frase certa na hora certa. */
export function momentoAtual(opts: {
  tpm: boolean;
  diaFechado: boolean;
  acoesHoje: number;
  resgatouPrazerOntem: boolean;
}): MomentoFrase {
  if (opts.resgatouPrazerOntem) return "recaida";
  if (opts.diaFechado) return "vitoria";
  if (opts.tpm) return "tpm";
  if (opts.acoesHoje === 0) return "diaDificil";
  return "manha";
}
