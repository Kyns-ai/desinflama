import { Home, Route, Sprout, User, type LucideIcon } from "lucide-react";

export interface TabItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * As quatro abas laterais. O centro é a CÂMERA do prato (ver TabBar).
 *
 * Mudou em relação à versão anterior (Seção 3 do PLANO):
 *  - a "Nutri IA" saiu da barra e deixou de existir como destino. A IA não é o
 *    produto: ela é uma função dentro do Prato, que olha a foto e sugere a
 *    troca. Aba própria fazia o app se apresentar como "uma nutricionista de
 *    IA", que é exatamente o que ele não é — e é risco de CFN;
 *  - o check-in saiu do botão central e virou a primeira linha do cartão do
 *    dia. O centro passou a ser a foto do prato, que é a ação mais frequente
 *    e a que dá prazer imediato — é onde a ZOE também põe;
 *  - "Prazeres" entrou, porque o cuidado acumulado precisa de destino visível
 *    a um toque, senão a semente não significa nada.
 */
export const TABS: TabItem[] = [
  { href: "/inicio", label: "Hoje", icon: Home },
  { href: "/jornada", label: "Programa", icon: Route },
  { href: "/prazeres", label: "Prazeres", icon: Sprout },
  { href: "/progresso", label: "Eu", icon: User },
];
