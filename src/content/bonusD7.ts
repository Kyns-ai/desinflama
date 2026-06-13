/**
 * Bônus do Dia 7 — "Comer fora sem inchar". Âncora de futuro visível desde o
 * Dia 0 (curiosity gap + loss aversion: pedir reembolso = perder o que está
 * quase desbloqueando). Conteúdo real, low FODMAP "de rua", tom honesto.
 */

export interface BonusDica {
  heading: string;
  emoji: string;
  body: string;
}

export const BONUS_D7 = {
  id: "comer-fora",
  titulo: "Comer fora sem inchar",
  subtitulo: "Restaurante, churrasco, pizza e bar — sem virar refém do cardápio",
  desbloqueiaNoDia: 7,
  dicas: [
    {
      heading: "Escolha o prato antes de chegar",
      emoji: "📱",
      body: "Decidir com fome, cardápio na mão e a mesa toda esperando é o jeito mais fácil de errar. Olhe o menu no caminho e chegue com a escolha feita — sobra atenção pra conversa, não pra negociação interna.",
    },
    {
      heading: "Churrasco: o perigo não é a carne",
      emoji: "🥩",
      body: "Carnes, arroz e salada simples são zona Calma. Os gatilhos do churrasco são o vinagrete (cebola crua), o pão de alho e a maionese temperada. Pegue a carne longe da marinada, capriche no arroz e na salada verde.",
    },
    {
      heading: "Pizza: mussarela vence",
      emoji: "🍕",
      body: "Duas fatias de mussarela incomodam bem menos que meia calabresa com cebola. Borda recheada é trigo + lactose em dose dupla. E coma devagar — pizza engolida rápido fermenta mais.",
    },
    {
      heading: "Japonês é quase sempre amigo",
      emoji: "🍣",
      body: "Sashimi, teppan e arroz caem bem. O cuidado é com os molhos prontos: muitos escondem mel, alho e trigo. Peça à parte e use pouco.",
    },
    {
      heading: "Bar: a cerveja é o fermentador",
      emoji: "🍺",
      body: "Cerveja junta trigo e gás — combo de estufar. Se for beber, alterne com água e prefira destilado com limão e gelo. Empanados e porções de massa são trigo disfarçado de petisco.",
    },
    {
      heading: "Por quilo: monte a base Calma",
      emoji: "🍽️",
      body: "Arroz, proteína grelhada e legumes cozidos são a sua base segura em qualquer buffet. Feijão e farofa ficam pra fase de reintrodução — você vai testar no SEU ritmo, não no do restaurante.",
    },
    {
      heading: "Molho à parte, sempre",
      emoji: "🥄",
      body: "Alho e cebola moram no refogado e no molho. Pedir o molho à parte é a troca invisível que mais protege — ninguém na mesa percebe, seu intestino sim.",
    },
    {
      heading: "Não chegue faminta",
      emoji: "⏰",
      body: "Comer rápido engole ar e acelera a fermentação. Um lanche Calma 1h antes (castanhas, banana) tira a urgência e te deixa escolher com calma.",
    },
    {
      heading: "Inchou mesmo assim? É dado, não recaída",
      emoji: "📈",
      body: "Aconteceu, registra no app e faz a Calmaria. Cada episódio anotado deixa seu mapa mais preciso — amanhã o corpo recompõe e você sabe mais sobre você do que ontem.",
    },
    {
      heading: "Sobremesa sem drama",
      emoji: "🍓",
      body: "Frutas Calma (morango, mamão) ou um quadradinho de chocolate amargo fecham bem. Sorvete e doces com creme são lactose + açúcar — se quiser muito, porção pequena e devagar.",
    },
  ] as BonusDica[],
};
