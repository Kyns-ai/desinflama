/* Configuração do serviço. Tudo vem de variável de ambiente — nenhum segredo
 * no código. Ver .env.example para o que cada uma significa. */

function texto(nome: string, padrao = ""): string {
  return (process.env[nome] ?? padrao).trim();
}

function numero(nome: string, padrao: number): number {
  const v = Number(process.env[nome]);
  return Number.isFinite(v) && v > 0 ? v : padrao;
}

/** Em produção o serviço é rígido; em desenvolvimento ele facilita a vida. */
export const producao = process.env.NODE_ENV === "production";

export const env = {
  porta: numero("PORT", 3333),

  anthropic: {
    chave: texto("ANTHROPIC_API_KEY"),
    /** Trocar o modelo aqui muda o custo sem tocar em código. */
    modelo: texto("MODELO_IA", "claude-opus-5"),
    /** Usado só se o modelo principal recusar a resposta. */
    modeloReserva: texto("MODELO_IA_RESERVA", "claude-opus-4-8"),
  },

  /** Teto de análises de foto por cliente por dia (controla o custo). */
  limiteAnalisesDia: numero("LIMITE_ANALISES_DIA", 5),

  segredoToken: texto("SEGREDO_TOKEN"),
  segredoWebhook: texto("SEGREDO_WEBHOOK"),

  supabase: {
    url: texto("SUPABASE_URL"),
    chaveServico: texto("SUPABASE_SERVICE_ROLE_KEY"),
  },

  origensPermitidas: texto(
    "ORIGENS_PERMITIDAS",
    "http://localhost:3000,https://desinflama-production.up.railway.app",
  )
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
} as const;

export const temIA = Boolean(env.anthropic.chave);
export const temBanco = Boolean(env.supabase.url && env.supabase.chaveServico);

/** Avisa alto e claro o que está faltando, em vez de falhar silenciosamente. */
export function conferirConfiguracao(): string[] {
  const avisos: string[] = [];
  if (!temIA) {
    avisos.push(
      "ANTHROPIC_API_KEY não configurada — os endpoints da Nutri IA vão responder 503.",
    );
  }
  if (!env.segredoToken) {
    avisos.push(
      "SEGREDO_TOKEN não configurado — usando um segredo temporário. Os acessos liberados agora param de valer quando o serviço reiniciar.",
    );
  }
  if (!temBanco) {
    avisos.push(
      "SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configurados — os acessos ficam só na memória e somem ao reiniciar. Serve para testar, não para vender.",
    );
  }
  if (!env.segredoWebhook) {
    avisos.push(
      producao
        ? "SEGREDO_WEBHOOK vazio EM PRODUÇÃO — o webhook de compra está RECUSANDO tudo (401). Sem ele, qualquer pessoa que descobrisse a URL liberaria acesso premium de graça. Configure a variável e reinicie."
        : "SEGREDO_WEBHOOK vazio — em desenvolvimento o webhook aceita sem assinatura. Em produção ele recusaria.",
    );
  }
  return avisos;
}
