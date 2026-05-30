import { Home, Route, BarChart3, User, type LucideIcon } from "lucide-react";

export interface TabItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Abas laterais da barra inferior (o centro é o botão Registrar). */
export const TABS: TabItem[] = [
  { href: "/inicio", label: "Início", icon: Home },
  { href: "/jornada", label: "Jornada", icon: Route },
  { href: "/progresso", label: "Progresso", icon: BarChart3 },
  { href: "/perfil", label: "Perfil", icon: User },
];
