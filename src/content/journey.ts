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

export interface DayContent {
  day: number;
  phase: JourneyPhase;
  /** Marco especial (ex.: dia 7, dia 14) — celebração na conclusão. */
  milestone?: string;
  lesson: { title: string; body: string };
  checklist: string[];
  meals: DayMeals;
  swaps?: Swap[];
  completionMessage: string;
}

export const DAYS: DayContent[] = [
  /* ----------------------------- CHOQUE (1–3) ----------------------------- */
  {
    day: 1,
    phase: "Choque",
    lesson: {
      title: "Por que você vive estufada (não é o quanto você come)",
      body: "O inchaço quase nunca é gordura ou “comer demais”. Na maioria das vezes é fermentação: certos carboidratos chegam ao intestino e viram comida pra bactérias, que produzem gás — e o gás estufa sua barriga, principalmente à noite. Nos próximos 3 dias a gente corta os maiores fermentadores pro seu intestino parar de produzir esse gás. Não é pra sempre — é pra acalmar agora e depois descobrir exatamente o que TE faz mal.",
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
      body: "Eles parecem inofensivos, mas alho e cebola são campeões em frutanos — um tipo de fibra que quase ninguém digere bem e que fermenta forte no intestino. O problema é que estão em quase tudo: tempero pronto, caldo, molho, salgadinho. Por isso hoje a gente lê rótulos e usa o truque do azeite aromatizado: frite alho no azeite, retire o alho e use só o óleo. O sabor fica, o frutano não.",
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
      body: "Nesta fase de choque, três coisas simples aceleram o desinchaço. Água ajuda o intestino a se mover e reduz a retenção (parece contraintuitivo, mas beber pouco faz o corpo segurar líquido). Gengibre estimula o esvaziamento do estômago — menos comida parada, menos gás. E caminhar move o intestino mecanicamente. Não é mágica, é fisiologia: hoje você sente a diferença.",
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
