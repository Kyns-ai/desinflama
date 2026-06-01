/**
 * Calmaria — pilar Mente-Intestino.
 *
 * Respiração guiada (expiração prolongada → tônus vagal/parassimpático) + uma
 * microreframe de psicoeducação intestino-cérebro a cada dia.
 *
 * Por que existe (evidência, não achismo):
 * - Terapias dirigidas ao eixo intestino-cérebro (hipnoterapia/CBT) reduzem
 *   sintomas de SII tanto quanto dieta, e a AGA as recomenda como parte do
 *   cuidado baseado em evidência (RCT do app Nerva, Am J Gastroenterol 2024;
 *   >30 RCTs de CBT). Ver content/SOURCES.md.
 * - Ansiedade/estresse amplificam a sensibilidade visceral (hipervigilância) —
 *   acalmar o sistema nervoso tem efeito real sobre o desconforto.
 * - É a alavanca de MAIOR evidência e MENOR risco: não tem o risco de
 *   restrição/transtorno alimentar que a dieta carrega.
 *
 * Enquadramento honesto: é uma ferramenta de AUTOCUIDADO; não é hipnoterapia
 * clínica nem substitui avaliação profissional.
 */

export interface BreathPattern {
  /** segundos */
  inhale: number;
  hold: number;
  exhale: number;
}

export interface CalmariaReframe {
  heading: string;
  body: string;
}

export interface CalmariaSession {
  /** Padrão de respiração (expiração mais longa = mais calmante). */
  pattern: BreathPattern;
  /** Quantos ciclos guiados. */
  cycles: number;
  /** Microeducação intestino-cérebro mostrada ao final. */
  reframe: CalmariaReframe;
}

/** Respiração 4-2-6: expiração prolongada ativa o ramo parassimpático
 *  (o "freio" do corpo), que acalma a sensibilidade do intestino. */
export const BREATH: BreathPattern = { inhale: 4, hold: 2, exhale: 6 };
export const CYCLES = 6;

/** Microreframes — psicoeducação curta, validante e baseada em evidência.
 *  Rotacionam por dia. Tom: acolhedor, nunca de medo (medo piora via nocebo). */
export const REFRAMES: CalmariaReframe[] = [
  {
    heading: "Seu intestino escuta sua mente",
    body: "Intestino e cérebro conversam o tempo todo. Quando você acalma o sistema nervoso, o intestino sente — menos tensão, menos sensibilidade. Não é 'frescura': é o eixo intestino-cérebro, e tem ciência por trás.",
  },
  {
    heading: "Ansiedade amplifica a sensação",
    body: "O estresse deixa o intestino mais sensível (hipervigilância) — o mesmo gás incomoda mais num dia tenso. Respirar devagar baixa esse volume. Você não está exagerando; seu corpo está num modo mais reativo.",
  },
  {
    heading: "Inchaço é real e é comum",
    body: "Até 96% das pessoas com intestino sensível têm inchaço, e mais da metade diz ser o sintoma que mais incomoda. Você não está sozinha e não está inventando. Ser levada a sério já faz parte do cuidado.",
  },
  {
    heading: "A expiração é o botão de calma",
    body: "Soltar o ar devagar, mais longo que a inspiração, sinaliza ao corpo que está seguro. O ritmo cardíaco baixa, os músculos soltam — inclusive os do abdômen. Por isso a gente alonga a expiração aqui.",
  },
  {
    heading: "Você reage a poucos alimentos, não a todos",
    body: "Na maioria das pessoas, só 1 a 3 grupos de alimentos disparam sintomas — não a comida inteira. A jornada existe pra descobrir os SEUS, com calma, e devolver tudo o que não te faz mal.",
  },
  {
    heading: "Um dia difícil não é um recomeço",
    body: "Sintoma que volta num dia não apaga seu progresso. O corpo tem altos e baixos. O que conta é a direção ao longo das semanas, não um dia isolado. Respira — amanhã segue.",
  },
  {
    heading: "Gentileza acalma o intestino",
    body: "Autocrítica mantém o corpo em alerta. Falar consigo com a gentileza que você teria com uma amiga reduz o estresse — e o intestino agradece. Você está cuidando, não se cobrando.",
  },
];

export function calmariaForDay(day: number): CalmariaSession {
  const idx = ((day - 1) % REFRAMES.length + REFRAMES.length) % REFRAMES.length;
  return { pattern: BREATH, cycles: CYCLES, reframe: REFRAMES[idx] };
}

/** Duração aproximada em segundos de uma sessão (para rótulo de tempo). */
export function calmariaSeconds(s: CalmariaSession): number {
  const cycle = s.pattern.inhale + s.pattern.hold + s.pattern.exhale;
  return cycle * s.cycles;
}
