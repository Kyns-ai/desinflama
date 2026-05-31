import cards from "./cards-art.json";
import extras from "./extras-art.json";

const MAP = new Map(
  [
    ...(cards as { emoji: string; id: string }[]),
    ...(extras as { emoji: string; id: string }[]),
  ].map((c) => [c.emoji, c.id])
);

/** id da ilustração da marca para um emoji (null se não houver). */
export function artId(emoji?: string): string | null {
  return emoji ? (MAP.get(emoji) ?? null) : null;
}

/** alias histórico (cards de aula). */
export const cardArtId = artId;
