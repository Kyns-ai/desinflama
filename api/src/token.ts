/* Token de acesso: prova que a pessoa comprou, sem precisar de login com senha.
 *
 * Formato: <payload em base64url>.<assinatura HMAC-SHA256>
 * O app guarda esse token e manda em toda chamada da Nutri IA. Como é assinado
 * com um segredo que só o servidor conhece, ninguém consegue forjar. */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "./env.js";

/** Se SEGREDO_TOKEN não foi configurado, gera um temporário (com aviso no boot). */
const SEGREDO = env.segredoToken || randomBytes(32).toString("hex");

/** Validade do token: 400 dias — cobre uma assinatura anual inteira. */
const VALIDADE_MS = 400 * 24 * 60 * 60 * 1000;

export interface ConteudoToken {
  /** id do acesso no banco */
  acessoId: string;
  /** timestamp de expiração (ms) */
  exp: number;
}

function base64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function assinar(payload: string): string {
  return base64url(createHmac("sha256", SEGREDO).update(payload).digest());
}

export function gerarToken(acessoId: string): string {
  const conteudo: ConteudoToken = {
    acessoId,
    exp: Date.now() + VALIDADE_MS,
  };
  const payload = base64url(Buffer.from(JSON.stringify(conteudo), "utf8"));
  return `${payload}.${assinar(payload)}`;
}

export function lerToken(token: string | undefined | null): ConteudoToken | null {
  if (!token) return null;
  const partes = token.split(".");
  if (partes.length !== 2) return null;
  const [payload, assinatura] = partes as [string, string];

  const esperada = assinar(payload);
  // Comparação em tempo constante evita vazar informação pelo tempo de resposta.
  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const conteudo = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as ConteudoToken;
    if (!conteudo?.acessoId || typeof conteudo.exp !== "number") return null;
    if (Date.now() > conteudo.exp) return null;
    return conteudo;
  } catch {
    return null;
  }
}

/** Código curto que a pessoa recebe na página de obrigado do funil.
 *  Sem caracteres ambíguos (0/O, 1/I) — ela pode precisar digitar à mão. */
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function gerarCodigo(tamanho = 8): string {
  const bytes = randomBytes(tamanho);
  let saida = "";
  for (let i = 0; i < tamanho; i++) {
    saida += ALFABETO[bytes[i]! % ALFABETO.length];
  }
  return saida;
}
