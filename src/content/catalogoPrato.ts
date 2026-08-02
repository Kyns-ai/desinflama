/**
 * Catálogo de alimentos para montar o prato à mão.
 *
 * Existe por dois motivos, um de produto e um de realidade:
 *  - PRODUTO: nem toda refeição vira foto. Comer fora, comer correndo, comer
 *    o que já estava no prato — a montagem manual mantém a Nota Desinflama
 *    viva nesses casos;
 *  - REALIDADE: a identificação por foto depende da `ANTHROPIC_API_KEY`. Sem
 *    a chave, a aba inteira ficaria morta. Com o catálogo, a nota funciona e
 *    é testável de ponta a ponta hoje.
 *
 * Base low-FODMAP (Monash), localizada para o Brasil. Ver content/SOURCES.md.
 */

import type { ItemPrato, MarcadorPrato, ReintroGroup } from "@/types/domain";

export interface AlimentoCatalogo {
  nome: string;
  grupo: ReintroGroup | null;
  marcadores?: MarcadorPrato[];
  /** Conta como fonte de fibra (usado no perfil de trânsito lento). */
  fibra?: boolean;
  /** Palavras extras para a busca encontrar. */
  busca?: string;
  /**
   * Troca ESPECÍFICA deste alimento. Sem ela, a sugestão cai na troca do
   * grupo — e a do grupo frutanos fala de cebola e alho, o que fica absurdo
   * num prato de pão. Troca genérica não muda o próximo prato de ninguém.
   */
  troca?: string;
}

export const CATALOGO: AlimentoCatalogo[] = [
  // ---------- bases que costumam cair bem ----------
  { nome: "Arroz branco", grupo: null },
  { nome: "Arroz integral", grupo: null, fibra: true },
  { nome: "Batata", grupo: null },
  { nome: "Batata-doce", grupo: null, fibra: true },
  { nome: "Mandioquinha", grupo: null, busca: "batata baroa salsa" },
  { nome: "Tapioca", grupo: null },
  { nome: "Polenta", grupo: null, busca: "fuba milho" },
  { nome: "Quinoa", grupo: null, fibra: true },
  { nome: "Aveia", grupo: null, fibra: true },

  // ---------- proteínas ----------
  { nome: "Frango", grupo: null },
  { nome: "Peixe", grupo: null },
  { nome: "Carne bovina", grupo: null },
  { nome: "Ovo", grupo: null },
  { nome: "Tofu firme", grupo: null },
  { nome: "Linguiça", grupo: null, marcadores: ["ultraprocessado", "sodioAlto", "gorduraPesada"] },
  { nome: "Presunto / peito de peru", grupo: null, marcadores: ["ultraprocessado", "sodioAlto"] },
  { nome: "Bacon", grupo: null, marcadores: ["ultraprocessado", "sodioAlto", "gorduraPesada"] },

  // ---------- legumes e verduras ----------
  { nome: "Cenoura", grupo: null, fibra: true },
  { nome: "Abobrinha", grupo: null, fibra: true },
  { nome: "Abóbora", grupo: null, fibra: true },
  { nome: "Vagem", grupo: null, fibra: true },
  { nome: "Alface", grupo: null, fibra: true },
  { nome: "Rúcula", grupo: null, fibra: true },
  { nome: "Espinafre", grupo: null, fibra: true },
  { nome: "Tomate", grupo: null, fibra: true },
  { nome: "Pepino", grupo: null, fibra: true },
  { nome: "Berinjela", grupo: null, fibra: true },
  { nome: "Brócolis", grupo: "frutanos", fibra: true },
  { nome: "Couve-flor", grupo: "polioles", fibra: true },
  { nome: "Cogumelo", grupo: "polioles", busca: "champignon shitake" },
  {
    nome: "Cebola",
    grupo: "frutanos",
    troca: "Doure a cebola no azeite e descarte: o sabor fica, o frutano (que não é solúvel em óleo) não vai junto.",
  },
  {
    nome: "Alho",
    grupo: "frutanos",
    troca: "Use azeite aromatizado com alho e descarte o dente: o frutano fica no alho, o sabor vai pro óleo.",
  },
  { nome: "Repolho", grupo: "frutanos", fibra: true },
  { nome: "Milho", grupo: "frutanos", fibra: true },

  // ---------- frutas ----------
  { nome: "Banana (não madura)", grupo: null, fibra: true },
  { nome: "Banana bem madura", grupo: "frutanos", fibra: true },
  { nome: "Mamão", grupo: null, fibra: true },
  { nome: "Morango", grupo: null, fibra: true },
  { nome: "Laranja", grupo: null, fibra: true },
  { nome: "Kiwi", grupo: null, fibra: true },
  { nome: "Abacaxi", grupo: null, fibra: true },
  {
    nome: "Maçã",
    grupo: "polioles",
    fibra: true,
    troca: "Troque maçã e pera por morango, mamão ou laranja — mesma fruta no café, sem poliol.",
  },
  { nome: "Pera", grupo: "polioles", fibra: true },
  { nome: "Manga", grupo: "frutose", fibra: true },
  { nome: "Melancia", grupo: "frutose", fibra: true },
  { nome: "Abacate", grupo: "polioles", fibra: true },
  { nome: "Uva-passa", grupo: "frutose", busca: "passas" },

  // ---------- trigo e derivados ----------
  {
    nome: "Pão de trigo",
    grupo: "frutanos",
    busca: "pao frances forma",
    troca: "Troque o pão de trigo por tapioca, pão sem glúten ou pão de fermentação natural bem fermentado.",
  },
  {
    nome: "Macarrão de trigo",
    grupo: "frutanos",
    busca: "massa espaguete",
    troca: "Troque a massa de trigo por massa de arroz ou de milho — o molho pode continuar igual.",
  },
  { nome: "Pizza", grupo: "frutanos", marcadores: ["ultraprocessado", "gorduraPesada"] },
  { nome: "Bolacha / biscoito", grupo: "frutanos", marcadores: ["ultraprocessado"] },
  { nome: "Pão sem glúten", grupo: null },

  // ---------- leite e derivados ----------
  {
    nome: "Leite de vaca",
    grupo: "lactose",
    troca: "Leite zero lactose é a mesma comida sem o açúcar que fermenta.",
  },
  {
    nome: "Iogurte comum",
    grupo: "lactose",
    troca: "Iogurte sem lactose ou kefir bem fermentado entregam o mesmo, sem o açúcar do leite.",
  },
  {
    nome: "Queijo fresco / ricota",
    grupo: "lactose",
    troca: "Queijo curado (parmesão, provolone) tem quase nada de lactose — o fresco é o que concentra.",
  },
  { nome: "Requeijão", grupo: "lactose", marcadores: ["ultraprocessado"] },
  { nome: "Sorvete", grupo: "lactose", marcadores: ["ultraprocessado"] },
  { nome: "Queijo curado (parmesão)", grupo: null },
  { nome: "Leite sem lactose", grupo: null },

  // ---------- leguminosas ----------
  {
    nome: "Feijão",
    grupo: "gos",
    fibra: true,
    troca: "Deixe de molho 12h, troque a água e cozinhe: some boa parte do GOS. Meia concha já muda o gás.",
  },
  { nome: "Grão-de-bico", grupo: "gos", fibra: true },
  { nome: "Lentilha", grupo: "gos", fibra: true },
  { nome: "Soja", grupo: "gos", fibra: true },

  // ---------- bebidas e extras ----------
  {
    nome: "Café",
    grupo: null,
    marcadores: ["cafeina"],
    troca: "Segure o café para depois de comer: em jejum ele acelera o intestino de quem é sensível.",
  },
  { nome: "Chá preto", grupo: null, marcadores: ["cafeina"] },
  { nome: "Refrigerante", grupo: null, marcadores: ["ultraprocessado"] },
  { nome: "Refrigerante diet/zero", grupo: "polioles", marcadores: ["ultraprocessado"] },
  { nome: "Adoçante (sorbitol/xilitol)", grupo: "polioles", busca: "diet zero" },
  { nome: "Mel", grupo: "frutose" },
  { nome: "Chocolate ao leite", grupo: "lactose", marcadores: ["ultraprocessado"] },
  { nome: "Chocolate 70%", grupo: null },
  { nome: "Vinho", grupo: null },
  { nome: "Cerveja", grupo: "frutanos" },
  { nome: "Salgadinho de pacote", grupo: null, marcadores: ["ultraprocessado", "sodioAlto"] },
  { nome: "Batata frita", grupo: null, marcadores: ["fritura", "gorduraPesada"] },
  { nome: "Azeite", grupo: null },
  { nome: "Castanhas", grupo: null, fibra: true },
];

/** Busca sem acento e sem caixa, no nome e nos sinônimos. */
export function buscarAlimentos(termo: string): AlimentoCatalogo[] {
  const t = normalizar(termo);
  if (!t) return CATALOGO;
  return CATALOGO.filter(
    (a) => normalizar(a.nome).includes(t) || normalizar(a.busca ?? "").includes(t)
  );
}

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function paraItem(a: AlimentoCatalogo): ItemPrato {
  return { nome: a.nome, grupo: a.grupo, marcadores: a.marcadores };
}

/** O prato tem alguma fonte de fibra? Entra na nota do perfil "lentidao". */
export function temFibra(escolhidos: AlimentoCatalogo[]): boolean {
  return escolhidos.some((a) => a.fibra);
}

/* ------------------------------ a troca ------------------------------ */

/**
 * A troca por grupo. Isto é o que ela leva da tela — a nota sozinha só
 * informa; a troca é o que muda o próximo prato.
 */
const TROCA_POR_GRUPO: Record<ReintroGroup, string> = {
  frutanos:
    "Troque cebola e alho por azeite aromatizado (doure e descarte) e a parte verde da cebolinha.",
  gos: "Deixe o feijão de molho e troque metade da porção por arroz — o gás vem da quantidade.",
  lactose:
    "Mesma comida, versão sem lactose: leite zero lactose ou queijo curado no lugar do fresco.",
  polioles:
    "Troque a fruta de caroço ou o adoçante diet por morango, mamão ou laranja.",
  frutose: "Troque manga e mel por banana não madura ou kiwi.",
};

const TROCA_POR_MARCADOR: Partial<Record<MarcadorPrato, string>> = {
  ultraprocessado:
    "Troque o industrializado por uma versão feita na hora — menos aditivo, menos sódio.",
  sodioAlto: "Corte o sal do preparo e tempere com ervas: sódio puxa retenção.",
  fritura: "Assar no lugar de fritar tira o peso da digestão sem tirar o prato.",
  gorduraPesada: "Uma porção menor da parte gordurosa já muda o esvaziamento.",
  cafeina: "Segure o café para depois de comer, nunca em jejum.",
};

/**
 * Sugere a troca a partir do que mais tirou ponto. Recebe os `porques` já
 * ordenados por peso, então basta olhar o primeiro que tenha troca conhecida.
 */
export function sugerirTroca(itens: ItemPrato[]): string {
  // Troca do PRÓPRIO alimento primeiro; a do grupo é o último recurso.
  for (const item of itens) {
    const doCatalogo = CATALOGO.find((a) => a.nome === item.nome);
    if (doCatalogo?.troca) return doCatalogo.troca;
  }

  const comGrupo = itens.find((i) => i.grupo);
  if (comGrupo?.grupo) return TROCA_POR_GRUPO[comGrupo.grupo];

  for (const item of itens) {
    for (const m of item.marcadores ?? []) {
      const troca = TROCA_POR_MARCADOR[m];
      if (troca) return troca;
    }
  }
  return "Esse prato já está do jeito que o seu intestino gosta. Repete.";
}
