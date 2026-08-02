import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * O admin importa o conteúdo REAL do app (../src/content, ../src/lib) em vez
   * de manter uma cópia. Painel com catálogo duplicado desanda em uma semana:
   * alguém muda o preço de um prazer no app e o admin segue mostrando o
   * antigo. `externalDir` é o que permite compilar arquivos fora desta pasta.
   *
   * Só entra aqui conteúdo PURO (dados e regra). Nada que toque em Capacitor,
   * framer-motion ou browser — isso mora no app e não sobe pro servidor.
   */
  experimental: { externalDir: true },
};

export default nextConfig;
