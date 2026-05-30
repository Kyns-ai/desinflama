import type { NextConfig } from "next";

/**
 * Build estático para empacotamento no Capacitor (iOS/Android) + PWA web.
 *
 * Regras de ouro deste projeto (ver plano):
 *  - `output: 'export'` proíbe código de runtime no servidor (sem route handlers,
 *    server actions, middleware, cookies()/headers() em runtime). Tudo interativo
 *    é client-side ('use client'). O Capacitor serve a pasta `out/` via file://.
 *  - `images.unoptimized` é obrigatório: o otimizador do next/image precisa de
 *    servidor, que não existe no bundle estático.
 *  - `trailingSlash` gera `/rota/index.html`, que resolve limpo no esquema
 *    file:// do WebView nativo.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
