/**
 * Lista de compras — agrega os ingredientes das receitas de uma fase/semana
 * numa lista agrupada por categoria e marcável. Usa os `itens` estruturados da
 * receita quando existem; senão, faz um parse "bom o suficiente" das strings
 * de `ingredientes` (a nutri pode estruturar depois para refinar).
 */
import type {
  Recipe,
  RecipeIngredient,
  ShoppingCategory,
} from "@/content/recipes";
import { stripAccents } from "./text";

export interface ShoppingItem {
  item: string;
  /** Quantidades agregadas (não somadas — "abóbora: 2 xícaras, 1 unid"). */
  qtys: string[];
  categoria: ShoppingCategory;
}

export const CATEGORY_LABEL: Record<ShoppingCategory, { nome: string; emoji: string }> = {
  hortifruti: { nome: "Hortifrúti", emoji: "🥬" },
  proteina: { nome: "Proteína", emoji: "🍗" },
  mercearia: { nome: "Mercearia", emoji: "🛒" },
  laticinio: { nome: "Laticínios", emoji: "🧀" },
  tempero: { nome: "Temperos", emoji: "🧂" },
};

export const CATEGORY_ORDER: ShoppingCategory[] = [
  "hortifruti",
  "proteina",
  "mercearia",
  "laticinio",
  "tempero",
];

// Palavras-chave por categoria (testadas no item normalizado, em ordem).
const KEYWORDS: [ShoppingCategory, RegExp][] = [
  ["proteina", /frango|peixe|salmao|sardinha|atum|carne|bife|ovo|tofu|file/],
  ["laticinio", /leite|iogurte|queijo|parmesao|kefir|requeijao/],
  [
    "tempero",
    /\bsal\b|azeite|ervas?|gengibre|cebolinha|vinagre|canela|pimenta|limao|tempero|cominho|curcuma/,
  ],
  [
    "mercearia",
    /arroz|aveia|tapioca|goma|quinoa|chia|castanha|\bnoz|amendoim|\bpao\b|granola|\bmel\b|semente|farinha|polvilho|cacau|chocolate|\bch[áa]\b/,
  ],
  // hortifrúti é o default (frutas, legumes, folhas)
];

function categorize(item: string): ShoppingCategory {
  const n = stripAccents(item.toLowerCase());
  for (const [cat, re] of KEYWORDS) if (re.test(n)) return cat;
  return "hortifruti";
}

// unidades comuns (grupo NÃO-capturante para não bagunçar os índices)
const UNIT =
  "(?:x[íi]caras?|colher(?:es)?|gramas?|\\bg\\b|ml|fatias?|punhado|posta|fil[ée]s?|dentes?|copos?|unid(?:ades?)?|por[çc][ãa]o|\\bpote\\b|talo|cm)";

/** Quebra "2 xícaras de abóbora kabocha em cubos" → {qty:"2 xícaras", item:"abóbora kabocha"}. */
function parseIngredient(raw: string): RecipeIngredient {
  // tira parênteses ("(parte verde)", "(sem o alho)")
  let s = raw.replace(/\([^)]*\)/g, "").trim();
  // "Suco de ½ limão" → o que se compra é "limão"
  s = s.replace(/^suco\s+de\s+/i, "");
  // quantidade no começo: número/fração (+ unidade opcional)
  let qty = "";
  const m = s.match(
    new RegExp(`^([\\d.,/½¼¾⅓⅔\\s]+(?:${UNIT})?)\\s+(?:de\\s+)?(.+)$`, "i")
  );
  if (m && /[\d½¼¾⅓⅔]/.test(m[1]) && m[2]) {
    qty = m[1].trim();
    s = m[2].trim();
  }
  // fração/quantidade ainda presa no meio ("½ limão") → puxa pra qty
  const frac = s.match(/^([\d½¼¾⅓⅔]+)\s+(.+)$/);
  if (frac) {
    if (!qty) qty = frac[1];
    s = frac[2].trim();
  }
  // corta frase de preparo a partir do conectivo ("frango temperado com azeite",
  // "arroz ao azeite") — o que se compra é a cabeça
  s = s.replace(/\s+(?:temperad[oa]s?\s+com|ao|à|à moda de)\s+.*$/i, "").trim();
  // tira preparos no fim que não importam pra compra
  s = s
    .replace(
      /\s+(?:em \w+|ralad[oa]|picad[oa]s?|fatiad[oa]s?|cozid[oa]s?|grelhad[oa]s?|assad[oa]s?|refogad[oa]s?|aromatizad[oa]s?|m[ée]dia|pequen[oa]|grande|desfiad[oa]s?|a gosto|fresc[oa]s?)\b/gi,
      ""
    )
    .trim();
  const item = s.charAt(0).toUpperCase() + s.slice(1);
  return { item, qty: qty || undefined, categoria: categorize(item) };
}

/** chave de dedupe: minúsculo, sem acento, plural→singular simples. */
function dedupeKey(item: string): string {
  let k = stripAccents(item.toLowerCase()).trim();
  // colapsa plural comum ("cenouras"→"cenoura", "ovos"→"ovo", "folhas"→"folha")
  k = k.replace(/s\b/g, "");
  return k;
}

function ingredientsOf(recipe: Recipe): RecipeIngredient[] {
  if (recipe.itens?.length) return recipe.itens;
  // separa linhas compostas ("Azeite, sal e cebolinha" → 3 itens; só a 1ª peça
  // leva a quantidade) e parseia cada peça
  return recipe.ingredientes.flatMap((raw) => {
    const pieces = raw.split(/,| e (?=[a-zà-ú])/i).map((p) => p.trim()).filter(Boolean);
    return pieces.map(parseIngredient).filter((i) => i.item.length > 1);
  });
}

/** slug estável de um item (para persistir o check em flags). */
export function itemSlug(item: string): string {
  return stripAccents(item.toLowerCase()).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Agrega as receitas numa lista de compras agrupada por categoria. */
export function buildShoppingList(recipes: Recipe[]): Record<ShoppingCategory, ShoppingItem[]> {
  const byItem = new Map<string, ShoppingItem>();
  for (const r of recipes) {
    for (const ing of ingredientsOf(r)) {
      const key = dedupeKey(ing.item);
      const existing = byItem.get(key);
      if (existing) {
        if (ing.qty && !existing.qtys.includes(ing.qty)) existing.qtys.push(ing.qty);
      } else {
        byItem.set(key, {
          item: ing.item,
          qtys: ing.qty ? [ing.qty] : [],
          categoria: ing.categoria,
        });
      }
    }
  }
  const out = {
    hortifruti: [],
    proteina: [],
    mercearia: [],
    laticinio: [],
    tempero: [],
  } as Record<ShoppingCategory, ShoppingItem[]>;
  for (const it of byItem.values()) out[it.categoria].push(it);
  for (const cat of CATEGORY_ORDER) {
    out[cat].sort((a, b) => a.item.localeCompare(b.item, "pt-BR"));
  }
  return out;
}
