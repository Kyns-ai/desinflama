/**
 * Env do admin (server-only). A SERVICE_ROLE_KEY agrega dados de todas as
 * usuárias com segurança — NUNCA expor ao cliente. Sem chaves → provider mock.
 */
export const env = {
  supabase: {
    url: process.env.SUPABASE_URL?.trim(),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
    get configured() {
      return Boolean(this.url && this.serviceRoleKey);
    },
  },
  admin: {
    // allowlist de e-mails admin (separados por vírgula) e senha simples de acesso
    emails: (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    password: process.env.ADMIN_PASSWORD?.trim(),
  },
} as const;

export const usingMock = !env.supabase.configured;
