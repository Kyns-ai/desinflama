/** Utilitários de texto compartilhados. */

/** Remove acentos ("purê" → "pure") — usado em matching e em nomes de asset. */
export function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
