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

/** O que vem logo abaixo — é aqui que o multi-benefício aparece. */
export const PROMESSA_SUBTITULO =
  "Em 14 dias você descobre o que incha VOCÊ. E junto vêm energia, sono e pele.";

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

/** Projeção datada — o que acontece quando. */
export const PROJECTION = [
  { when: "72h", dayOffset: 3, label: "fermentação acalmando" },
  { when: "7 dias", dayOffset: 7, label: "1ª vitória visível" },
  { when: "14 dias", dayOffset: 14, label: "seus gatilhos mapeados" },
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
  "Mulheres que fizeram os 14 dias relatam barriga mais leve e mais disposição. Não é tratamento, não é garantia — é um método para você descobrir o seu padrão.";
