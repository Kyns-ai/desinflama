/**
 * Biblioteca de Trocas — o de→para que mantém o sabor sem o inchaço.
 * Conteúdo real (base Low FODMAP), localizado para o Brasil. Expansão e fontes
 * na Fase 11.
 */

export interface SwapItem {
  de: string;
  para: string;
  motivo: string;
}

export interface SwapCategory {
  categoria: string;
  emoji: string;
  itens: SwapItem[];
}

export const SWAPS: SwapCategory[] = [
  {
    categoria: "Temperos e bases",
    emoji: "🧄",
    itens: [
      {
        de: "Cebola e alho",
        para: "Azeite aromatizado + cebolinha (parte verde)",
        motivo: "Mantém o sabor sem o frutano que fermenta.",
      },
      {
        de: "Caldo em cubo / tempero pronto",
        para: "Sal, ervas frescas e azeite de alho",
        motivo: "Caldos prontos escondem cebola e alho em pó.",
      },
      {
        de: "Molho de tomate industrializado",
        para: "Tomate fresco refogado no azeite aromatizado",
        motivo: "Os prontos quase sempre levam cebola e alho.",
      },
    ],
  },
  {
    categoria: "Pães e carboidratos",
    emoji: "🍞",
    itens: [
      {
        de: "Pão de trigo",
        para: "Tapioca, pão sem glúten ou pão de fermentação natural (em porção pequena)",
        motivo: "Reduz os frutanos do trigo.",
      },
      {
        de: "Macarrão de trigo",
        para: "Macarrão de arroz ou de milho",
        motivo: "Mesmo prazer, sem o frutano.",
      },
      {
        de: "Granola com mel",
        para: "Aveia sem glúten + sementes + fruta low FODMAP",
        motivo: "Tira o mel (frutose) e o trigo (frutano).",
      },
    ],
  },
  {
    categoria: "Leite e derivados",
    emoji: "🥛",
    itens: [
      {
        de: "Leite comum",
        para: "Leite sem lactose ou bebida de arroz",
        motivo: "Sem lactose, sem fermentação.",
      },
      {
        de: "Iogurte comum",
        para: "Iogurte sem lactose",
        motivo: "Mantém o probiótico, tira o gatilho.",
      },
      {
        de: "Requeijão / cream cheese",
        para: "Queijos curados (parmesão) ou pasta de abobrinha",
        motivo: "Queijos curados têm pouquíssima lactose.",
      },
    ],
  },
  {
    categoria: "Frutas e doces",
    emoji: "🍎",
    itens: [
      {
        de: "Maçã / pera",
        para: "Mamão, kiwi, laranja, morango",
        motivo: "Troca frutose e sorbitol por frutas mais leves.",
      },
      {
        de: "Mel",
        para: "Açúcar comum (pouco) ou maple puro",
        motivo: "Reduz a frutose livre.",
      },
      {
        de: "Bala/goma diet (sorbitol)",
        para: "Chocolate 70%+ (1–2 quadradinhos)",
        motivo: "Foge dos polióis dos produtos “sem açúcar”.",
      },
    ],
  },
  {
    categoria: "Bebidas",
    emoji: "🥤",
    itens: [
      {
        de: "Refrigerante / suco de caixinha",
        para: "Água com gás + limão + gengibre",
        motivo: "Sem adoçantes e excesso de frutose.",
      },
      {
        de: "Suco verde com maçã e couve",
        para: "Água de gengibre e limão",
        motivo: "Detox de verdade é hidratar, não fermentar.",
      },
    ],
  },
];
