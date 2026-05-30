/** Utilitários de data — padronizam YYYY-MM-DD no fuso local. */

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d + n);
  return todayKey(date);
}

export function diffDays(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const da = new Date(ay, am - 1, ad).getTime();
  const db = new Date(by, bm - 1, bd).getTime();
  return Math.round((da - db) / 86_400_000);
}

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const DIAS = [
  "domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado",
];

/** Ex.: "quinta, 30 de maio". */
export function humanDate(d: Date = new Date()): string {
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}
