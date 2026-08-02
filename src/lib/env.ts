/**
 * Configuração por ambiente. Sob `output: 'export'`, as envs `NEXT_PUBLIC_*`
 * são embutidas em build — todas precisam estar presentes no momento do build,
 * não em runtime.
 *
 * Quando uma chave está ausente, a composition root cai no mock funcional
 * correspondente (auth simulada, entitlement simulado, dados locais), para o
 * app rodar end-to-end sem backend.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

const rcWebKey = process.env.NEXT_PUBLIC_REVENUECAT_WEB_KEY?.trim();
const rcAppleKey = process.env.NEXT_PUBLIC_REVENUECAT_APPLE_KEY?.trim();
const rcGoogleKey = process.env.NEXT_PUBLIC_REVENUECAT_GOOGLE_KEY?.trim();

/** Serviço desinflama-api: Nutri IA, liberação de acesso pelo funil, push. */
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

export const env = {
  api: {
    url: apiUrl?.replace(/\/$/, ""),
    configured: Boolean(apiUrl),
  },
  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    configured: Boolean(supabaseUrl && supabaseAnonKey),
  },
  revenuecat: {
    webKey: rcWebKey,
    appleKey: rcAppleKey,
    googleKey: rcGoogleKey,
    /** Pelo menos uma chave configurada → usar RevenueCat real. */
    configured: Boolean(rcWebKey || rcAppleKey || rcGoogleKey),
    /** Identificador do entitlement premium no RevenueCat. */
    entitlementId:
      process.env.NEXT_PUBLIC_REVENUECAT_ENTITLEMENT?.trim() || "premium",
  },
} as const;

/** True quando rodando 100% em mocks (nenhum backend configurado). */
export const isFullyMocked = !env.supabase.configured && !env.revenuecat.configured;
