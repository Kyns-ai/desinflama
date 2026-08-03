/**
 * Conteúdo do onboarding leve (NÃO é o funil de vendas — personaliza e gera o
 * Mapa de Inchaço). Perguntas curtas, 1 por tela. A base clínica do programa
 * (FODMAP/5R) é escrita na Fase 11.
 */
import type { BloatType, Goal, SymptomKey } from "@/types/domain";

export interface QuizOption {
  value: string;
  label: string;
  emoji?: string;
  desc?: string;
  /**
   * Id da ilustração, quando a arte NÃO é achável pelo emoji.
   *
   * O caminho padrão traduz emoji -> id (content/cardArt.ts). Duas opções
   * caíam no fallback porque o emoji delas não está nesse mapa, embora a arte
   * exista: as quatro do perfil de inchaço (mapa-*.png) e "ao longo do dia".
   * Ficava um azulejo cinza no meio de ilustrações — parecia imagem quebrada.
   */
  arte?: string;
}

export interface QuizQuestion {
  id: "bloatType" | "symptoms" | "worstTime" | "goal";
  title: string;
  subtitle?: string;
  multi?: boolean;
  options: QuizOption[];
}

export const QUESTIONS: QuizQuestion[] = [
  {
    id: "bloatType",
    title: "O que mais parece a sua barriga?",
    subtitle: "Não existe resposta errada — é só pra te entender melhor.",
    options: [
      {
        value: "fermentacao",
        arte: "mapa-fermentacao",
        label: "Estufa e faz barulho",
        emoji: "🎈",
        desc: "Gases, ronco, aperta a roupa à noite",
      },
      {
        value: "retencao",
        arte: "mapa-retencao",
        label: "Fica pesada e inchada",
        emoji: "💧",
        desc: "Sensação de retenção, principalmente no calor ou TPM",
      },
      {
        value: "lentidao",
        arte: "mapa-lentidao",
        label: "Vivo presa",
        emoji: "🐌",
        desc: "Intestino lento, dias sem ir ao banheiro",
      },
      {
        value: "estresse",
        arte: "mapa-estresse",
        label: "Estufa quando fico ansiosa",
        emoji: "🌪️",
        desc: "Piora em dias de estresse ou correria",
      },
    ],
  },
  {
    id: "symptoms",
    title: "O que mais te incomoda hoje?",
    subtitle: "Pode escolher mais de um.",
    multi: true,
    options: [
      { value: "inchaco", label: "Inchaço", emoji: "🎈" },
      { value: "gases", label: "Gases", emoji: "💨" },
      { value: "intestino", label: "Intestino preso ou solto", emoji: "🚽" },
      { value: "energia", label: "Cansaço / névoa mental", emoji: "⚡" },
      { value: "pele", label: "Pele sem viço", emoji: "✨" },
    ],
  },
  {
    id: "worstTime",
    title: "Quando você incha mais?",
    options: [
      { value: "manha", label: "De manhã", emoji: "🌅" },
      { value: "tarde", label: "Ao longo do dia", emoji: "☀️", arte: "card-amanhecer" },
      { value: "noite", label: "À noite", emoji: "🌙", desc: "A barriga cresce até dormir" },
      { value: "refeicoes", label: "Logo depois de comer", emoji: "🍽️" },
    ],
  },
  {
    id: "goal",
    title: "Qual sua maior vontade agora?",
    options: [
      { value: "desinchar", label: "Desinchar a barriga", emoji: "🎯" },
      { value: "energia", label: "Ter mais energia", emoji: "⚡" },
      { value: "pele", label: "Melhorar a pele", emoji: "✨" },
      { value: "digestao", label: "Digerir sem desconforto", emoji: "🌿" },
      { value: "rotina", label: "Criar uma rotina saudável", emoji: "📿" },
    ],
  },
];

export interface BloatProfile {
  name: string;
  tagline: string;
  /** Causa explicada para leigo, em ~2 linhas. */
  cause: string;
  /** O que o programa vai fazer por ela. */
  plan: string;
  tone: "coral" | "sky" | "rose" | "plum";
  emoji: string;
}

export const BLOAT_PROFILES: Record<BloatType, BloatProfile> = {
  fermentacao: {
    name: "Inchaço de Fermentação",
    tagline: "É gás, não gordura.",
    cause:
      "Certos carboidratos chegam ao seu intestino sem serem digeridos e viram comida pras bactérias, que produzem gás. Esse gás estufa sua barriga — principalmente no fim do dia.",
    plan: "Nos primeiros dias a gente acalma essa fermentação e depois descobre exatamente quais alimentos são os SEUS gatilhos.",
    tone: "coral",
    emoji: "🎈",
  },
  retencao: {
    name: "Inchaço de Retenção",
    tagline: "Seu corpo está segurando líquido.",
    cause:
      "Excesso de sódio, oscilações hormonais e um intestino irritado fazem o corpo reter água. A barriga incha e fica com aquela sensação pesada.",
    plan: "Vamos reduzir os alimentos que prendem líquido, hidratar do jeito certo e reequilibrar — muita gente sente a diferença já na primeira semana.",
    tone: "sky",
    emoji: "💧",
  },
  lentidao: {
    name: "Inchaço de Trânsito Lento",
    tagline: "Seu intestino precisa de ritmo.",
    cause:
      "Quando o intestino trabalha devagar, tudo se acumula e fermenta por mais tempo — o resultado é barriga estufada e aquela sensação de estar sempre cheia.",
    plan: "Com fibras certas, hidratação e movimento, a gente devolve o ritmo do seu intestino sem forçar nem agredir.",
    tone: "rose",
    emoji: "🐌",
  },
  estresse: {
    name: "Inchaço do Eixo Intestino-Cérebro",
    tagline: "Sua barriga sente o que você sente.",
    cause:
      "Seu intestino e seu cérebro conversam o tempo todo. Em dias de estresse, essa conversa desregula a digestão e a barriga estufa — mesmo comendo bem.",
    plan: "Além de cuidar da comida, vamos trabalhar sono, respiração e ritmo pra acalmar esse eixo e a sua digestão junto.",
    tone: "plum",
    emoji: "🌪️",
  },
};

/** Mensagem do vídeo de boas-vindas da nutricionista (placeholder + transcrição). */
export const WELCOME_VIDEO = {
  title: "Um oi da sua nutri",
  durationLabel: "1 min",
  transcript:
    "Oi! Que bom que você está aqui. Quero te contar uma coisa que muda tudo: na maioria das vezes, o inchaço não tem a ver com o quanto você come, e sim com o QUE o seu intestino consegue digerir bem. Nos próximos dias a gente vai descobrir isso juntas, no seu ritmo. Não é dieta, não é sofrimento — é entender o seu corpo. Te vejo no Dia 1.",
};

export type AnswerMap = {
  bloatType?: BloatType;
  symptoms?: SymptomKey[];
  worstTime?: "manha" | "tarde" | "noite" | "refeicoes";
  goal?: Goal;
};
