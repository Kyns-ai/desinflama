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
          body: "Tirando o combustível, o intestino para de produzir tanto gás. Muita gente já sente a barriga mais baixa em 72h. Bora começar.",
        },
      ],
      quiz: [
        {
          question: "Na maioria das vezes, o inchaço à noite é causado por…",
          options: [
            "Gordura acumulada na barriga",
            "Gás da fermentação de certos carboidratos",
            "Beber água demais",
          ],
          correctIndex: 1,
          explain:
            "Isso! Certos carboidratos viram comida pras bactérias, que produzem gás — e o gás estufa a barriga.",
        },
        {
          question: "Cortar os fermentadores nos primeiros dias é…",
          options: [
            "Pra sempre",
            "Temporário — pra acalmar e depois achar seus gatilhos",
            "Só pra perder peso",
          ],
          correctIndex: 1,
          explain:
            "Exato. É pra acalmar agora; depois você reintroduz pra descobrir o que TE faz mal.",
        },
      ],
    },
    checklist: [
      "Beba ~2L de água ao longo do dia",
      "Corte hoje: pão e trigo, leite e derivados, cebola e alho, refrigerante e adoçante, feijão e grão de bico",
      "Tempere com gengibre, limão e ervas",
      "Caminhe 15 min (movimenta o intestino)",
      "À noite, registre como se sentiu",
    ],
    meals: {
      cafe: [
        "Ovos mexidos + abacate (½) + chá de gengibre",
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
      "Dia 1 feito 🎉 Amanhã seu intestino já começa a desinflamar.",
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
            "Dourar o alho no azeite e usar só o óleo",
            "Comer cru",
          ],
          correctIndex: 1,
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
        "Quibe assado de carne + salada de pepino e tomate",
      ],
      jantar: [
        "Caldo de legumes (abóbora, cenoura, chuchu) com gengibre",
        "Omelete de espinafre + arroz",
        "Frango desfiado + abobrinha refogada",
      ],
      lanche: ["Banana (não muito madura)", "Mix de castanhas (até 10)", "Gelatina sem açúcar"],
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
          body: "Parece contraintuitivo, mas beber POUCA água faz o corpo segurar líquido (retenção). Hidratar bem ajuda o intestino a se mover e o corpo a soltar o excesso.",
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
            "Porque enche o estômago",
            "Porque beber pouco faz o corpo segurar líquido; hidratar solta o excesso",
            "Porque substitui a comida",
          ],
          correctIndex: 1,
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
        "Frango + batata-doce + salada verde",
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
    phase: "Remove",
    lesson: {
      title: "Agora a gente vira detetive do seu intestino",
      body: "Nos 3 primeiros dias você acalmou tudo de uma vez. A partir de agora o objetivo muda: além de manter a calma, vamos começar a mapear o que é gatilho pra VOCÊ. Cada corpo é diferente — o que estufa sua amiga pode não te fazer nada. Por isso o registro diário é tão importante: ele cruza o que você comeu com como você se sentiu. Esse é o segredo que nenhuma dieta genérica te dá.",
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
        "Omelete recheado de espinafre + arroz",
        "Salmão + purê de batata-doce",
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
    phase: "Remove",
    lesson: {
      title: "Fibra boa x fibra que incha: nem toda fibra é amiga",
      body: "“Coma mais fibra” é um conselho incompleto. Existem fibras que acalmam o intestino (as solúveis, da aveia, cenoura, chia, banana) e outras que fermentam e estufam quando o intestino está irritado (as de certos grãos, repolho, couve-flor). Na fase de remoção, a gente prioriza as fibras solúveis: elas regulam o intestino sem alimentar o gás. Quando seu intestino estiver calmo, a variedade volta.",
    },
    checklist: [
      "Inclua 1 fonte de fibra solúvel (aveia, chia, cenoura ou banana)",
      "Evite hoje: couve-flor, repolho cru, brócolis em excesso",
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
    phase: "Remove",
    lesson: {
      title: "Intestino e pele: por que sua pele melhora junto",
      body: "Você pode começar a notar a pele mais viva nesses dias — e não é coincidência. Existe o eixo intestino-pele: quando o intestino está inflamado e fermentando, isso gera sinais inflamatórios que aparecem na pele (oleosidade, opacidade, espinhas). Ao acalmar o intestino, você reduz essa inflamação de baixo grau — e a pele agradece. Repare no espelho hoje.",
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
        "Ovos + abacate (½) + chá verde",
        "Vitamina de mamão com leite sem lactose e linhaça",
        "Crepioca + chá de hortelã",
      ],
      almoco: [
        "Sardinha ou salmão + arroz + salada de folhas",
        "Frango + batata-doce + abobrinha",
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
    phase: "Remove",
    milestone: "1 semana completa",
    lesson: {
      title: "1 semana! Olha só o que você já conquistou",
      body: "Sete dias atrás sua barriga vivia estufada e você não sabia por quê. Hoje você já tirou os maiores fermentadores, começou a mapear seus gatilhos e — muito provavelmente — sente a barriga mais baixa, principalmente à noite. Esse é o seu primeiro grande marco. Guarde essa sensação: ela é a prova de que não era “normal” viver inchada. Na próxima fase a gente descobre exatamente o que você pode voltar a comer.",
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
      lanche: ["Fruta da estação (low FODMAP)", "Castanhas", "Gelatina sem açúcar"],
    },
    completionMessage:
      "1 SEMANA 🏆 Seu inchaço já caiu de forma visível. Esse é só o começo do seu mapa.",
  },

  /* ------------------------ REINTRODUÇÃO (8–11) ------------------------ */
  {
    day: 8,
    phase: "Reintrodução",
    lesson: {
      title: "Reintrodução: a parte que te dá liberdade",
      body: "Aqui muita gente erra: acha que precisa cortar tudo pra sempre. Errado. Agora que seu intestino acalmou, a gente devolve UM grupo de cada vez pra descobrir o que VOCÊ tolera. Hoje o teste é a lactose: coma uma porção de um derivado do leite (ex.: ½ copo de leite comum ou 1 pote pequeno de iogurte) e observe nas próximas horas. Se não inchar, ótimo — lactose não é seu problema. Se inchar, achamos um gatilho. Teste só um grupo por dia.",
    },
    checklist: [
      "Mantenha o resto da base low FODMAP",
      "TESTE LACTOSE: 1 porção de leite ou iogurte comum hoje",
      "Observe a barriga, gases e intestino por até 6h",
      "Registre a intensidade da reação (de 1 a 5)",
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
    swaps: [{ de: "leite sem lactose (só hoje)", para: "leite comum, para o teste" }],
    completionMessage:
      "Dia 8 ✅ Primeiro grupo testado! Seu mapa está ficando pessoal de verdade.",
  },
  {
    day: 9,
    phase: "Reintrodução",
    lesson: {
      title: "Teste da frutose: o açúcar das frutas",
      body: "Algumas frutas e o mel têm frutose em excesso, que parte das pessoas absorve mal — e aí vem o inchaço. Hoje o teste é esse grupo. Se a lactose de ontem não te incomodou, siga; se incomodou, volte ao leite sem lactose e teste a frutose mesmo assim (são grupos diferentes). Coma uma porção de uma fruta rica em frutose (ex.: ½ manga ou 1 colher de mel) e observe. Repare: você está construindo a lista do que é SEU.",
    },
    checklist: [
      "Volte os grupos que passaram (ex.: lactose, se tolerou)",
      "TESTE FRUTOSE: ½ manga OU 1 colher de mel hoje",
      "Observe a reação por algumas horas",
      "Registre a intensidade (1 a 5)",
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
        "Peixe + batata-doce + salada",
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
      body: "Chegou o teste mais importante, porque frutano é o gatilho nº1 de inchaço da maioria das pessoas — e está no trigo, na cebola e no alho. Hoje você reintroduz com cuidado: escolha UMA fonte (ex.: uma fatia de pão de trigo OU um prato com cebola refogada) e observe bem. Muita gente descobre aqui que o “problema com glúten” era, na verdade, frutano. Seja honesta no registro: esse resultado vale ouro.",
    },
    checklist: [
      "Mantenha os grupos que já passaram",
      "TESTE FRUTANO: 1 fatia de pão de trigo OU cebola refogada (escolha um)",
      "Observe com atenção (frutano costuma reagir mais)",
      "Registre a intensidade (1 a 5) e a que horas começou",
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
      body: "Faltam dois grupos pra fechar seu mapa. As leguminosas (feijão, grão-de-bico, lentilha) têm GOS, uma fibra que fermenta — mas existe um truque: bem cozidas e em porção pequena, muita gente tolera. E os polióis estão em frutas como maçã e pera e nos adoçantes “sem açúcar” (sorbitol, xilitol). Teste um por vez. Ao fim de hoje, você terá a lista completa do que pode voltar e do que vale evitar.",
    },
    checklist: [
      "TESTE LEGUMINOSA: 2–3 colheres de feijão bem cozido OU",
      "TESTE POLIÓIS: ½ maçã ou pera (escolha um teste hoje)",
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
      "Dia 11 ✅ Reintrodução completa! Agora você tem o seu mapa de tolerância.",
  },

  /* ----------------------------- REPAIR (12–14) ----------------------------- */
  {
    day: 12,
    phase: "Repair",
    lesson: {
      title: "Reparar a parede do intestino",
      body: "Depois de acalmar e mapear, entramos na fase de reparo. A parede do seu intestino é uma barreira que pode ficar irritada com o tempo. Alguns nutrientes ajudam a recompô-la: glutamina (presente em carnes, ovos e caldo de osso), zinco (carne, sementes de abóbora) e ômega-3 (peixes, chia, linhaça), que reduz inflamação. Não é sobre suplemento caro — é sobre colocar esses alimentos no prato com constância.",
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
        "Ovos + abacate (½) + chá",
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
        "Peixe + purê de batata-doce",
        "Omelete + salada verde + azeite",
      ],
      lanche: ["Sementes de abóbora", "Castanha-do-pará (2–3)", "Iogurte (tolerado)"],
    },
    completionMessage: "Dia 12 ✅ Você está reconstruindo de dentro pra fora.",
  },
  {
    day: 13,
    phase: "Repair",
    lesson: {
      title: "Reequilibrar as bactérias boas",
      body: "Seu intestino é morada de trilhões de bactérias — e as boas adoram dois tipos de comida: prebióticos (fibras que as alimentam) e probióticos/fermentados (que repõem bactérias boas). Como você está saindo de uma fase de baixo FODMAP, faça isso com calma: comece com porções pequenas de fermentados leves (iogurte tolerado, kefir em pouca quantidade, chucrute) e fibras suaves. Reequilibrar é construir aos poucos, não de uma vez.",
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
        "Salmão + purê de batata-doce",
      ],
      lanche: ["Banana com chia", "Castanhas", "Iogurte tolerado"],
    },
    completionMessage: "Dia 13 ✅ Quase lá. Amanhã seu mapa fica pronto 🗺️",
  },
  {
    day: 14,
    phase: "Repair",
    milestone: "Desafio concluído",
    lesson: {
      title: "Seu mapa pessoal está pronto 🗺️",
      body: "Catorze dias atrás você não sabia por que vivia estufada. Agora você tem algo que nenhuma dieta genérica entrega: o SEU mapa. Você sabe o que acalma seu intestino, o que são seus gatilhos e o que pode voltar ao prato sem medo. A partir daqui não é sobre restrição — é sobre escolha consciente. Seu “cardápio de saída” é simples: base nos alimentos que caíram bem + os grupos que você tolerou + atenção (não proibição) nos seus gatilhos. Manutenção é o que impede de voltar a inchar.",
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
      lanche: ["Suas frutas e castanhas toleradas", "Iogurte tolerado", "Gelatina sem açúcar"],
    },
    completionMessage:
      "DESAFIO CONCLUÍDO 🏆🗺️ Você tem seu mapa. Agora é manter a leveza — e a gente segue com você.",
  },

  /* ------------------- RESET PROFUNDO · Rebalance (15–21) ------------------- */
  {
    day: 15,
    phase: "Rebalance",
    lesson: {
      title: "Reset Profundo: agora a gente cuida do todo",
      body: "Você já mapeou a comida. Mas o intestino também responde a sono, estresse e movimento — é o famoso eixo intestino-cérebro. Nestes 7 dias a gente afina esses pilares pra consolidar o que você conquistou. Pense no Reset como a diferença entre desinchar e ficar desinchada.",
    },
    checklist: [
      "Mantenha sua base de alimentos tolerados",
      "Durma e acorde em horários parecidos",
      "Caminhe 20–30 min",
      "Registre sono e estresse hoje",
    ],
    meals: {
      cafe: ["Ovos + abacate (⅛) + chá", "Iogurte tolerado + aveia + frutas low FODMAP", "Crepioca + chá de hortelã"],
      almoco: ["Proteína + arroz + legumes tolerados", "Peixe + batata + salada", "Frango + quinoa + abobrinha"],
      jantar: ["Sopa leve de legumes + proteína", "Salmão + purê de batata-doce", "Omelete + salada verde"],
      lanche: ["Frutas toleradas", "Castanhas", "Iogurte tolerado"],
    },
    completionMessage: "Dia 15 ✅ Começou o ajuste fino do seu corpo todo.",
  },
  {
    day: 16,
    phase: "Rebalance",
    lesson: {
      title: "Sono: a faxina noturna do intestino",
      body: "Enquanto você dorme, o intestino faz movimentos de limpeza (o complexo motor migratório) que “varrem” restos e bactérias. Dormir mal trava essa faxina e favorece o inchaço. Hoje a meta é higiene do sono: menos tela à noite, quarto escuro e um ritmo regular.",
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
    phase: "Rebalance",
    lesson: {
      title: "Estresse: respirar muda sua digestão",
      body: "Em estresse, o corpo entra em “luta ou fuga” e a digestão simplesmente para — por isso a barriga estufa em dias tensos. A boa notícia: dá pra desligar isso conscientemente. A respiração lenta ativa o nervo vago, que liga o “modo digestão”. Hoje você testa 5 minutos disso antes de comer.",
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
    phase: "Rebalance",
    lesson: {
      title: "Movimento: o empurrãozinho que o intestino ama",
      body: "Não precisa de academia pesada — caminhar já estimula o intestino a se mover e libera gases presos. O movimento depois das refeições é especialmente bom contra o inchaço pós-comida. Hoje você inclui uma caminhada leve depois de uma refeição maior.",
    },
    checklist: [
      "Caminhe 10–15 min após o almoço ou jantar",
      "Inclua um alongamento de torção suave",
      "Mantenha a hidratação",
      "Registre como a barriga respondeu",
    ],
    meals: {
      cafe: ["Panqueca de banana + ovo", "Ovos + tapioca + mamão", "Iogurte tolerado + aveia"],
      almoco: ["Frango + arroz + abobrinha", "Peixe + batata-doce + salada", "Carne + quinoa + cenoura"],
      jantar: ["Sopa + proteína", "Omelete + salada", "Peixe + legumes"],
      lanche: ["Banana", "Castanhas", "Kiwi"],
    },
    completionMessage: "Dia 18 ✅ Mexer o corpo é mexer o intestino. Sentiu?",
  },
  {
    day: 19,
    phase: "Rebalance",
    lesson: {
      title: "Reforçando o que você tolera",
      body: "A esta altura você já sabe muito sobre o seu corpo. Hoje a gente reforça a variedade DENTRO do que cai bem — porque variar alimentos tolerados alimenta uma microbiota diversa e forte. Não é sobre comer pouco; é sobre comer bem e variado dentro do seu mapa.",
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
    phase: "Rebalance",
    lesson: {
      title: "Montando sua rotina de manutenção",
      body: "Amanhã o Reset acaba — mas a leveza fica, se você tiver uma rotina simples. Manutenção não é dieta: é uma base de alimentos que caem bem + os grupos que você tolera + atenção (não proibição) nos gatilhos + sono, movimento e calma. Hoje você desenha essa rotina do seu jeito.",
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
    phase: "Rebalance",
    milestone: "Reset Profundo concluído",
    lesson: {
      title: "21 dias: você se transformou 🌟",
      body: "Três semanas atrás, viver estufada parecia normal. Hoje você tem um mapa, uma rotina e — o mais importante — entende o seu corpo. Daqui pra frente é manutenção: a leveza que você conquistou se mantém com pequenas escolhas conscientes, não com restrição. Você não depende mais de adivinhação. Parabéns: isso é pra vida.",
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
      lanche: ["Suas frutas e castanhas toleradas", "Iogurte tolerado", "Gelatina sem açúcar"],
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
