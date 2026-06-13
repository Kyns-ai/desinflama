/**
 * Conteúdo da jornada — Desafio Desincha (14 dias, framework 5R / Low FODMAP).
 *
 * Conteúdo real em PT-BR, escrito como copy de app (claro, acolhedor), com base
 * em Low FODMAP (Monash) e no framework 5R. Foco em SINTOMA — nunca calorias ou
 * peso. Alimentos localizados para o Brasil.
 *
 * NOTA DE FASE: a extensão 15–21, os desafios mensais, a biblioteca de aulas/
 * receitas e a validação com fontes (content/SOURCES.md) são consolidados na
 * Fase 11 (pesquisa). A nutricionista revisa e edita este arquivo.
 */
import type { JourneyPhase } from "@/types/domain";
import { phaseForDay } from "@/lib/journey";

export interface Swap {
  de: string;
  para: string;
}

export interface DayMeals {
  cafe: string[];
  almoco: string[];
  jantar: string[];
  lanche?: string[];
}

/** Um card da aula — bite-sized, estilo Headway/Noom. */
export interface LessonCard {
  /** Título curto do card (opcional; serifa no leitor). */
  heading?: string;
  /** Corpo do card (2–4 frases). */
  body: string;
  emoji?: string;
}

/** Pergunta de compreensão ao fim da aula. */
export interface QuizItem {
  question: string;
  options: string[];
  correctIndex: number;
  /** Explicação mostrada após responder ("Isso! Porque…"). */
  explain: string;
}

export interface Lesson {
  title: string;
  /** Resumo de 1 parágrafo (fallback e prévia). */
  body: string;
  durationMin?: number;
  /** Cards deslizáveis; se ausente, o leitor usa um único card com `body`. */
  cards?: LessonCard[];
  /** Mini-quiz de compreensão (opcional). */
  quiz?: QuizItem[];
}

export interface DayContent {
  day: number;
  phase: JourneyPhase;
  /** Marco especial (ex.: dia 7, dia 14) — celebração na conclusão. */
  milestone?: string;
  lesson: Lesson;
  checklist: string[];
  meals: DayMeals;
  swaps?: Swap[];
  completionMessage: string;
}

/** Normaliza a aula em cards (fallback: um único card com o body). */
export function lessonCards(lesson: Lesson): LessonCard[] {
  if (lesson.cards && lesson.cards.length) return lesson.cards;
  return [{ body: lesson.body }];
}

export const DAYS: DayContent[] = [
  /* ----------------------------- CHOQUE (1–3) ----------------------------- */
  {
    day: 1,
    phase: "Choque",
    lesson: {
      title: "Por que você vive estufada (não é o quanto você come)",
      durationMin: 2,
      body: "O inchaço quase nunca é gordura ou “comer demais”. Na maioria das vezes é fermentação: certos carboidratos chegam ao intestino e viram comida pra bactérias, que produzem gás — e o gás estufa sua barriga, principalmente à noite.",
      cards: [
        {
          heading: "Não é gordura. É gás.",
          emoji: "🎈",
          body: "Aquela barriga que cresce ao longo do dia e aperta a roupa à noite quase nunca é gordura nem “comer demais”. É gás preso no intestino.",
        },
        {
          heading: "O que realmente acontece",
          emoji: "🔬",
          body: "Certos carboidratos chegam ao intestino sem serem digeridos e viram comida pras suas bactérias. Elas fermentam esses carboidratos e produzem gás — e o gás estufa a barriga.",
        },
        {
          heading: "Os maiores fermentadores",
          emoji: "🧅",
          body: "Trigo, cebola e alho, leite e derivados, feijão e grão-de-bico, refrigerante e adoçantes. Parecem inofensivos, mas são os campeões de produzir gás.",
        },
        {
          heading: "Cortar agora não é pra sempre",
          emoji: "🌱",
          body: "Nos primeiros 3 dias a gente tira esses fermentadores só pra acalmar. Depois você reintroduz um por um e descobre exatamente o que faz mal PRA VOCÊ.",
        },
        {
          heading: "Seu primeiro passo é hoje",
          emoji: "🎯",
          body: "Tirando o combustível, o intestino para de produzir tanto gás. Muita gente sente a barriga menos estufada já nos primeiros dias. Se o seu corpo demorar mais, tá tudo certo — o mapa continua valendo. Bora começar.",
        },
      ],
      quiz: [
        {
          question: "Na maioria das vezes, o inchaço à noite é causado por…",
          options: [
            "Gás da fermentação de certos carboidratos",
            "Gordura acumulada na barriga",
            "Beber água demais",
          ],
          correctIndex: 0,
          explain:
            "Isso! Certos carboidratos viram comida pras bactérias, que produzem gás — e o gás estufa a barriga.",
        },
        {
          question: "Cortar os fermentadores nos primeiros dias é…",
          options: [
            "Pra sempre",
            "Só pra perder peso",
            "Temporário — pra acalmar e depois achar seus gatilhos",
          ],
          correctIndex: 2,
          explain:
            "Exato. É pra acalmar agora; depois você reintroduz pra descobrir o que TE faz mal.",
        },
      ],
    },
    checklist: [
      "Beba ~2L de água ao longo do dia",
      "Corte hoje: pão e trigo, leite e iogurte comuns (os sem lactose podem!), cebola e alho, refrigerante e adoçante, feijão e grão de bico",
      "Tempere com gengibre, limão e ervas",
      "Caminhe 15 min (movimenta o intestino)",
      "À noite, registre como se sentiu",
    ],
    meals: {
      cafe: [
        "Ovos mexidos + abacate (¼ pequeno) + chá de gengibre",
        "Mamão + aveia sem glúten + chia",
        "Omelete de espinafre + café",
      ],
      almoco: [
        "Frango grelhado + arroz + abobrinha refogada",
        "Salmão + batata + cenoura assada",
        "Carne magra + arroz + salada de folhas com azeite e limão",
      ],
      jantar: [
        "Sopa de abóbora (kabocha) com gengibre",
        "Peixe grelhado + legumes no vapor",
        "Omelete + salada verde",
      ],
      lanche: [
        "Banana-da-terra cozida",
        "Um punhado de castanhas (até 10)",
        "Cenoura baby com pasta de abobrinha",
      ],
    },
    swaps: [
      { de: "cebola", para: "parte verde da cebolinha" },
      { de: "leite", para: "leite sem lactose ou bebida de arroz" },
      { de: "pão de trigo", para: "tapioca ou pão sem glúten" },
    ],
    completionMessage:
      "Dia 1 feito 🎉 Você tirou o combustível da fermentação — agora é o corpo responder, no ritmo dele.",
  },
  {
    day: 2,
    phase: "Choque",
    lesson: {
      title: "O alho e a cebola: os vilões invisíveis",
      durationMin: 2,
      body: "Alho e cebola são campeões em frutanos — uma fibra que quase ninguém digere bem e que fermenta forte. E estão escondidos em quase tudo. Hoje você aprende a fugir deles sem perder o sabor.",
      cards: [
        {
          heading: "Pequenos, mas poderosos",
          emoji: "🧅",
          body: "Alho e cebola parecem inofensivos, mas são os maiores fermentadores da maioria das pessoas. O “culpado” chama frutano: uma fibra que o seu intestino não absorve e que as bactérias adoram.",
        },
        {
          heading: "Eles se escondem",
          emoji: "🕵️‍♀️",
          body: "O problema não é só o alho do refogado. Frutano está em tempero pronto, caldo em cubo, molho de tomate, salgadinho, sopa de pacote. Por isso a gente vira detetive de rótulo.",
        },
        {
          heading: "O truque do azeite aromatizado",
          emoji: "🫒",
          body: "Doure o alho no azeite, retire o alho e use só o óleo. O frutano não passa pro óleo — então fica todo o sabor, sem o gás. Funciona com cebola também.",
        },
        {
          heading: "Use a parte verde",
          emoji: "🌿",
          body: "A parte verde da cebolinha é liberada e dá aquele toque de cebola sem o frutano. Guarde no lugar da cebola picada.",
        },
      ],
      quiz: [
        {
          question: "O que torna alho e cebola tão “fermentadores”?",
          options: [
            "A gordura",
            "O frutano, uma fibra que fermenta no intestino",
            "O sal",
          ],
          correctIndex: 1,
          explain:
            "Isso! O frutano não é absorvido e vira festa pras bactérias, que produzem gás.",
        },
        {
          question: "Como manter o sabor do alho sem o frutano?",
          options: [
            "Usar o dobro de alho",
            "Comer cru",
            "Dourar o alho no azeite e usar só o óleo",
          ],
          correctIndex: 2,
          explain:
            "Exato. O frutano não passa pro óleo — fica o sabor, sai o gás.",
        },
      ],
    },
    checklist: [
      "Continue sem trigo, leite, feijão, refrigerante e adoçante",
      "Leia o rótulo de 1 produto que você usa sempre (procure “cebola” e “alho”)",
      "Faça um azeite aromatizado: doure alho, descarte e guarde o óleo",
      "Beba água com gengibre e limão",
      "Registre seus sintomas à noite",
    ],
    meals: {
      cafe: [
        "Tapioca com ovo + chá de hortelã",
        "Iogurte sem lactose + morango + chia",
        "Mingau de aveia sem glúten com canela",
      ],
      almoco: [
        "Frango ao azeite aromatizado + arroz + cenoura",
        "Filé de peixe + purê de batata + vagem",
        "Bolinho de carne assado com ervas (sem trigo, sem cebola) + salada de pepino e tomate",
      ],
      jantar: [
        "Caldo de legumes (abóbora, cenoura, chuchu) com gengibre",
        "Omelete de espinafre + arroz",
        "Frango desfiado + abobrinha refogada",
      ],
      lanche: ["Banana (não muito madura)", "Mix de castanhas (até 10)", "Chá gelado de hortelã"],
    },
    swaps: [
      { de: "tempero pronto / caldo em cubo", para: "sal, ervas e azeite aromatizado" },
      { de: "alho in natura", para: "azeite de alho (só o óleo)" },
    ],
    completionMessage:
      "Dois dias! Sua barriga já deve estar reclamando menos à noite 🌙",
  },
  {
    day: 3,
    phase: "Choque",
    lesson: {
      title: "Água, gengibre e movimento: o trio anti-inchaço",
      durationMin: 2,
      body: "Três coisas simples aceleram o desinchaço: água, gengibre e movimento. Não é mágica, é fisiologia — e hoje você sente a diferença.",
      cards: [
        {
          heading: "Água solta o que estava preso",
          emoji: "💧",
          body: "Hidratar pouco pode favorecer a retenção e deixa o intestino mais lento — e fibra sem água prende. Beber bem ao longo do dia ajuda o intestino a se mover e reduz a sensação de peso.",
        },
        {
          heading: "Gengibre acelera a digestão",
          emoji: "🫚",
          body: "O gengibre estimula o estômago a esvaziar mais rápido. Menos comida parada significa menos tempo pra fermentar — ou seja, menos gás.",
        },
        {
          heading: "Movimento move o intestino",
          emoji: "🚶‍♀️",
          body: "Caminhar empurra o intestino mecanicamente e ajuda a liberar gases presos. 15 minutos depois de uma refeição maior já fazem diferença.",
        },
        {
          heading: "Fim da Fase Choque",
          emoji: "🔥",
          body: "Hoje fecha os 3 dias de choque. Você tirou o pé do acelerador da fermentação. A partir de amanhã, a gente começa a descobrir os SEUS gatilhos.",
        },
      ],
      quiz: [
        {
          question: "Por que beber água ajuda contra a retenção?",
          options: [
            "Porque beber pouco faz o corpo segurar líquido; hidratar solta o excesso",
            "Porque enche o estômago",
            "Porque substitui a comida",
          ],
          correctIndex: 0,
          explain:
            "Isso! Pouca água = corpo em modo “economia” segurando líquido. Hidratar reverte isso.",
        },
        {
          question: "Caminhar depois de comer ajuda porque…",
          options: [
            "Queima a refeição",
            "Move o intestino e ajuda a liberar gases",
            "Tira a fome",
          ],
          correctIndex: 1,
          explain:
            "Exato. O movimento empurra o intestino e solta o gás preso.",
        },
      ],
    },
    checklist: [
      "Beba ~2L de água (deixe uma garrafa à vista)",
      "Tome 1 chá de gengibre depois de uma refeição",
      "Caminhe 20 min hoje",
      "Mantenha o corte dos fermentadores",
      "Tire uma foto de progresso (opcional, fica só com você)",
    ],
    meals: {
      cafe: [
        "Ovos + tapioca + mamão",
        "Smoothie de morango com leite sem lactose e chia",
        "Omelete + café",
      ],
      almoco: [
        "Peixe grelhado + arroz + abóbora assada",
        "Frango + batata-doce (½ xícara) + salada verde",
        "Carne + arroz + cenoura e vagem no vapor",
      ],
      jantar: [
        "Sopa de cenoura e gengibre",
        "Tortilha de batata com ovo",
        "Frango + legumes no vapor",
      ],
      lanche: ["Laranja", "Pão sem glúten com pasta de abobrinha", "Punhado de nozes"],
    },
    swaps: [
      { de: "refrigerante / suco de caixinha", para: "água com gás + limão + gengibre" },
      { de: "café com leite comum", para: "café puro ou com leite sem lactose" },
    ],
    completionMessage:
      "Fim da Fase Choque 🔥 Você tirou o pé do acelerador da fermentação. Vem coisa boa.",
  },

  /* --------------------------- REMOVE (4–7) --------------------------- */
  {
    day: 4,
    phase: "Remoção",
    lesson: {
      title: "Agora a gente vira detetive do seu intestino",
      durationMin: 2,
      body: "Nos 3 primeiros dias você acalmou tudo. A partir de agora o objetivo muda: mapear o que é gatilho PRA VOCÊ. E o segredo disso é o registro diário.",
      cards: [
        {
          heading: "Mudou o objetivo",
          emoji: "🕵️‍♀️",
          body: "A fase de choque acalmou seu intestino cortando tudo. Agora a gente entra na fase de descoberta: o que, especificamente, faz mal pra VOCÊ.",
        },
        {
          heading: "Cada corpo é diferente",
          emoji: "🧬",
          body: "O que estufa sua amiga pode não te fazer nada — e vice-versa. Não existe lista universal. Existe a SUA lista, e a gente vai montá-la juntas.",
        },
        {
          heading: "O registro é o segredo",
          emoji: "📝",
          body: "Cada registro cruza o que você comeu com como você se sentiu. Em poucos dias, padrões aparecem (“toda vez que como X, incho”). Isso nenhuma dieta genérica te dá.",
        },
        {
          heading: "Por isso, registre sempre",
          emoji: "🎯",
          body: "Quanto mais você registra, mais preciso fica o seu mapa. É o trabalho mais importante das próximas semanas — e leva 30 segundos.",
        },
      ],
      quiz: [
        {
          question: "Qual o objetivo da fase de Remoção (a partir de agora)?",
          options: [
            "Mapear quais alimentos são gatilho pra você",
            "Continuar cortando tudo pra sempre",
            "Perder peso rápido",
          ],
          correctIndex: 0,
          explain:
            "Isso! Agora é descobrir os SEUS gatilhos — por isso o registro diário é tão importante.",
        },
      ],
    },
    checklist: [
      "Mantenha a base sem trigo, leite comum, cebola, alho e leguminosas",
      "Registre TODAS as refeições hoje (mesmo as pequenas)",
      "Anote a hora em que a barriga incha mais",
      "Beba água ao longo do dia",
      "Durma pelo menos 7h (o intestino se repara dormindo)",
    ],
    meals: {
      cafe: [
        "Iogurte sem lactose + aveia sem glúten + morango",
        "Ovos mexidos + pão sem glúten + mamão",
        "Crepioca (tapioca + ovo) + chá",
      ],
      almoco: [
        "Frango grelhado + quinoa + abobrinha e cenoura",
        "Peixe + arroz + salada de folhas, pepino e tomate",
        "Carne magra + batata + vagem",
      ],
      jantar: [
        "Sopa de abóbora com gengibre + frango desfiado",
        "Omelete recheada de espinafre + arroz",
        "Salmão + purê de batata",
      ],
      lanche: ["Banana com pasta de amendoim sem açúcar", "Kiwi", "Castanha-do-pará (2–3)"],
    },
    swaps: [
      { de: "barrinha de cereal industrializada", para: "banana + castanhas" },
      { de: "molho de tomate pronto", para: "tomate fresco refogado no azeite de alho" },
    ],
    completionMessage:
      "Dia 4 ✅ Seu diário começou a desenhar o seu mapa pessoal de gatilhos.",
  },
  {
    day: 5,
    phase: "Remoção",
    lesson: {
      title: "Nem toda fibra é amiga",
      durationMin: 2,
      body: "“Coma mais fibra” é um conselho incompleto. Tem fibra que acalma e fibra que estufa quando o intestino está irritado. Hoje você aprende a diferença.",
      cards: [
        {
          heading: "“Coma mais fibra” é incompleto",
          emoji: "🌾",
          body: "Fibra é importante, mas existem dois tipos — e eles agem de formas opostas no intestino irritado.",
        },
        {
          heading: "Fibra que acalma (solúvel)",
          emoji: "🥣",
          body: "Aveia, cenoura, chia, banana. As solúveis formam um gel que regula o intestino sem alimentar o gás. São as suas aliadas nesta fase.",
        },
        {
          heading: "Fibra que estufa (por enquanto)",
          emoji: "🥦",
          body: "Repolho cru, couve-flor, brócolis em excesso, certos grãos. Quando o intestino está sensível, elas fermentam e estufam. Não é pra sempre.",
        },
        {
          heading: "A variedade volta",
          emoji: "🌈",
          body: "Na fase de remoção a gente prioriza as fibras suaves. Quando seu intestino estiver calmo, a variedade volta aos poucos.",
        },
      ],
      quiz: [
        {
          question: "Qual fibra ACALMA o intestino irritado?",
          options: [
            "Repolho cru e couve-flor",
            "Nenhuma fibra é boa",
            "As solúveis: aveia, cenoura, chia, banana",
          ],
          correctIndex: 2,
          explain:
            "Isso! As solúveis regulam o intestino sem alimentar o gás.",
        },
      ],
    },
    checklist: [
      "Inclua 1 fonte de fibra solúvel (aveia, chia, cenoura ou banana)",
      "Evite hoje: couve-flor, cogumelos, brócolis em excesso e leguminosas mal cozidas",
      "Continue registrando refeições e sintomas",
      "Beba água (fibra sem água prende mais ainda)",
      "Caminhe 15–20 min",
    ],
    meals: {
      cafe: [
        "Mingau de aveia sem glúten com chia e banana",
        "Ovos + tapioca + mamão",
        "Iogurte sem lactose + morango + sementes de abóbora",
      ],
      almoco: [
        "Frango + arroz + cenoura cozida + abobrinha",
        "Peixe + batata + salada de folhas",
        "Carne + purê de mandioquinha + vagem",
      ],
      jantar: [
        "Creme de cenoura e gengibre",
        "Omelete + arroz + espinafre refogado",
        "Frango + abóbora assada",
      ],
      lanche: ["Banana amassada com chia", "Cenoura baby", "Mamão"],
    },
    swaps: [
      { de: "pão integral de trigo", para: "aveia sem glúten ou pão sem glúten" },
      { de: "granola com mel e trigo", para: "aveia sem glúten + sementes" },
    ],
    completionMessage: "Dia 5 ✅ Você está aprendendo a escolher fibra a seu favor.",
  },
  {
    day: 6,
    phase: "Remoção",
    lesson: {
      title: "Intestino e pele: por que sua pele melhora junto",
      durationMin: 2,
      body: "Você pode notar a pele mais viva nesses dias — e não é coincidência. Existe o eixo intestino-pele, e ele explica esse bônus.",
      cards: [
        {
          heading: "Um bônus que aparece no espelho",
          emoji: "✨",
          body: "Muita gente repara a pele mais viva nas primeiras semanas. Faz sentido: seu intestino e sua pele conversam.",
        },
        {
          heading: "O eixo intestino-pele",
          emoji: "🔗",
          body: "Quando o intestino está inflamado e fermentando, ele libera sinais inflamatórios que circulam pelo corpo e aparecem na pele: oleosidade, opacidade, espinhas.",
        },
        {
          heading: "Acalmar o intestino acalma a pele",
          emoji: "🌿",
          body: "Ao reduzir a fermentação, você baixa essa inflamação de baixo grau. A pele responde — fica mais uniforme e com mais viço.",
        },
        {
          heading: "Repare hoje",
          emoji: "🪞",
          body: "Dê uma olhada no espelho e compare com o Dia 1. Pode ser sutil — e tudo bem: pele responde no ritmo dela. O que importa é o que está mudando por dentro.",
        },
      ],
      quiz: [
        {
          question: "Por que a pele melhora ao cuidar do intestino?",
          options: [
            "Por causa de cremes",
            "O intestino inflamado gera sinais que aparecem na pele; acalmá-lo reduz isso",
            "É só impressão",
          ],
          correctIndex: 1,
          explain:
            "Isso! É o eixo intestino-pele: menos inflamação no intestino, pele mais viva.",
        },
      ],
    },
    checklist: [
      "Mantenha a base anti-inchaço",
      "Capriche na hidratação (água + chás)",
      "Inclua uma fonte de ômega-3 (sardinha, salmão, chia ou linhaça)",
      "Registre como está sua pele e energia hoje",
      "Durma cedo",
    ],
    meals: {
      cafe: [
        "Ovos + abacate (¼ pequeno) + chá verde",
        "Vitamina de mamão com leite sem lactose e linhaça",
        "Crepioca + chá de hortelã",
      ],
      almoco: [
        "Sardinha ou salmão + arroz + salada de folhas",
        "Frango + batata-doce (½ xícara) + abobrinha",
        "Carne + arroz + cenoura no vapor",
      ],
      jantar: [
        "Salmão + purê de batata + vagem",
        "Sopa de abóbora + frango desfiado",
        "Omelete + salada verde",
      ],
      lanche: ["Mix de nozes e castanhas (até 10)", "Laranja", "Iogurte sem lactose"],
    },
    swaps: [
      { de: "frituras e ultraprocessados", para: "assados, grelhados e azeite cru" },
      { de: "chocolate ao leite", para: "chocolate 70%+ (1–2 quadradinhos)" },
    ],
    completionMessage: "Dia 6 ✅ Amanhã é dia de comemorar: 1 semana inteira 💚",
  },
  {
    day: 7,
    phase: "Remoção",
    milestone: "1 semana completa",
    lesson: {
      title: "1 semana! Olha só o que você já conquistou",
      durationMin: 2,
      body: "Sete dias atrás você vivia estufada e não sabia por quê. Hoje é diferente. Esse é o seu primeiro grande marco — vamos comemorar.",
      cards: [
        {
          heading: "Há 7 dias…",
          emoji: "📅",
          body: "Sua barriga vivia estufada, principalmente à noite, e você não sabia o motivo. Parecia “normal”. Spoiler: não era.",
        },
        {
          heading: "O que você já fez",
          emoji: "💪",
          body: "Tirou os maiores fermentadores e começou a mapear seus gatilhos. Se a barriga já está mais leve, ótimo. Se ainda não, seus registros desta semana são exatamente o que vai revelar o porquê.",
        },
        {
          heading: "Guarde essa sensação",
          emoji: "💚",
          body: "Esse é o seu primeiro grande marco. Ela é a prova de que viver inchada não era o seu normal — era um problema com solução.",
        },
        {
          heading: "O que vem agora",
          emoji: "🔍",
          body: "Na próxima fase começa a melhor parte: descobrir exatamente o que você PODE voltar a comer. A reintrodução é o que te dá liberdade.",
        },
      ],
      quiz: [
        {
          question: "O que vem na próxima fase (reintrodução)?",
          options: [
            "Cortar ainda mais alimentos",
            "Parar o programa",
            "Descobrir o que você pode voltar a comer, testando um grupo por vez",
          ],
          correctIndex: 2,
          explain:
            "Isso! A reintrodução devolve a liberdade: você testa e descobre o que tolera.",
        },
      ],
    },
    checklist: [
      "Releia seus registros da semana: vê algum padrão?",
      "Compare como você se sente hoje x no Dia 1",
      "Tire uma foto de progresso (opcional)",
      "Comemore de um jeito que não seja comida 🎉",
      "Prepare-se: amanhã começa a reintrodução",
    ],
    meals: {
      cafe: [
        "Panqueca de banana e ovo + chá",
        "Iogurte sem lactose + morango + aveia sem glúten",
        "Ovos + tapioca + mamão",
      ],
      almoco: [
        "Seu almoço favorito da semana (o que caiu melhor)",
        "Frango + arroz + legumes no vapor",
        "Peixe + batata + salada",
      ],
      jantar: [
        "Sopa reconfortante de abóbora e gengibre",
        "Omelete + salada verde",
        "Frango + abobrinha",
      ],
      lanche: ["Fruta da estação (low FODMAP)", "Castanhas", "Gelatina incolor com suco de uva natural"],
    },
    completionMessage:
      "1 SEMANA 🏆 Você cortou os maiores fermentadores e começou seu mapa. Se o inchaço já caiu, comemora; se ainda não, seus registros são o caminho.",
  },

  /* ------------------------ REINTRODUÇÃO (8–11) ------------------------ */
  {
    day: 8,
    phase: "Reintrodução",
    lesson: {
      title: "Reintrodução: a parte que te dá liberdade",
      durationMin: 2,
      body: "A reintrodução é o que te devolve a comida sem medo. A regra de ouro: testar um grupo por vez. Hoje você testa a lactose.",
      cards: [
        {
          heading: "O erro que quase todo mundo comete",
          emoji: "🚫",
          body: "Achar que precisa cortar tudo pra sempre. Errado! Agora que seu intestino acalmou, a gente DEVOLVE os alimentos, um grupo de cada vez.",
        },
        {
          heading: "A regra de ouro",
          emoji: "🔑",
          body: "Teste UM grupo FODMAP por dia, em porção pequena, e observe. Se testar dois ao mesmo tempo, você não sabe quem foi o culpado.",
        },
        {
          heading: "Hoje: teste da lactose",
          emoji: "🥛",
          body: "Coma uma porção de derivado do leite comum (½ copo de leite ou 1 potinho de iogurte) e observe por até 6h. Sem inchar? Lactose não é seu problema. Inchou? Achamos um gatilho.",
        },
        {
          heading: "Anote a reação",
          emoji: "📊",
          body: "No card \u201cTeste de hoje\u201d você registra como o corpo reagiu (de tolerei bem a forte). Cada teste é uma peça do seu Mapa de Tolerância — o que nenhuma dieta genérica te dá.",
        },
      ],
      quiz: [
        {
          question: "Qual a regra de ouro da reintrodução?",
          options: [
            "Testar um grupo por vez, em porção pequena, observando",
            "Testar vários grupos no mesmo dia pra ir mais rápido",
            "Voltar a comer tudo de uma vez",
          ],
          correctIndex: 0,
          explain:
            "Isso! Um grupo por vez — senão você não sabe qual causou a reação.",
        },
      ],
    },
    checklist: [
      "Mantenha o resto da base low FODMAP",
      "TESTE LACTOSE: 1 porção de leite ou iogurte comum hoje",
      "Observe a barriga, gases e intestino por até 6h",
      "Registre no card \u201cTeste de hoje\u201d como seu corpo reagiu",
      "Não teste mais nenhum grupo novo hoje",
    ],
    meals: {
      cafe: [
        "Iogurte COMUM + morango + aveia sem glúten (teste de lactose)",
        "Café com leite comum + tapioca com ovo (teste de lactose)",
        "Ovos + pão sem glúten (se preferir testar no almoço)",
      ],
      almoco: [
        "Frango + arroz + cenoura e abobrinha",
        "Peixe + batata + salada de folhas",
        "Carne + arroz + vagem",
      ],
      jantar: [
        "Sopa de abóbora + frango desfiado",
        "Omelete + salada verde",
        "Salmão + purê de batata",
      ],
      lanche: ["Banana", "Castanhas", "Laranja"],
    },
    completionMessage:
      "Dia 8 ✅ Primeiro grupo testado! Seu mapa está ficando pessoal de verdade.",
  },
  {
    day: 9,
    phase: "Reintrodução",
    lesson: {
      title: "Teste da frutose: o açúcar das frutas",
      durationMin: 2,
      body: "Hoje o teste é a frutose — o açúcar de algumas frutas e do mel, que parte das pessoas absorve mal.",
      cards: [
        {
          heading: "Nem toda fruta é leve",
          emoji: "🍯",
          body: "Algumas frutas e o mel têm frutose em excesso. Quem absorve mal sente o inchaço chegar logo depois. É o grupo de hoje.",
        },
        {
          heading: "Um teste de cada vez",
          emoji: "🔄",
          body: "Se a lactose de ontem não te incomodou, ótimo — siga. Se incomodou, volte ao leite sem lactose e teste a frutose assim mesmo. São grupos diferentes, então o resultado de um não muda o outro.",
        },
        {
          heading: "Como testar hoje",
          emoji: "🥭",
          body: "Coma uma porção rica em frutose (½ manga OU 1 colher de mel) e observe nas horas seguintes. Registre a reação no card \u201cTeste de hoje\u201d.",
        },
        {
          heading: "Você está montando a SUA lista",
          emoji: "📋",
          body: "A cada teste, a sua lista pessoal fica mais clara: o que pode à vontade, o que com moderação, o que evitar. Isso é seu pra sempre.",
        },
      ],
      quiz: [
        {
          question: "Onde a frutose “escondida” costuma aparecer?",
          options: [
            "Em carnes e ovos",
            "Em algumas frutas (manga, melancia) e no mel",
            "No arroz",
          ],
          correctIndex: 1,
          explain:
            "Isso! Frutose em excesso aparece em certas frutas e no mel — por isso o teste de hoje.",
        },
      ],
    },
    checklist: [
      "Mantenha fora até os grupos que passaram — eles voltam de vez no fim dos testes",
      "TESTE FRUTOSE: ½ manga OU 1 colher de mel hoje",
      "Observe a reação por algumas horas",
      "Registre a reação no card \u201cTeste de hoje\u201d",
      "Beba água e caminhe",
    ],
    meals: {
      cafe: [
        "Iogurte (sem lactose se não tolerou) + ½ manga (teste de frutose)",
        "Tapioca com ovo + chá",
        "Aveia sem glúten + morango",
      ],
      almoco: [
        "Frango + arroz + abobrinha",
        "Peixe + batata-doce (½ xícara) + salada",
        "Carne + quinoa + cenoura",
      ],
      jantar: [
        "Sopa de cenoura e gengibre",
        "Omelete + arroz + espinafre",
        "Frango + abóbora assada",
      ],
      lanche: ["1 colher de mel no iogurte (se for o teste)", "Castanhas", "Kiwi"],
    },
    completionMessage:
      "Dia 9 ✅ Mais um grupo no mapa. Você já sabe mais do seu corpo do que ontem.",
  },
  {
    day: 10,
    phase: "Reintrodução",
    lesson: {
      title: "O grande teste: trigo, cebola e alho (frutanos)",
      durationMin: 2,
      body: "Chegou o teste mais importante de todos. Frutano é o gatilho nº1 de inchaço — e está no trigo, na cebola e no alho.",
      cards: [
        {
          heading: "O gatilho nº1",
          emoji: "🏆",
          body: "Frutano é o que mais incha gente no mundo. Por isso este é o teste mais valioso da reintrodução — o resultado de hoje vale ouro.",
        },
        {
          heading: "Glúten ou frutano?",
          emoji: "🍞",
          body: "Muita gente acha que tem “problema com glúten”, mas descobre aqui que o vilão era o frutano do trigo. São coisas diferentes — e esse teste esclarece.",
        },
        {
          heading: "Como testar com cuidado",
          emoji: "🧪",
          body: "Escolha UMA fonte: uma fatia de pão de trigo OU um prato com cebola refogada. Observe bem — o frutano costuma reagir mais forte e pode demorar mais.",
        },
        {
          heading: "Seja honesta no registro",
          emoji: "✍️",
          body: "Registre a reação no card \u201cTeste de hoje\u201d. Se reagir forte, volte à base amanhã sem culpa. Saber disso muda completamente as suas escolhas.",
        },
      ],
      quiz: [
        {
          question: "O “problema com glúten” de muita gente é, na verdade…",
          options: [
            "Frutano — uma fibra do trigo que fermenta",
            "Falta de vitamina",
            "Excesso de água",
          ],
          correctIndex: 0,
          explain:
            "Isso! Muita gente reage ao frutano do trigo, não ao glúten — por isso este teste vale ouro.",
        },
      ],
    },
    checklist: [
      "Mantenha os grupos que já passaram",
      "TESTE FRUTANO: 1 fatia de pão de trigo OU cebola refogada (escolha um)",
      "Observe com atenção (frutano costuma reagir mais)",
      "Registre a reação no card \u201cTeste de hoje\u201d",
      "Se reagir forte, volte à base e siga amanhã sem culpa",
    ],
    meals: {
      cafe: [
        "Pão de trigo + ovo (teste de frutano)",
        "Tapioca com ovo (se quiser testar no almoço)",
        "Aveia sem glúten + banana",
      ],
      almoco: [
        "Frango com cebola refogada + arroz (teste de frutano)",
        "Peixe + batata + salada",
        "Carne + arroz + cenoura",
      ],
      jantar: [
        "Sopa de abóbora + frango",
        "Omelete + salada verde",
        "Salmão + purê de batata",
      ],
      lanche: ["Banana", "Castanhas", "Laranja"],
    },
    completionMessage:
      "Dia 10 ✅ Você testou o gatilho mais comum de todos. Isso muda o jogo.",
  },
  {
    day: 11,
    phase: "Reintrodução",
    lesson: {
      title: "Leguminosas e polióis: os últimos testes",
      durationMin: 2,
      body: "Faltam dois grupos pra fechar seu mapa: leguminosas (GOS) e polióis. Hoje você completa a reintrodução.",
      cards: [
        {
          heading: "Reta final da descoberta",
          emoji: "🏁",
          body: "Hoje você escolhe UM dos dois últimos grupos — o que mais aparece na sua rotina. O outro você testa na Manutenção. Um por vez, como nos dias anteriores.",
        },
        {
          heading: "Leguminosas (GOS) — tem truque",
          emoji: "🫘",
          body: "Feijão, grão-de-bico e lentilha têm GOS, uma fibra que fermenta. Mas o segredo é a dose: bem cozidas e em porção pequena (2–3 colheres), muita gente tolera bem.",
        },
        {
          heading: "Polióis — os “sem açúcar”",
          emoji: "🍎",
          body: "Polióis estão em frutas como maçã e pera e nos adoçantes diet (sorbitol, xilitol). Pra testar sem confundir com frutose, use couve-flor ou cogumelos — manitol puro.",
        },
        {
          heading: "Seu mapa está pronto",
          emoji: "🗺️",
          body: "Ao fim de hoje, a primeira versão do seu mapa está pronta: você testou os grupos mais comuns. O que ficou de fora (e doses maiores dos outros) você testa na Manutenção, com calma — o mapa é vivo, não definitivo.",
        },
      ],
      quiz: [
        {
          question: "Qual o truque pra tolerar melhor as leguminosas?",
          options: [
            "Comer cruas",
            "Comer em jejum",
            "Bem cozidas e em porção pequena",
          ],
          correctIndex: 2,
          explain:
            "Isso! Bem cozidas e em pouca quantidade, muita gente tolera o GOS sem inchar.",
        },
      ],
    },
    checklist: [
      "Escolha UM teste hoje — LEGUMINOSA: 2–3 colheres de feijão bem cozido; ou POLIÓIS: 1 xícara de couve-flor cozida ou cogumelos refogados",
      "Se ontem você reagiu forte, espere 1 dia com a base calma antes deste teste",
      "Observe e registre a reação (1 a 5)",
      "Reúna seus resultados da semana de reintrodução",
      "Beba água e caminhe",
    ],
    meals: {
      cafe: [
        "Ovos + tapioca + mamão",
        "Iogurte (tolerado) + aveia sem glúten + morango",
        "Crepioca + chá",
      ],
      almoco: [
        "Arroz + 2–3 colheres de feijão (teste) + frango + salada",
        "Peixe + batata + cenoura",
        "Carne + quinoa + abobrinha",
      ],
      jantar: [
        "Sopa de abóbora + frango desfiado",
        "Omelete + salada verde",
        "Frango + legumes no vapor",
      ],
      lanche: ["½ maçã (se for o teste de polióis)", "Castanhas", "Kiwi"],
    },
    completionMessage:
      "Dia 11 ✅ Primeira rodada de testes completa! Seu mapa de tolerância já começou — e segue ficando mais preciso.",
  },

  /* ----------------------------- REPAIR (12–14) ----------------------------- */
  {
    day: 12,
    phase: "Reparo",
    lesson: {
      title: "Reparar a parede do intestino",
      durationMin: 2,
      body: "Acalmou, mapeou — agora a gente repara. Alguns nutrientes ajudam a recompor a parede do seu intestino. E não é sobre suplemento caro.",
      cards: [
        {
          heading: "A barreira do intestino",
          emoji: "🧱",
          body: "A parede do intestino é uma barreira que separa o que entra no corpo do que não deve entrar. Com o tempo e a irritação, ela pode ficar mais frágil. Agora a gente reforça.",
        },
        {
          heading: "Glutamina e zinco",
          emoji: "🥚",
          body: "A glutamina (ovos, carnes, caldo de osso) é “combustível” pras células do intestino. O zinco (carne, sementes de abóbora) ajuda na regeneração. Coloque no prato com constância.",
        },
        {
          heading: "Ômega-3 acalma",
          emoji: "🐟",
          body: "Peixes, chia e linhaça trazem ômega-3, que reduz inflamação. Menos inflamação = parede mais saudável e menos sintoma.",
        },
        {
          heading: "Comida, não cápsula",
          emoji: "🍽️",
          body: "Não precisa de suplemento caro. O reparo vem de colocar esses alimentos no prato com regularidade — simples assim.",
        },
      ],
      quiz: [
        {
          question: "Quais nutrientes ajudam a reparar a parede do intestino?",
          options: [
            "Açúcar e cafeína",
            "Glutamina, zinco e ômega-3 (de comida comum)",
            "Só suplementos caros",
          ],
          correctIndex: 1,
          explain:
            "Isso! E o melhor: vêm de ovos, carnes, sementes e peixes — comida de verdade.",
        },
      ],
    },
    checklist: [
      "Inclua uma fonte de glutamina (ovos, carne ou caldo de osso)",
      "Inclua zinco (carne, sementes de abóbora)",
      "Inclua ômega-3 (peixe, chia ou linhaça)",
      "Mantenha só os alimentos que você tolerou bem",
      "Hidrate e durma bem",
    ],
    meals: {
      cafe: [
        "Ovos + abacate (¼ pequeno) + chá",
        "Iogurte (tolerado) + chia + morango",
        "Crepioca + sementes de abóbora",
      ],
      almoco: [
        "Caldo de osso + carne + arroz + cenoura",
        "Salmão + batata + salada de folhas",
        "Frango + quinoa + abobrinha",
      ],
      jantar: [
        "Sopa nutritiva de legumes com frango desfiado",
        "Peixe + purê de batata-doce (porção pequena)",
        "Omelete + salada verde + azeite",
      ],
      lanche: ["Sementes de abóbora", "Castanha-do-pará (2–3)", "Iogurte (tolerado)"],
    },
    completionMessage: "Dia 12 ✅ Você está reconstruindo de dentro pra fora.",
  },
  {
    day: 13,
    phase: "Reparo",
    lesson: {
      title: "Reequilibrar as bactérias boas",
      durationMin: 2,
      body: "Seu intestino abriga trilhões de bactérias — e as boas adoram dois tipos de comida. Hoje você aprende a alimentar o time certo.",
      cards: [
        {
          heading: "Um ecossistema vivo",
          emoji: "🦠",
          body: "Seu intestino é morada de trilhões de bactérias. Quando as boas estão fortes, a digestão flui e a imunidade agradece. Vamos cuidar delas.",
        },
        {
          heading: "Prebióticos: a comida delas",
          emoji: "🌾",
          body: "Prebióticos são fibras que alimentam as bactérias boas (aveia, banana, um pouco de cebolinha). Pense neles como o adubo do seu jardim interno.",
        },
        {
          heading: "Probióticos: reforços",
          emoji: "🫙",
          body: "Fermentados como iogurte tolerado, kefir e chucrute trazem bactérias boas de fora. Repõem o time.",
        },
        {
          heading: "Devagar e sempre",
          emoji: "🐢",
          body: "Saindo de uma fase low FODMAP, comece com porções pequenas. Reequilibrar é construir aos poucos — exagerar de uma vez pode estufar de novo.",
        },
      ],
      quiz: [
        {
          question: "Saindo da fase low FODMAP, como introduzir fermentados?",
          options: [
            "Tudo de uma vez pra acelerar",
            "Nunca mais comer fermentados",
            "Aos poucos, em porções pequenas",
          ],
          correctIndex: 2,
          explain:
            "Isso! Devagar — reequilibrar é construção, não choque.",
        },
      ],
    },
    checklist: [
      "Inclua um fermentado em porção pequena (iogurte/kefir tolerado)",
      "Adicione uma fibra prebiótica suave (banana verde cozida, aveia)",
      "Continue respeitando seus gatilhos identificados",
      "Registre como o intestino respondeu",
      "Caminhe e hidrate",
    ],
    meals: {
      cafe: [
        "Iogurte/kefir (porção pequena) + aveia sem glúten + banana",
        "Ovos + tapioca + mamão",
        "Vitamina de morango com chia",
      ],
      almoco: [
        "Frango + arroz + cenoura + um pouco de chucrute",
        "Peixe + batata + salada",
        "Carne + quinoa + abobrinha",
      ],
      jantar: [
        "Sopa de abóbora + frango",
        "Omelete + salada verde",
        "Salmão + purê de batata-doce (porção pequena)",
      ],
      lanche: ["Banana com chia", "Castanhas", "Iogurte tolerado"],
    },
    completionMessage: "Dia 13 ✅ Quase lá. Amanhã seu mapa fica pronto 🗺️",
  },
  {
    day: 14,
    phase: "Reparo",
    milestone: "Desafio concluído",
    lesson: {
      title: "Seu mapa pessoal está pronto 🗺️",
      durationMin: 2,
      body: "Catorze dias atrás você não sabia por que vivia estufada. Hoje você tem o SEU mapa — algo que nenhuma dieta genérica entrega.",
      cards: [
        {
          heading: "Olha o quanto você andou",
          emoji: "🗺️",
          body: "Há 14 dias, viver inchada parecia normal e sem explicação. Agora você entende seu corpo: o que acalma, o que é gatilho, o que pode voltar sem medo.",
        },
        {
          heading: "Não é mais restrição",
          emoji: "🕊️",
          body: "A partir daqui é escolha consciente, não proibição. Você não depende mais de adivinhação — tem informação sobre o SEU corpo.",
        },
        {
          heading: "Seu cardápio de saída",
          emoji: "🍽️",
          body: "Simples: base nos alimentos que caíram bem + os grupos que você tolerou + atenção (não medo) nos seus gatilhos. Esse é o seu jeito de comer com leveza.",
        },
        {
          heading: "Manutenção é o segredo",
          emoji: "♾️",
          body: "O que impede de voltar a inchar é manter o ritmo. A gente segue com você no Modo Manutenção — e nos desafios mensais. Parabéns: isso é pra vida.",
        },
      ],
      quiz: [
        {
          question: "Depois dos 14 dias, o que impede de voltar a inchar?",
          options: [
            "Manter o ritmo (manutenção) com escolhas conscientes",
            "Cortar tudo de novo",
            "Nada, o problema sempre volta",
          ],
          correctIndex: 0,
          explain:
            "Isso! Manutenção é o que segura a leveza — e você não está sozinha nisso.",
        },
      ],
    },
    checklist: [
      "Liste seus 3 maiores gatilhos identificados",
      "Liste 5 alimentos que caíram muito bem com você",
      "Monte seu “cardápio de saída” com essa base",
      "Compare sua barriga e energia com o Dia 1",
      "Decida: seguir pro Reset Profundo (21 dias) ou Manutenção?",
    ],
    meals: {
      cafe: [
        "Seu café da manhã favorito do desafio",
        "Ovos + tapioca + fruta tolerada",
        "Iogurte tolerado + aveia + sementes",
      ],
      almoco: [
        "Prato-base: proteína + arroz + legumes que você tolera",
        "Peixe + batata + salada",
        "Frango + quinoa + abobrinha",
      ],
      jantar: [
        "Algo leve e reconfortante que você já sabe que cai bem",
        "Sopa de legumes + proteína",
        "Omelete + salada verde",
      ],
      lanche: ["Suas frutas e castanhas toleradas", "Iogurte tolerado", "Gelatina incolor com suco de uva natural"],
    },
    completionMessage:
      "DESAFIO CONCLUÍDO 🏆🗺️ Você tem seu mapa. Agora é manter a leveza — e a gente segue com você.",
  },

  /* ------------------- RESET PROFUNDO · Rebalance (15–21) ------------------- */
  {
    day: 15,
    phase: "Reequilíbrio",
    lesson: {
      title: "Reset Profundo: agora a gente cuida do todo",
      durationMin: 2,
      body: "Você mapeou a comida. Mas o intestino também responde a sono, estresse e movimento. Nestes 7 dias a gente afina esses pilares.",
      cards: [
        {
          heading: "Comida é só metade",
          emoji: "🧩",
          body: "Você já sabe o que comer e o que evitar. Mas o intestino também responde a sono, estresse e movimento — o eixo intestino-cérebro.",
        },
        {
          heading: "O ajuste fino",
          emoji: "🎚️",
          body: "Nestes 7 dias a gente afina esses três pilares pra consolidar tudo que você conquistou. É a diferença entre desinchar e FICAR desinchada.",
        },
        {
          heading: "Pequenos hábitos, grande efeito",
          emoji: "🌙",
          body: "Não precisa virar atleta nem monge. Pequenos ajustes de sono, respiração e movimento já mudam muito como seu intestino funciona.",
        },
      ],
      quiz: [
        {
          question: "Além da comida, o que mais afeta o intestino?",
          options: [
            "Nada, só comida importa",
            "Sono, estresse e movimento (eixo intestino-cérebro)",
            "A fase da lua",
          ],
          correctIndex: 1,
          explain:
            "Isso! Sono, estresse e movimento conversam direto com o intestino.",
        },
      ],
    },
    checklist: [
      "Mantenha sua base de alimentos tolerados",
      "Durma e acorde em horários parecidos",
      "Caminhe 20–30 min",
      "Registre sono e estresse hoje",
    ],
    meals: {
      cafe: ["Ovos + abacate (¼ pequeno) + chá", "Iogurte tolerado + aveia + frutas low FODMAP", "Crepioca + chá de hortelã"],
      almoco: ["Proteína + arroz + legumes tolerados", "Peixe + batata + salada", "Frango + quinoa + abobrinha"],
      jantar: ["Sopa leve de legumes + proteína", "Salmão + purê de batata-doce (porção pequena)", "Omelete + salada verde"],
      lanche: ["Frutas toleradas", "Castanhas", "Iogurte tolerado"],
    },
    completionMessage: "Dia 15 ✅ Começou o ajuste fino do seu corpo todo.",
  },
  {
    day: 16,
    phase: "Reequilíbrio",
    lesson: {
      title: "Sono: a faxina noturna do intestino",
      durationMin: 2,
      body: "Enquanto você dorme, o intestino faz uma faxina. Dormir mal trava essa limpeza e favorece o inchaço.",
      cards: [
        {
          heading: "A faxina da madrugada",
          emoji: "🧹",
          body: "Entre as refeições — e principalmente na madrugada, quando você fica horas sem comer — o intestino liga um modo faxina (o complexo motor migratório) que varre restos e bactérias. Dormir bem e jantar cedo dão espaço pra essa limpeza acontecer.",
        },
        {
          heading: "Sono ruim, faxina travada",
          emoji: "😴",
          body: "Dormir mal interrompe essa limpeza — e isso favorece o inchaço e o desconforto no dia seguinte. Sono é cuidado intestinal.",
        },
        {
          heading: "Higiene do sono hoje",
          emoji: "🌙",
          body: "Menos tela à noite, quarto escuro, e um ritmo regular (dormir e acordar em horários parecidos). Pequenos ajustes, grande diferença.",
        },
      ],
      quiz: [
        {
          question: "Por que o sono ajuda o intestino?",
          options: [
            "Dormindo, o intestino faz uma “faxina” que varre restos",
            "Não ajuda",
            "Porque você para de comer",
          ],
          correctIndex: 0,
          explain:
            "Isso! Dormir bem libera a limpeza noturna do intestino.",
        },
      ],
    },
    checklist: [
      "Desligue telas 30 min antes de dormir",
      "Última refeição pelo menos 2h antes de deitar",
      "Chá de camomila ou hortelã à noite",
      "Registre como dormiu",
    ],
    meals: {
      cafe: ["Mingau de aveia sem glúten + banana", "Ovos + tapioca", "Iogurte tolerado + sementes"],
      almoco: ["Frango + arroz + cenoura", "Peixe + batata + salada", "Carne magra + quinoa + vagem"],
      jantar: ["Jantar leve: sopa + proteína (cedo)", "Omelete + salada", "Peixe + legumes no vapor"],
      lanche: ["Banana", "Castanhas", "Chá de camomila"],
    },
    completionMessage: "Dia 16 ✅ Sono cuidado é intestino que se repara sozinho.",
  },
  {
    day: 17,
    phase: "Reequilíbrio",
    lesson: {
      title: "Estresse: respirar muda sua digestão",
      durationMin: 2,
      body: "Em dias tensos a barriga estufa — e tem explicação. A boa notícia: dá pra desligar isso conscientemente, com respiração.",
      cards: [
        {
          heading: "Estresse desliga a digestão",
          emoji: "🌪️",
          body: "Sob estresse, o corpo entra em “luta ou fuga” e a digestão simplesmente para. Por isso a barriga estufa justo nos dias mais tensos.",
        },
        {
          heading: "O nervo vago é o interruptor",
          emoji: "🧘‍♀️",
          body: "A respiração lenta ativa o nervo vago, que liga o “modo digestão” (descanso). Você consegue, conscientemente, tirar o corpo do modo alerta.",
        },
        {
          heading: "5 minutos antes de comer",
          emoji: "🫁",
          body: "Hoje, antes de uma refeição, respire fundo e devagar por 5 minutos. Coma com calma, sem tela. Seu intestino digere muito melhor assim.",
        },
      ],
      quiz: [
        {
          question: "Como a respiração lenta ajuda a digestão?",
          options: [
            "Não ajuda",
            "Faz emagrecer",
            "Ativa o nervo vago e liga o “modo digestão”",
          ],
          correctIndex: 2,
          explain:
            "Isso! Respirar devagar tira o corpo do alerta e liga a digestão.",
        },
      ],
    },
    checklist: [
      "Antes de uma refeição, respire fundo por 5 min",
      "Coma com calma, sem tela, mastigando bem",
      "Faça uma pausa de 10 min no dia só pra você",
      "Registre seu nível de estresse",
    ],
    meals: {
      cafe: ["Ovos + abacate + chá", "Iogurte tolerado + aveia + morango", "Crepioca + café"],
      almoco: ["Proteína + arroz + legumes", "Peixe + batata + salada", "Frango + quinoa"],
      jantar: ["Sopa reconfortante + proteína", "Omelete + salada", "Salmão + purê"],
      lanche: ["Frutas toleradas", "Castanhas", "Chá"],
    },
    completionMessage: "Dia 17 ✅ Você ensinou seu corpo a digerir em paz.",
  },
  {
    day: 18,
    phase: "Reequilíbrio",
    lesson: {
      title: "Movimento: o empurrãozinho que o intestino ama",
      durationMin: 2,
      body: "Não precisa de academia. Caminhar já estimula o intestino e libera gases presos — principalmente depois de comer.",
      cards: [
        {
          heading: "Esquece a academia pesada",
          emoji: "🚶‍♀️",
          body: "Caminhar já basta. O movimento estimula o intestino a se mexer e ajuda a liberar os gases que ficam presos.",
        },
        {
          heading: "Depois de comer é ouro",
          emoji: "🍽️",
          body: "A caminhada logo após uma refeição maior é especialmente boa contra o inchaço pós-comida — empurra a digestão pra frente.",
        },
        {
          heading: "10–15 min hoje",
          emoji: "⏱️",
          body: "Inclua uma caminhada leve depois do almoço ou jantar. Repare como a barriga responde. Constância vale mais que intensidade.",
        },
      ],
      quiz: [
        {
          question: "Qual o melhor momento pra caminhar contra o inchaço?",
          options: [
            "Só em jejum",
            "Logo depois de uma refeição maior",
            "Só de manhã cedo",
          ],
          correctIndex: 1,
          explain:
            "Isso! Caminhar após comer empurra a digestão e reduz o inchaço pós-refeição.",
        },
      ],
    },
    checklist: [
      "Caminhe 10–15 min após o almoço ou jantar",
      "Inclua um alongamento de torção suave",
      "Mantenha a hidratação",
      "Registre como a barriga respondeu",
    ],
    meals: {
      cafe: ["Panqueca de banana + ovo", "Ovos + tapioca + mamão", "Iogurte tolerado + aveia"],
      almoco: ["Frango + arroz + abobrinha", "Peixe + batata-doce (½ xícara) + salada", "Carne + quinoa + cenoura"],
      jantar: ["Sopa + proteína", "Omelete + salada", "Peixe + legumes"],
      lanche: ["Banana", "Castanhas", "Kiwi"],
    },
    completionMessage: "Dia 18 ✅ Mexer o corpo é mexer o intestino. Sentiu?",
  },
  {
    day: 19,
    phase: "Reequilíbrio",
    lesson: {
      title: "Reforçando o que você tolera",
      durationMin: 2,
      body: "Você já sabe muito sobre o seu corpo. Hoje a gente reforça a variedade DENTRO do que cai bem — porque variar fortalece a microbiota.",
      cards: [
        {
          heading: "Variedade é força",
          emoji: "🌈",
          body: "Quanto mais variados forem os alimentos que você tolera, mais diversa e forte fica a sua microbiota. Diversidade é sinônimo de intestino saudável.",
        },
        {
          heading: "Não é comer pouco",
          emoji: "🍲",
          body: "Manutenção nunca foi sobre restringir. É sobre comer bem e variado DENTRO do seu mapa — explorando tudo que cai bem com você.",
        },
        {
          heading: "Inclua algo novo hoje",
          emoji: "✨",
          body: "Coloque no prato um alimento tolerado que você não come há dias. Capriche nas cores. Seu jardim interno agradece a variedade.",
        },
      ],
      quiz: [
        {
          question: "Por que variar os alimentos tolerados é bom?",
          options: [
            "Pra comer menos",
            "Não faz diferença",
            "Porque a variedade fortalece e diversifica a microbiota",
          ],
          correctIndex: 2,
          explain:
            "Isso! Microbiota diversa = intestino mais forte.",
        },
      ],
    },
    checklist: [
      "Inclua um alimento tolerado que você não come há dias",
      "Capriche em cores no prato (legumes variados)",
      "Mantenha sono e movimento",
      "Registre seus sintomas",
    ],
    meals: {
      cafe: ["Ovos + abacate + frutas", "Iogurte tolerado + aveia + sementes", "Crepioca + chá"],
      almoco: ["Bowl colorido: proteína + arroz + legumes variados", "Peixe + batata + salada", "Frango + quinoa + abóbora"],
      jantar: ["Sopa de legumes variados + proteína", "Salmão + purê", "Omelete + salada"],
      lanche: ["Frutas toleradas variadas", "Castanhas", "Iogurte tolerado"],
    },
    completionMessage: "Dia 19 ✅ Variedade é força pra sua microbiota.",
  },
  {
    day: 20,
    phase: "Reequilíbrio",
    lesson: {
      title: "Montando sua rotina de manutenção",
      durationMin: 2,
      body: "Amanhã o Reset acaba — mas a leveza fica, se você tiver uma rotina simples. Hoje você desenha a sua.",
      cards: [
        {
          heading: "A leveza precisa de rotina",
          emoji: "📿",
          body: "Não é mágica nem força de vontade infinita. O que mantém a barriga leve é uma rotina simples, do seu jeito.",
        },
        {
          heading: "A receita da manutenção",
          emoji: "🧾",
          body: "Base de alimentos que caem bem + os grupos que você tolera + atenção (não proibição) nos gatilhos + sono, movimento e calma. Só isso.",
        },
        {
          heading: "Desenhe a SUA hoje",
          emoji: "✍️",
          body: "Liste 3 refeições-curinga que sempre caem bem, 1 hábito de sono e 1 de movimento pra manter. Tenha seus gatilhos anotados pra consultar quando precisar.",
        },
      ],
      quiz: [
        {
          question: "Manutenção é…",
          options: [
            "Uma rotina simples: o que cai bem + sono, movimento e calma",
            "Uma dieta restritiva pra sempre",
            "Parar de se cuidar",
          ],
          correctIndex: 0,
          explain:
            "Isso! Manutenção é rotina leve e consciente — não restrição.",
        },
      ],
    },
    checklist: [
      "Liste 3 refeições-curinga que sempre caem bem",
      "Defina 1 hábito de sono e 1 de movimento pra manter",
      "Anote seus gatilhos pra consultar quando precisar",
      "Registre seus sintomas",
    ],
    meals: {
      cafe: ["Seu café curinga", "Ovos + tapioca + fruta", "Iogurte tolerado + aveia"],
      almoco: ["Seu prato-base favorito", "Peixe + batata + salada", "Frango + quinoa + legumes"],
      jantar: ["Seu jantar leve preferido", "Sopa + proteína", "Omelete + salada"],
      lanche: ["Seus lanches seguros", "Castanhas", "Frutas toleradas"],
    },
    completionMessage: "Dia 20 ✅ Sua rotina de leveza está quase pronta.",
  },
  {
    day: 21,
    phase: "Reequilíbrio",
    milestone: "Reset Profundo concluído",
    lesson: {
      title: "21 dias: você se transformou 🌟",
      durationMin: 2,
      body: "Três semanas atrás, viver estufada parecia normal. Hoje você tem mapa, rotina e — o mais importante — entende o seu corpo.",
      cards: [
        {
          heading: "Olha de onde você veio",
          emoji: "🌅",
          body: "Três semanas atrás, a barriga inchada parecia destino. Hoje você sabe que não era — era um problema com solução, e você resolveu.",
        },
        {
          heading: "O que você carrega daqui",
          emoji: "🎒",
          body: "Um mapa do seu corpo, uma rotina que funciona e a certeza de que leveza não depende de adivinhação. Isso ninguém tira de você.",
        },
        {
          heading: "Pra vida",
          emoji: "🌟",
          body: "Daqui pra frente é manutenção: pequenas escolhas conscientes, não restrição. A gente segue do seu lado — nos check-ins diários e nos desafios mensais. Parabéns. Você se transformou.",
        },
      ],
      quiz: [
        {
          question: "O que muda depois dos 21 dias?",
          options: [
            "Volta tudo ao normal antigo",
            "Vira manutenção: leveza por escolha consciente, pra vida",
            "Precisa recomeçar do zero",
          ],
          correctIndex: 1,
          explain:
            "Isso! Você sai com método e autonomia — manutenção é pra vida.",
        },
      ],
    },
    checklist: [
      "Compare sua barriga, energia e pele com o Dia 1",
      "Comemore essa conquista (sem ser com comida) 🎉",
      "Ative o Modo Manutenção pra não voltar a inchar",
      "Escolha seu próximo desafio mensal quando quiser",
    ],
    meals: {
      cafe: ["Seu café da manhã favorito do programa", "Ovos + tapioca + fruta", "Iogurte tolerado + aveia"],
      almoco: ["Seu prato-base de manutenção", "Peixe + batata + salada", "Frango + quinoa + legumes"],
      jantar: ["Algo leve que você ama", "Sopa + proteína", "Omelete + salada"],
      lanche: ["Suas frutas e castanhas toleradas", "Iogurte tolerado", "Gelatina incolor com suco de uva natural"],
    },
    completionMessage:
      "21 DIAS 🌟 Você se transformou. Agora é manutenção — e a gente segue do seu lado.",
  },
];

/** Acessa o conteúdo de um dia. Retorna null se ainda não foi escrito. */
export function getDay(day: number): DayContent | null {
  return DAYS.find((d) => d.day === day) ?? null;
}

/** Título da aula do dia, com fallback estrutural seguro (nunca vazio). */
export function lessonTitleFor(day: number): string {
  const d = getDay(day);
  if (d) return d.lesson.title;
  return `Aula do Dia ${day} · ${phaseForDay(day).phase}`;
}
