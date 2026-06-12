/**
 * Lista de Gatilhos — alimentos que parecem saudáveis e te incham (alto FODMAP),
 * localizados para o Brasil. Conteúdo real (base Low FODMAP / Monash). A
 * validação com fontes e a expansão completa ficam na Fase 11 (SOURCES.md).
 */

export type FodmapGroup =
  | "Frutanos"
  | "GOS"
  | "Lactose"
  | "Frutose"
  | "Polióis"
  | "Frutose e polióis";

export interface TriggerFood {
  nome: string;
  grupo: FodmapGroup;
  /** Por que parece saudável mas incha. */
  porque: string;
  /** Troca de baixo FODMAP. */
  troca: string;
  emoji: string;
}

export const TRIGGER_FOODS: TriggerFood[] = [
  {
    nome: "Cebola e alho",
    grupo: "Frutanos",
    porque:
      "Base de quase toda comida “caseira e saudável”, mas são os campeões de frutano — a fibra que mais fermenta e produz gás na maioria das pessoas.",
    troca: "Azeite aromatizado (doure e descarte) + parte verde da cebolinha",
    emoji: "🧅",
  },
  {
    nome: "Pão e massas de trigo",
    grupo: "Frutanos",
    porque:
      "O “problema com glúten” de muita gente é, na verdade, frutano do trigo. Mesmo o integral incha quando o intestino está sensível.",
    troca: "Pão sem glúten, tapioca, arroz, batata, aveia sem glúten",
    emoji: "🍞",
  },
  {
    nome: "Maçã e pera",
    grupo: "Frutose e polióis",
    porque:
      "Frutas saudáveis, sim — mas ricas em frutose e sorbitol, que boa parte das pessoas absorve mal e fermenta.",
    troca: "Mamão, kiwi, laranja, morango, uva",
    emoji: "🍎",
  },
  {
    nome: "Mel",
    grupo: "Frutose",
    porque:
      "Adoçante “natural”, mas concentrado em frutose livre — estufa fácil, principalmente em jejum.",
    troca: "Açúcar comum em pouca quantidade, ou xarope de bordo (maple) puro",
    emoji: "🍯",
  },
  {
    nome: "Feijão, grão-de-bico e lentilha",
    grupo: "GOS",
    porque:
      "Proteína vegetal ótima, mas cheia de GOS, fibra que fermenta. O segredo é porção pequena e bem cozida.",
    troca: "2–3 colheres bem cozidas, ou tofu firme e proteína animal",
    emoji: "🫘",
  },
  {
    nome: "Leite e iogurte comum",
    grupo: "Lactose",
    porque:
      "Quando falta a enzima lactase, a lactose chega ao intestino e fermenta — inchaço e gases logo depois.",
    troca: "Leite e iogurte sem lactose, queijos curados (parmesão)",
    emoji: "🥛",
  },
  {
    nome: "Couve-flor e cogumelo",
    grupo: "Polióis",
    porque:
      "Estrelas das receitas “low carb”, mas ricos em manitol — um poliol que fermenta e prende líquido.",
    troca: "Abobrinha, cenoura, berinjela, chuchu, vagem",
    emoji: "🍄",
  },
  {
    nome: "Suco verde com maçã e couve",
    grupo: "Frutose",
    porque:
      "Vendido como “detox”, mas concentra a frutose e o sorbitol da maçã em forma líquida, que chega rápido ao intestino — a couve não é o problema.",
    troca: "Água com gengibre e limão, ou suco de fruta low FODMAP coado",
    emoji: "🥬",
  },
  {
    nome: "Melancia e manga",
    grupo: "Frutose",
    porque:
      "Frutas de verão que parecem leves, mas têm excesso de frutose (e a melancia também polióis).",
    troca: "Melão amarelo, abacaxi, mamão, frutas vermelhas",
    emoji: "🍉",
  },
  {
    nome: "Adoçantes “sem açúcar”",
    grupo: "Polióis",
    porque:
      "Sorbitol, manitol e xilitol (em gomas, balas e produtos diet) são polióis que fermentam forte — efeito laxante e gasoso.",
    troca: "Pouca quantidade de açúcar, estévia pura ou sucralose",
    emoji: "🍬",
  },
  {
    nome: "Granola com mel e trigo",
    grupo: "Frutanos",
    porque:
      "Cara de café da manhã saudável, mas junta frutano (trigo/cevada), frutose (mel) e às vezes mais frutas secas.",
    troca: "Aveia sem glúten + sementes (abóbora, girassol) + frutas low FODMAP",
    emoji: "🥣",
  },
  {
    nome: "Abacate em porção grande",
    grupo: "Polióis",
    porque:
      "Em pouca quantidade é tranquilo, mas meio abacate ou mais traz sorbitol suficiente pra estufar quem é sensível.",
    troca: "Até ¼ de abacate pequeno por vez; azeite e castanhas como gordura boa",
    emoji: "🥑",
  },
];
