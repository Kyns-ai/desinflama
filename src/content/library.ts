/**
 * Biblioteca de aulas da nutri (por tema). Vídeo placeholder + texto/transcrição.
 * Conteúdo real, fundamentado; a validação com fontes e a expansão (8–12 aulas)
 * são consolidadas na Fase 11 (SOURCES.md).
 */

export interface Lesson {
  id: string;
  tema: string;
  title: string;
  durationLabel: string;
  emoji: string;
  /** Parágrafos curtos (2–3 frases) — nada de parede de texto. */
  body: string[];
}

export const LESSONS: Lesson[] = [
  {
    id: "fodmap-explicado",
    tema: "Fundamentos",
    title: "FODMAP: a palavra estranha que explica seu inchaço",
    durationLabel: "Leitura de 2 min",
    emoji: "🔤",
    body: [
      "FODMAP é a sigla pra um grupo de carboidratos que o intestino absorve mal: oligossacarídeos (frutanos e GOS, do trigo, cebola, alho e feijão), dissacarídeos (lactose, do leite), monossacarídeos (frutose, de algumas frutas e do mel) e polióis (de adoçantes e frutas como maçã e pera).",
      "Quando chegam ao intestino sem serem absorvidos, eles puxam água e viram comida pras bactérias, que produzem gás. Resultado: barriga estufada.",
      "A boa notícia? Não é pra cortar tudo pra sempre — é identificar quais te afetam.",
    ],
  },
  {
    id: "detox-mito",
    tema: "Fundamentos",
    title: "Por que “detox” não resolve seu inchaço",
    durationLabel: "Leitura de 2 min",
    emoji: "🧃",
    body: [
      "Sucos detox prometem limpar o corpo, mas seu fígado e seus rins já fazem isso 24h por dia.",
      "Pior: muito suco detox junta maçã (frutose) e folhas (frutanos) batidas, sem a fibra mastigada que ajuda a tolerar — ou seja, podem INCHAR mais.",
      "O que realmente desinflama não é uma poção mágica, é tirar os fermentadores certos, hidratar e mover o intestino. Menos marketing, mais fisiologia.",
    ],
  },
  {
    id: "sibo-inchaco",
    tema: "Ciência",
    title: "SIBO: quando há bactéria demais no lugar errado",
    durationLabel: "Leitura de 3 min",
    emoji: "🦠",
    body: [
      "SIBO é o supercrescimento de bactérias no intestino delgado, onde deveria haver poucas.",
      "Essas bactérias fermentam o que você come cedo demais no processo, gerando muito gás logo após as refeições — aquele inchaço que cresce ao longo do dia.",
      "Reduzir os FODMAPs por um tempo “tira o combustível” desse excesso e alivia os sintomas.",
      "Se o inchaço for muito intenso e persistente, vale investigar SIBO com um profissional — este programa acalma, mas não substitui avaliação médica.",
    ],
  },
  {
    id: "intestino-pele",
    tema: "Ciência",
    title: "O eixo intestino-pele: por que sua pele melhora junto",
    durationLabel: "Leitura de 2 min",
    emoji: "✨",
    body: [
      "Intestino e pele conversam. Quando o intestino está inflamado e fermentando, ele libera sinais inflamatórios que circulam pelo corpo e aparecem na pele: oleosidade, opacidade, vermelhidão, espinhas.",
      "Ao acalmar o intestino — reduzindo a fermentação e reforçando a barreira intestinal — você diminui essa inflamação de baixo grau, e a pele responde.",
      "Muita gente nota a pele mais viva nas primeiras semanas — cada pele no seu ritmo.",
    ],
  },
  {
    id: "intestino-cerebro",
    tema: "Ciência",
    title: "Eixo intestino-cérebro: energia e névoa mental",
    durationLabel: "Leitura de 2 min",
    emoji: "🧠",
    body: [
      "Seu intestino tem centenas de milhões de neurônios próprios — mais que a medula espinhal — e por isso é chamado de “segundo cérebro”. Os dois trocam mensagens o tempo todo pelo nervo vago.",
      "Quando o intestino está irritado, isso afeta o humor, o sono e aquela sensação de cansaço e névoa mental. Funciona nos dois sentidos: estresse piora a digestão, e digestão ruim piora o ânimo.",
      "Cuidar do intestino costuma trazer, de brinde, mais clareza e energia.",
    ],
  },
  {
    id: "reintroducao-como",
    tema: "Método",
    title: "Como reintroduzir sem perder o controle",
    durationLabel: "Leitura de 3 min",
    emoji: "🔬",
    body: [
      "Depois de acalmar, a reintrodução é o que te devolve a liberdade.",
      "A regra de ouro: teste UM grupo FODMAP por vez, em porção pequena, e observe por algumas horas a até 1 dia. Não teste dois grupos no mesmo dia — senão você não sabe quem foi o culpado.",
      "Anote a intensidade da reação. No fim, você tem uma lista pessoal do que pode comer à vontade, do que comer com moderação e do que evitar.",
      "Esse mapa é seu pra sempre.",
    ],
  },
  {
    id: "prebiotico-probiotico",
    tema: "Método",
    title: "Prebióticos, probióticos e fermentados sem inchar",
    durationLabel: "Leitura de 2 min",
    emoji: "🫧",
    body: [
      "Probióticos são bactérias boas (iogurte, kefir, chucrute); prebióticos são as fibras que as alimentam. As duas coisas ajudam o intestino — mas, saindo de uma fase low FODMAP, o segredo é introduzir aos poucos.",
      "Comece com porções pequenas de fermentados leves e fibras suaves (aveia, banana).",
      "Reequilibrar a microbiota é uma construção, não um choque. Exagerar de uma vez pode estufar de novo.",
    ],
  },
  {
    id: "agua-retencao",
    tema: "Hábitos",
    title: "Beber água combate (sim!) a retenção",
    durationLabel: "Leitura de 2 min",
    emoji: "💧",
    body: [
      "Hidratar pouco pode favorecer a retenção e deixa o intestino mais lento — e fibra sem água prende.",
      "Quando você hidrata bem e equilibra o sódio (menos ultraprocessado), o corpo solta o excesso e a sensação de peso some. Água também ajuda o intestino a se mover, reduzindo a fermentação.",
      "Meta simples: deixe uma garrafa à vista e vá bebendo ao longo do dia.",
    ],
  },
];

export function lessonsByTheme(): Record<string, Lesson[]> {
  return LESSONS.reduce(
    (acc, l) => {
      (acc[l.tema] ??= []).push(l);
      return acc;
    },
    {} as Record<string, Lesson[]>
  );
}
