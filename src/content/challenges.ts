/**
 * Desafios mensais recorrentes (7 dias, temáticos) — camada de retenção do Modo
 * Manutenção. Conteúdo real; a validação com fontes e novos desafios entram na
 * Fase 11.
 */

export interface ChallengeDay {
  day: number;
  title: string;
  body: string;
  checklist: string[];
}

export interface MonthlyChallenge {
  id: string;
  nome: string;
  descricao: string;
  emoji: string;
  tone: "coral" | "sage" | "sky" | "plum" | "gold";
  dias: ChallengeDay[];
}

export const MONTHLY_CHALLENGES: MonthlyChallenge[] = [
  {
    id: "reset-pos-festa",
    nome: "Reset pós-festa",
    descricao: "7 dias pra desinflamar depois de um período de exageros.",
    emoji: "🎉",
    tone: "coral",
    dias: [
      {
        day: 1,
        title: "Volta à base leve",
        body: "Depois de dias de exagero, o intestino pede simplicidade. Hoje você volta aos alimentos que você já sabe que caem bem e corta os grandes fermentadores.",
        checklist: ["Beba ~2L de água", "Cardápio simples e tolerado", "Caminhe 15 min", "Registre como se sente"],
      },
      {
        day: 2,
        title: "Hidratar e drenar",
        body: "Excesso de sal e álcool retêm líquido. Hidratar bem e reduzir ultraprocessados ajuda o corpo a soltar o que segurou.",
        checklist: ["Água com limão e gengibre", "Sem ultraprocessados hoje", "Inclua alimentos com potássio (banana, batata)", "Registre"],
      },
      {
        day: 3,
        title: "Intestino em movimento",
        body: "Festas costumam bagunçar o ritmo do intestino. Fibra solúvel + movimento devolvem a regularidade.",
        checklist: ["Aveia ou chia no café", "Caminhe 20 min", "Mantenha a hidratação", "Registre"],
      },
      {
        day: 4,
        title: "Menos açúcar, mais energia",
        body: "O pico e queda de açúcar dos doces deixam você cansada. Trocar por proteína e gordura boa estabiliza a energia.",
        checklist: ["Sem açúcar adicionado hoje", "Proteína em todas as refeições", "Castanhas como lanche", "Registre energia"],
      },
      {
        day: 5,
        title: "Fermentados com calma",
        body: "Reequilibrar a microbiota ajuda a recuperar mais rápido. Comece com porção pequena de iogurte tolerado ou kefir.",
        checklist: ["1 porção pequena de fermentado", "Mantenha a base leve", "Durma bem", "Registre"],
      },
      {
        day: 6,
        title: "Refeição reconfortante e leve",
        body: "Comida que abraça não precisa estufar. Sopas e pratos quentes com legumes tolerados acalmam o intestino.",
        checklist: ["Uma refeição quente e leve", "Chá de gengibre após comer", "Caminhada leve", "Registre"],
      },
      {
        day: 7,
        title: "Você voltou à leveza 🎯",
        body: "Em uma semana você voltou ao seu eixo, sem sofrimento. Esse é o poder de ter o seu mapa: você sabe exatamente como voltar.",
        checklist: ["Compare com o Dia 1", "Defina o que manter da semana", "Comemore (sem ser comida)", "Registre"],
      },
    ],
  },
  {
    id: "semana-sem-acucar",
    nome: "Semana sem açúcar",
    descricao: "7 dias cortando o açúcar adicionado pra ganhar energia e leveza.",
    emoji: "🍃",
    tone: "sage",
    dias: [
      {
        day: 1,
        title: "Onde o açúcar se esconde",
        body: "Açúcar não está só no doce: molhos, pães, bebidas e ‘saudáveis’ industrializados escondem bastante. Hoje você vira detetive de rótulos.",
        checklist: ["Leia o rótulo de 3 produtos", "Corte bebidas açucaradas", "Troque sobremesa por fruta tolerada", "Registre"],
      },
      {
        day: 2,
        title: "Estabilizar a energia",
        body: "Sem os picos de açúcar, a energia para de despencar no meio do dia. Proteína e gordura boa no café da manhã fazem diferença enorme.",
        checklist: ["Café da manhã com proteína", "Sem açúcar adicionado", "Água ao longo do dia", "Registre energia"],
      },
      {
        day: 3,
        title: "Domando a vontade de doce",
        body: "A vontade de doce passa em poucos minutos. Ter um plano (fruta, castanha, chá) evita o piloto automático.",
        checklist: ["Tenha um lanche de emergência saudável", "Canela no café (ajuda na saciedade)", "Caminhe 15 min", "Registre"],
      },
      {
        day: 4,
        title: "Doce natural é permitido",
        body: "Cortar açúcar adicionado não é cortar todo doce. Frutas low FODMAP matam a vontade sem o efeito montanha-russa.",
        checklist: ["Sobremesa = fruta tolerada", "Sem adoçante de poliol (sorbitol/xilitol)", "Hidrate", "Registre"],
      },
      {
        day: 5,
        title: "Pele e açúcar",
        body: "Açúcar em excesso alimenta inflamação de baixo grau que aparece na pele. Menos açúcar — e a pele costuma agradecer com o tempo.",
        checklist: ["Repare na sua pele hoje", "Mantenha o corte de açúcar", "Ômega-3 no prato (peixe/chia)", "Registre pele"],
      },
      {
        day: 6,
        title: "Cozinhar do zero",
        body: "Cozinhar em casa é o jeito mais fácil de fugir do açúcar escondido. Uma receita simples já resolve o dia.",
        checklist: ["Faça uma refeição do zero", "Tempere com ervas e especiarias", "Sem industrializados doces", "Registre"],
      },
      {
        day: 7,
        title: "Leve, com mais energia 🍃",
        body: "Uma semana depois, a energia está mais estável e a vontade de doce, menor. Você não precisa ser radical pra sempre — só consciente.",
        checklist: ["Compare sua energia com o Dia 1", "Escolha 1 hábito pra manter", "Comemore", "Registre"],
      },
    ],
  },
];

export function getChallenge(id: string): MonthlyChallenge | null {
  return MONTHLY_CHALLENGES.find((c) => c.id === id) ?? null;
}
