/**
 * Contato de suporte. FOUNDER: preencha com os canais REAIS antes de lançar.
 * O botão de WhatsApp só aparece quando `whatsapp` tem um número de verdade
 * (não renderiza botão morto para a cliente).
 */
export const SUPPORT = {
  /** Número internacional sem símbolos, ex.: "5511999999999". Vazio = oculta o botão. */
  whatsapp: "",
  /** E-mail de suporte. Vazio = oculta o botão. */
  email: "suporte@desinflama.app",
};

export function whatsappUrl(): string | null {
  return SUPPORT.whatsapp ? `https://wa.me/${SUPPORT.whatsapp}` : null;
}
