/**
 * Receitas low FODMAP, localizadas para o Brasil, organizadas por fase do
 * programa. Conteúdo real; a expansão para 12+ por fase e a checagem de fontes
 * ficam na Fase 11.
 */
import type { JourneyPhase } from "@/types/domain";

export interface Recipe {
  id: string;
  nome: string;
  phase: JourneyPhase;
  tipo: "Café" | "Almoço" | "Jantar" | "Lanche";
  tempo: string;
  emoji: string;
  ingredientes: string[];
  modo: string[];
}

export const RECIPES: Recipe[] = [
  {
    id: "sopa-abobora-gengibre",
    nome: "Sopa de abóbora com gengibre",
    phase: "Choque",
    tipo: "Jantar",
    tempo: "30 min",
    emoji: "🎃",
    ingredientes: [
      "2 xícaras de abóbora kabocha em cubos",
      "1 cenoura média",
      "1 colher (chá) de gengibre ralado",
      "Azeite aromatizado (sem o alho)",
      "Sal e cebolinha (parte verde)",
    ],
    modo: [
      "Refogue a abóbora e a cenoura no azeite aromatizado.",
      "Cubra com água, junte o gengibre e cozinhe até ficar macio.",
      "Bata no liquidificador, ajuste o sal e finalize com cebolinha.",
    ],
  },
  {
    id: "omelete-espinafre",
    nome: "Omelete de espinafre",
    phase: "Choque",
    tipo: "Café",
    tempo: "10 min",
    emoji: "🍳",
    ingredientes: [
      "2 ovos",
      "1 punhado de espinafre",
      "Azeite, sal e cebolinha",
    ],
    modo: [
      "Bata os ovos com sal.",
      "Refogue o espinafre rapidamente no azeite.",
      "Junte os ovos e dobre a omelete quando firmar.",
    ],
  },
  {
    id: "frango-arroz-abobrinha",
    nome: "Frango grelhado com arroz e abobrinha",
    phase: "Remoção",
    tipo: "Almoço",
    tempo: "25 min",
    emoji: "🍗",
    ingredientes: [
      "1 filé de frango",
      "½ xícara de arroz",
      "1 abobrinha em rodelas",
      "Azeite aromatizado, sal, limão e ervas",
    ],
    modo: [
      "Tempere e grelhe o frango.",
      "Cozinhe o arroz com o azeite aromatizado.",
      "Refogue a abobrinha e sirva com um fio de limão.",
    ],
  },
  {
    id: "panqueca-banana",
    nome: "Panqueca de banana e ovo",
    phase: "Remoção",
    tipo: "Café",
    tempo: "10 min",
    emoji: "🥞",
    ingredientes: [
      "1 banana (não muito madura)",
      "2 ovos",
      "1 colher (sopa) de aveia sem glúten",
      "Canela a gosto",
    ],
    modo: [
      "Amasse a banana e misture com os ovos, a aveia e a canela.",
      "Doure pequenas porções na frigideira antiaderente.",
      "Sirva com frutas low FODMAP.",
    ],
  },
  {
    id: "salmao-pure-batata",
    nome: "Salmão com purê de batata",
    phase: "Reparo",
    tipo: "Jantar",
    tempo: "30 min",
    emoji: "🐟",
    ingredientes: [
      "1 posta de salmão",
      "2 batatas",
      "Azeite, sal e cebolinha",
      "Vagem no vapor",
    ],
    modo: [
      "Asse ou grelhe o salmão temperado com sal e limão.",
      "Cozinhe as batatas e amasse com azeite e um pouco da água do cozimento.",
      "Sirva com a vagem no vapor.",
    ],
  },
  {
    id: "caldo-de-osso",
    nome: "Caldo de osso reparador",
    phase: "Reparo",
    tipo: "Jantar",
    tempo: "3 h (fogo baixo)",
    emoji: "🍲",
    ingredientes: [
      "Ossos com cartilagem (boi ou frango)",
      "1 cenoura e ½ talo de salsão (opcional)",
      "Gengibre, sal e ervas",
      "Um fio de vinagre (ajuda a extrair os nutrientes)",
    ],
    modo: [
      "Cubra os ossos com água, junte o vinagre e os vegetais.",
      "Cozinhe em fogo bem baixo por algumas horas.",
      "Coe e guarde; use como base de sopas ou tome puro.",
    ],
  },
  {
    id: "bowl-reintroducao",
    nome: "Bowl de teste (reintrodução)",
    phase: "Reintrodução",
    tipo: "Almoço",
    tempo: "20 min",
    emoji: "🥗",
    ingredientes: [
      "Base de arroz + folhas + cenoura",
      "Proteína à escolha (frango/peixe/ovo)",
      "O grupo que você vai testar hoje (ex.: 2 col. de feijão)",
      "Azeite e limão",
    ],
    modo: [
      "Monte o bowl com a base que você já tolera.",
      "Adicione APENAS o grupo do teste do dia, em porção pequena.",
      "Observe e registre a reação nas horas seguintes.",
    ],
  },
  {
    id: "creme-cenoura",
    nome: "Creme de cenoura e gengibre",
    phase: "Remoção",
    tipo: "Jantar",
    tempo: "25 min",
    emoji: "🥕",
    ingredientes: [
      "3 cenouras",
      "1 batata pequena",
      "Gengibre, azeite aromatizado e sal",
    ],
    modo: [
      "Cozinhe a cenoura e a batata com gengibre.",
      "Bata até ficar cremoso.",
      "Finalize com azeite e cebolinha.",
    ],
  },
  {
    id: "iogurte-fermentado",
    nome: "Bowl de iogurte e fermentados",
    phase: "Reparo",
    tipo: "Café",
    tempo: "5 min",
    emoji: "🥣",
    ingredientes: [
      "Iogurte sem lactose (ou kefir em pouca quantidade)",
      "Aveia sem glúten",
      "Sementes de chia e abóbora",
      "Morangos ou kiwi",
    ],
    modo: [
      "Monte em camadas o iogurte, a aveia e as sementes.",
      "Cubra com as frutas low FODMAP.",
      "Comece com porção pequena de fermentado e aumente aos poucos.",
    ],
  },
  {
    id: "cha-gengibre-limao",
    nome: "Chá de gengibre e limão",
    phase: "Choque",
    tipo: "Lanche",
    tempo: "8 min",
    emoji: "🍵",
    ingredientes: ["2 cm de gengibre fatiado", "Suco de ½ limão", "300 ml de água"],
    modo: [
      "Ferva a água com o gengibre por 5 min.",
      "Desligue, junte o suco de limão.",
      "Tome morno após as refeições para ajudar a digestão.",
    ],
  },
  {
    id: "arroz-frango-cenoura",
    nome: "Canja leve de frango e arroz",
    phase: "Choque",
    tipo: "Jantar",
    tempo: "35 min",
    emoji: "🍜",
    ingredientes: [
      "1 filé de frango em cubos",
      "½ xícara de arroz",
      "1 cenoura em rodelas",
      "Azeite aromatizado, gengibre, sal e cebolinha",
    ],
    modo: [
      "Refogue o frango no azeite aromatizado.",
      "Junte arroz, cenoura, gengibre e água; cozinhe até o arroz desmanchar.",
      "Finalize com cebolinha.",
    ],
  },
  {
    id: "wrap-tapioca",
    nome: "Wrap de tapioca com frango",
    phase: "Remoção",
    tipo: "Almoço",
    tempo: "15 min",
    emoji: "🌯",
    ingredientes: [
      "Goma de tapioca",
      "Frango desfiado temperado com azeite aromatizado",
      "Folhas, tomate e cenoura ralada",
    ],
    modo: [
      "Hidrate a goma e faça o disco de tapioca na frigideira.",
      "Recheie com o frango e os vegetais.",
      "Enrole e sirva.",
    ],
  },
  {
    id: "salada-quinoa",
    nome: "Salada morna de quinoa",
    phase: "Remoção",
    tipo: "Almoço",
    tempo: "20 min",
    emoji: "🥗",
    ingredientes: [
      "½ xícara de quinoa",
      "Abobrinha e cenoura em cubos",
      "Folhas, azeite, limão e sementes de abóbora",
    ],
    modo: [
      "Cozinhe a quinoa.",
      "Salteie os legumes no azeite.",
      "Misture tudo e finalize com limão e sementes.",
    ],
  },
  {
    id: "smoothie-mamao",
    nome: "Smoothie de mamão e chia",
    phase: "Reparo",
    tipo: "Café",
    tempo: "5 min",
    emoji: "🥤",
    ingredientes: [
      "1 fatia de mamão",
      "200 ml de leite sem lactose",
      "1 colher de chia",
      "Gengibre a gosto",
    ],
    modo: ["Bata tudo no liquidificador.", "Sirva gelado.", "Deixe a chia hidratar 2 min antes."],
  },
  {
    id: "omelete-forno",
    nome: "Omelete de forno com legumes",
    phase: "Reintrodução",
    tipo: "Jantar",
    tempo: "30 min",
    emoji: "🧀",
    ingredientes: [
      "4 ovos",
      "Abobrinha, espinafre e tomate picados",
      "Parmesão ralado (pouca lactose)",
      "Azeite, sal e ervas",
    ],
    modo: [
      "Bata os ovos com sal e ervas.",
      "Misture os legumes e o parmesão.",
      "Asse em forma untada a 180°C por ~20 min.",
    ],
  },
  {
    id: "pure-mandioquinha",
    nome: "Purê de mandioquinha",
    phase: "Reparo",
    tipo: "Jantar",
    tempo: "25 min",
    emoji: "🥔",
    ingredientes: ["3 mandioquinhas (batata-baroa)", "Azeite, sal e cebolinha", "Um fio de leite sem lactose"],
    modo: [
      "Cozinhe a mandioquinha até ficar macia.",
      "Amasse com azeite e um pouco de leite sem lactose.",
      "Finalize com cebolinha.",
    ],
  },

  /* ----------------------- REEQUILÍBRIO (dias 15–21) ----------------------- */
  {
    id: "overnight-oats-morango",
    nome: "Overnight oats de chia e morango",
    phase: "Reequilíbrio",
    tipo: "Café",
    tempo: "5 min (+ geladeira)",
    emoji: "🥣",
    ingredientes: [
      "4 colheres (sopa) de aveia sem glúten",
      "1 colher (sopa) de chia",
      "150 ml de leite sem lactose ou bebida de arroz",
      "Morangos picados",
      "Canela a gosto",
    ],
    modo: [
      "Misture a aveia, a chia e o leite num pote com tampa.",
      "Deixe na geladeira de um dia pro outro.",
      "Sirva com os morangos e a canela por cima.",
    ],
  },
  {
    id: "escondidinho-mandioquinha",
    nome: "Escondidinho de mandioquinha com carne",
    phase: "Reequilíbrio",
    tipo: "Almoço",
    tempo: "40 min",
    emoji: "🥧",
    ingredientes: [
      "3 mandioquinhas cozidas e amassadas",
      "300 g de carne moída magra",
      "Azeite aromatizado (sem o alho)",
      "Tomate picado, sal e cebolinha (parte verde)",
      "Parmesão ralado para gratinar (opcional)",
    ],
    modo: [
      "Refogue a carne no azeite aromatizado com o tomate e o sal.",
      "Monte numa travessa: carne embaixo, purê de mandioquinha por cima.",
      "Polvilhe o parmesão e leve ao forno a 200°C por ~15 min.",
      "Finalize com cebolinha.",
    ],
  },
  {
    id: "salmao-quinoa-vagem",
    nome: "Salmão grelhado com quinoa e vagem",
    phase: "Reequilíbrio",
    tipo: "Jantar",
    tempo: "30 min",
    emoji: "🐟",
    ingredientes: [
      "1 posta de salmão",
      "½ xícara de quinoa",
      "1 xícara de vagem",
      "Azeite, limão, sal e ervas",
    ],
    modo: [
      "Cozinhe a quinoa (2 partes de água para 1 de quinoa).",
      "Grelhe o salmão temperado com sal, limão e ervas.",
      "Salteie a vagem no azeite e monte o prato.",
    ],
  },
];

export function recipesByPhase(phase: JourneyPhase): Recipe[] {
  return RECIPES.filter((r) => r.phase === phase);
}
