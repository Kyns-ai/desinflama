/**
 * Semáforo dos alimentos — heurística glanceável (estilo sistema de cores do
 * Noom), adaptada ao intestino e ao Brasil, com base low-FODMAP (Monash).
 *
 * Importante (anti-restrição / ético): NÃO é "bom x ruim". É conforto provável.
 * Nada é proibido — a maioria das pessoas reage só a 1–3 grupos, e a
 * reintrodução devolve quase tudo. O corpo de cada uma manda mais que a tabela.
 */

export type Tier = "calma" | "atencao" | "inflama";

export interface SemaforoFood {
  nome: string;
  emoji: string;
}

export interface SemaforoTier {
  tier: Tier;
  label: string;
  desc: string;
  foods: SemaforoFood[];
}

export const SEMAFORO: SemaforoTier[] = [
  {
    tier: "calma",
    label: "Calma",
    desc: "Baixo FODMAP — costumam cair bem. Sua base no começo da jornada.",
    foods: [
      { nome: "Arroz", emoji: "🍚" },
      { nome: "Batata", emoji: "🥔" },
      { nome: "Cenoura", emoji: "🥕" },
      { nome: "Abobrinha", emoji: "🥒" },
      { nome: "Banana (não madura)", emoji: "🍌" },
      { nome: "Mamão", emoji: "🧡" },
      { nome: "Morango", emoji: "🍓" },
      { nome: "Frango", emoji: "🍗" },
      { nome: "Peixe", emoji: "🐟" },
      { nome: "Ovo", emoji: "🥚" },
      { nome: "Tapioca", emoji: "🌯" },
      { nome: "Aveia sem glúten", emoji: "🥣" },
      { nome: "Espinafre", emoji: "🌿" },
      { nome: "Queijo curado", emoji: "🧀" },
      { nome: "Iogurte sem lactose", emoji: "🥛" },
      { nome: "Azeite", emoji: "🫒" },
    ],
  },
  {
    tier: "atencao",
    label: "Atenção",
    desc: "Depende da porção e de você. Teste aos poucos e observe.",
    foods: [
      { nome: "Abacate", emoji: "🥑" },
      { nome: "Brócolis", emoji: "🥦" },
      { nome: "Batata-doce", emoji: "🍠" },
      { nome: "Milho", emoji: "🌽" },
      { nome: "Café", emoji: "☕" },
      { nome: "Chocolate amargo", emoji: "🍫" },
      { nome: "Grão-de-bico (lavado)", emoji: "🫘" },
    ],
  },
  {
    tier: "inflama",
    label: "Inflama",
    desc: "Alto FODMAP — fermentam forte e estufam a maioria. Pausar agora ajuda a observar; voltam na reintrodução.",
    foods: [
      { nome: "Cebola", emoji: "🧅" },
      { nome: "Alho", emoji: "🧄" },
      { nome: "Pão/massa de trigo", emoji: "🍞" },
      { nome: "Maçã", emoji: "🍎" },
      { nome: "Pera", emoji: "🍐" },
      { nome: "Mel", emoji: "🍯" },
      { nome: "Feijão/lentilha", emoji: "🫘" },
      { nome: "Leite/iogurte comum", emoji: "🥛" },
      { nome: "Melancia", emoji: "🍉" },
      { nome: "Manga", emoji: "🥭" },
      { nome: "Adoçante poliól", emoji: "🚫" },
    ],
  },
];

export const TIER_STYLE: Record<
  Tier,
  { dot: string; chip: string; ring: string }
> = {
  calma: {
    dot: "bg-sage",
    chip: "bg-sage-tint text-sage-dark",
    ring: "border-sage/25",
  },
  atencao: {
    dot: "bg-gold",
    chip: "bg-gold-tint text-[#7c5d18]",
    ring: "border-gold/25",
  },
  inflama: {
    dot: "bg-coral",
    chip: "bg-coral-tint text-coral-dark",
    ring: "border-coral/25",
  },
};
