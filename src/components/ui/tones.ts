/**
 * Paleta de tons compartilhada por Badge, IconCircle e afins.
 *
 * Existe para que nenhum componente volte a carregar hex avulso
 * (`text-[#9a7322]`) — quando a paleta mudou, esses hexes ficaram órfãos e a
 * tela virou colcha de retalhos. Aqui é token contra token.
 *
 * Regra de uso: `rose` é a marca; `coral` é o acento raro (um por tela);
 * gold/sky/plum são apoio de leitura, nunca decoração.
 */
export type Tone = "rose" | "coral" | "gold" | "sky" | "plum" | "neutral";

/** Fundo tint + texto legível sobre ele (contraste conferido ≥ 4.5:1). */
export const TONE_SOFT: Record<Tone, string> = {
  rose: "bg-rose-tint text-rose-dark",
  coral: "bg-coral-tint text-coral-dark",
  gold: "bg-gold-tint text-gold-dark",
  sky: "bg-sky-tint text-sky-dark",
  plum: "bg-plum-tint text-plum-dark",
  neutral: "bg-cream-deep text-ink-soft",
};

/** Cor em força total + texto branco. Para o estado "feito"/destaque único. */
export const TONE_SOLID: Record<Tone, string> = {
  rose: "bg-rose text-white",
  coral: "bg-coral text-white",
  gold: "bg-gold text-white",
  sky: "bg-sky text-white",
  plum: "bg-plum text-white",
  neutral: "bg-ink-soft text-white",
};
