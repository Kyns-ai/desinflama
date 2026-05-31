import cards from "./cards-art.json";

const MAP = new Map((cards as { emoji: string; id: string }[]).map((c) => [c.emoji, c.id]));

/** id da ilustração para um emoji de card de aula (null se não houver). */
export function cardArtId(emoji?: string): string | null {
  return emoji ? (MAP.get(emoji) ?? null) : null;
}
