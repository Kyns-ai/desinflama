/**
 * Confiança radical — honestidade + validação + ciência.
 *
 * Por que existe: o público (mulheres com inchaço/SII) chega cético — "já tentei
 * tudo", foi dispensada por médicos, tem medo de ser enganada de novo. A
 * literatura é clara: honestidade + validação + fontes AUMENTAM a confiança e a
 * adesão, e reduzem reembolso. Medo (nocebo ~32%) piora; acolhimento (placebo
 * ~40%) melhora o desfecho real. Ver content/SOURCES.md.
 */

export const VALIDATION = {
  title: "Seus sintomas são reais",
  body:
    "Inchaço é o sintoma que mais incomoda pra maioria das pessoas com intestino sensível — e ser dispensada sobre isso é comum demais. Aqui a gente leva a sério: com ciência, com calma, sem detox milagroso e sem prometer o impossível.",
};

/** O que ESTES 14 dias honestamente podem fazer. */
export const CAN_DO: string[] = [
  "Começar a acalmar o eixo intestino-cérebro com respiração e relaxamento — isso você sente já nos primeiros dias.",
  "Te ajudar a notar padrões e possíveis gatilhos com o registro diário.",
  "Reduzir o inchaço em parte das pessoas já nas primeiras 2 a 4 semanas.",
  "Criar uma rotina gentil e simples que você consegue manter.",
];

/** O que estes 14 dias NÃO podem fazer (honestidade que constrói confiança). */
export const CANNOT_DO: string[] = [
  "Curar SII ou “consertar” seu intestino em 14 dias — isso não existe, e quem promete está te enganando.",
  "Descobrir TODOS os seus gatilhos: a reintrodução de alimentos leva semanas e vem depois.",
  "Prometer “barriga chapada” — inchaço não é gordura, e esse não é o nosso objetivo.",
  "Substituir uma avaliação médica.",
];

export interface ScienceSource {
  claim: string;
  url: string;
}

/** Fontes reais e sérias (curadas) que embasam o método. */
export const SCIENCE_SOURCES: ScienceSource[] = [
  {
    claim: "Dieta baixa em FODMAPs (em 3 fases) reduz sintomas em ~50–80% das pessoas com SII — Monash & diretriz ACG.",
    url: "https://www.monashfodmap.com/blog/3-phases-low-fodmap-diet/",
  },
  {
    claim: "A maioria reage só a 1–3 grupos de alimentos, não a todos — RCT de reintrodução (Eswaran et al.), Clin Gastroenterol Hepatol 2024.",
    url: "https://doi.org/10.1016/j.cgh.2024.03.047",
  },
  {
    claim: "Terapias intestino-cérebro (hipnoterapia/CBT) ajudam tanto quanto a dieta e são recomendadas pela AGA — RCT, Am J Gastroenterol 2024.",
    url: "https://doi.org/10.14309/ajg.0000000000002921",
  },
  {
    claim: "Inchaço atinge até 96% das pessoas com SII e é o sintoma mais incômodo pra mais da metade — Rome Foundation.",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10527500/",
  },
  {
    claim: "Dietas muito restritivas têm risco de alimentação desordenada — por isso temos uma autochecagem de segurança.",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12118804/",
  },
];

export const DISCLAIMER =
  "Desinflama é uma ferramenta de educação e autocuidado. Não é diagnóstico nem tratamento médico e não substitui avaliação profissional. Procure um médico se os sintomas forem intensos, persistentes, novos, ou vierem com perda de peso, sangue nas fezes ou febre.";

/* ----------------------- Autochecagem de segurança ----------------------- */

/**
 * Adaptação gentil do SCOFF (rastreio de risco de transtorno alimentar). NÃO é
 * diagnóstico — só decide se sugerimos um caminho mais cuidadoso (sem restrição)
 * e conversar com um profissional. ~33% das pacientes de SII pontuam risco, e
 * dieta restritiva é contraindicada nesses casos.
 */
export interface SafetyQuestion {
  id: string;
  text: string;
}

export const SAFETY_QUESTIONS: SafetyQuestion[] = [
  { id: "vomit", text: "Você já provoca vômito quando se sente desconfortavelmente cheia?" },
  { id: "control", text: "Você se preocupa por ter perdido o controle sobre o quanto come?" },
  { id: "weight", text: "Você perdeu mais de 6 kg nos últimos 3 meses sem ser de propósito?" },
  { id: "fat", text: "Você se sente gorda mesmo quando os outros dizem que você está magra?" },
  { id: "dominates", text: "Você diria que comida e alimentação dominam sua vida?" },
];

/** ≥2 respostas "sim" sugerem cuidado redobrado (limiar clássico do SCOFF). */
export const SAFETY_THRESHOLD = 2;

export function safetyAtRisk(yesCount: number): boolean {
  return yesCount >= SAFETY_THRESHOLD;
}
