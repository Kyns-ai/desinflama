/**
 * A loja de Prazeres.
 *
 * Mecânica do Habitica (loja de recompensas da vida real com preço) casada
 * com a regra do WeightWatchers (orçamento semanal de prazer). Ver
 * docs/MECANICAS-VALIDADAS.md.
 *
 * A regra de copy é a coisa mais importante deste arquivo: aqui NUNCA se
 * chama de recaída, escapada, trapaça ou "dia do lixo". O prazer resgatado
 * ESTAVA NO PLANO — foi comprado com cuidado acumulado. Tratar o prazer como
 * falha é o que faz a mulher esconder o que comeu, e o que ela esconde a
 * gente não consegue ajudar a entender.
 */

import type { Prazer } from "@/types/domain";

/**
 * Preços calibrados contra a tabela de ganho (Seção 5): quem faz o dia
 * inteiro junta ~60–70 sementes. Então um chocolate sai no mesmo dia, uma
 * taça de vinho em pouco mais de um dia, e a pizza exige três — o preço é o
 * que transforma "eu mereço" em "eu construí".
 */
export const PRAZERES_PADRAO: Prazer[] = [
  { id: "chocolate70", nome: "Um quadradinho de chocolate 70%", preco: 30 },
  { id: "cafeteria", nome: "Aquele café da cafeteria", preco: 40 },
  { id: "paodequeijo", nome: "Pão de queijo quentinho", preco: 50 },
  { id: "banho", nome: "Banho demorado, sem pressa", preco: 50 },
  { id: "vinho", nome: "Taça de vinho", preco: 80 },
  { id: "sorvete", nome: "Sorvete da sua casquinha favorita", preco: 90 },
  { id: "brigadeiro", nome: "Brigadeiro", preco: 100 },
  { id: "serie", nome: "Maratonar a série sem culpa", preco: 120 },
  { id: "hamburguer", nome: "Hambúrguer de verdade", preco: 180 },
  { id: "pizza", nome: "Pizza de sexta", preco: 200 },
];

/**
 * Teto SUGERIDO de gasto por semana. Vem do WeightWatchers: sem um limite, a
 * loja vira compulsão financiada por pontos. Sugerido, não travado — quem
 * decide é ela, e travar seria voltar a punir.
 */
export const TETO_SEMANAL_SUGERIDO = 250;

export function precoDe(prazeres: Prazer[], id: string): number {
  return prazeres.find((p) => p.id === id)?.preco ?? 0;
}
