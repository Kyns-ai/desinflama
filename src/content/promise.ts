/**
 * A PROMESSA — fonte única de verdade.
 *
 * Landing, onboarding e paywall leem daqui. Promessa copiada em três telas
 * desencontra na primeira revisão, e promessa desencontrada é o que gera
 * pedido de reembolso ("não era isso que estava escrito lá").
 *
 * >>> DECISÃO DO RUYTER, NÃO DO CÓDIGO <<<
 * Quais benefícios entram na venda e como a frase é escrita no funil são dele.
 * O texto abaixo é o da Seção 0 do docs/PLANO.md; mexer aqui é mexer no que a
 * cliente compra. NADA daqui vai para loja/anúncio sem ele aprovar.
 *
 * A estrutura é a da ZOE ("Eat for gut health, not just calories" + "Feel
 * healthier. In weeks."): promessa grande sustentada por frase honesta.
 */

/** A frase de capa. Curta o bastante para caber em duas linhas no celular. */
export const PROMESSA_TITULO = "Coma para desinflamar,\nnão para contar caloria.";

/**
 * O que vem logo abaixo — é aqui que o multi-benefício aparece.
 *
 * 21 dias, não 14 (decisão do Ruyter em 03/08/2026: "14 é muito pouco").
 * É honesto e é o arco real do produto: os 14 dias mapeiam os gatilhos, e o
 * Reset de 21 é onde a rotina se monta. Prometer transformação em 14 seria
 * prometer no meio do caminho.
 */
export const PROMESSA_SUBTITULO =
  "Em 21 dias você monta uma rotina que não te incha. Na 2ª semana já sabe o que incha VOCÊ — e junto vêm energia, sono e pele.";

/**
 * O ENQUADRAMENTO DO PROBLEMA — vem antes de qualquer venda.
 *
 * Padrão medido nos funis grandes de saúde: o Homemade Method ancora o ganho
 * de peso em "GLP-1 e hormônios" ANTES de falar do produto. O efeito é tirar a
 * culpa: enquanto a mulher achar que o problema é falta de força de vontade,
 * ela compra achando que vai falhar de novo — e devolve.
 *
 * O nosso equivalente é o mais forte que existe neste nicho, porque é
 * literalmente verdade e ninguém diz: inchaço não é gordura, é GÁS. Muda o que
 * ela pensa que está comprando.
 */
export const PROBLEMA_TITULO = "Não é o quanto você come.";
export const PROBLEMA_CORPO =
  "Inchaço quase nunca é gordura — é gás. Certos carboidratos chegam ao intestino sem serem digeridos, viram comida para as bactérias e estufam a barriga. Por isso comer menos não resolve, e por isso não é falta de força de vontade.";

/**
 * Ordem dos benefícios: força da evidência DECRESCENTE.
 * Inchaço é o mais sustentado; pele é o mais fraco e por isso entra por
 * último, com o texto mais contido. Reordenar isto é enfraquecer a promessa
 * onde ela é forte e inflá-la onde ela é frágil.
 */
export const BENEFICIOS = [
  { chave: "inchaco", titulo: "Menos inchaço", detalhe: "o primeiro a ceder" },
  { chave: "energia", titulo: "Mais energia", detalhe: "sem o peso da digestão" },
  { chave: "sono", titulo: "Sono melhor", detalhe: "noite sem desconforto" },
  { chave: "humor", titulo: "Humor mais estável", detalhe: "eixo intestino-cérebro" },
  { chave: "pele", titulo: "Pele mais calma", detalhe: "para algumas pessoas" },
] as const;

/**
 * Projeção datada — o que acontece quando.
 *
 * Cada linha é um marco do MÉTODO, não uma promessa de resultado: 72h é o
 * tempo de a fermentação ceder, 14 é quando a reintrodução termina, 21 é o
 * fim do Reset. Datas que a gente controla, não que a gente torce.
 */
export const PROJECTION = [
  { when: "72h", dayOffset: 3, label: "fermentação acalmando" },
  { when: "7 dias", dayOffset: 7, label: "1ª vitória visível" },
  { when: "14 dias", dayOffset: 14, label: "seus gatilhos mapeados" },
  { when: "21 dias", dayOffset: 21, label: "sua rotina montada" },
] as const;

export const PROJECTION_NOTE =
  "Cada corpo tem um ritmo. A maioria sente diferença na 1ª semana — e o app te mostra o SEU ritmo, com seus dados.";

/**
 * A frase honesta que anda junto da promessa grande.
 * Resultado sempre como RELATO, nunca como garantia — é o que mantém a
 * promessa longe de "tratamento" (CFN/ANVISA) e o que sustenta a confiança
 * quando o corpo dela demora mais que a média.
 */
export const PROMESSA_HONESTA =
  "Mulheres que fizeram o programa relatam barriga mais leve e mais disposição. Não é tratamento, não é garantia — é um método para você descobrir o seu padrão.";
