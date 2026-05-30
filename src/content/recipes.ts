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
    phase: "Remove",
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
    phase: "Remove",
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
    phase: "Repair",
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
    phase: "Repair",
    tipo: "Jantar",
    tempo: "3 h (fogo baixo)",
    emoji: "🍲",
    ingredientes: [
      "Ossos com cartilagem (boi ou frango)",
      "1 cenoura e 1 talo de salsão",
      "Gengibre, sal e ervas",
      "Splash de vinagre (ajuda a extrair os nutrientes)",
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
    phase: "Remove",
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
    phase: "Repair",
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
];

export function recipesByPhase(phase: JourneyPhase): Recipe[] {
  return RECIPES.filter((r) => r.phase === phase);
}
