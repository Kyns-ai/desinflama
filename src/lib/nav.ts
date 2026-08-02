import { Home, Route, Sparkles, BarChart3, type LucideIcon } from "lucide-react";

export interface TabItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Abas laterais da barra inferior (o centro é o botão Registrar).
 *
 * A Nutri IA tem lugar fixo, do mesmo jeito que o Coach no Simple: coach é
 * produto, não link escondido no perfil. O Perfil saiu daqui para o cabeçalho
 * da home — é onde a cliente vai uma vez por mês, não todo dia.
 */
export const TABS: TabItem[] = [
  { href: "/inicio", label: "Início", icon: Home },
  { href: "/nutri", label: "Nutri IA", icon: Sparkles },
  { href: "/jornada", label: "Jornada", icon: Route },
  { href: "/progresso", label: "Progresso", icon: BarChart3 },
];
