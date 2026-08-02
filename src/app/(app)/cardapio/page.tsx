"use client";

/**
 * Cardápio da semana + lista de compras. Transforma as refeições soltas dos
 * dias numa "dieta" escaneável (principal + variações) e gera a lista de
 * compras da semana, marcável e levável ao mercado.
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  ShoppingCart,
  UtensilsCrossed,
  Coffee,
  Sun,
  Moon,
  Apple,
} from "lucide-react";
import { Card } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { WEEKS, menuForWeek, recipesForWeek } from "@/lib/weeklyMenu";
import {
  buildShoppingList,
  CATEGORY_ORDER,
  CATEGORY_LABEL,
  itemSlug,
} from "@/lib/shoppingList";
import { cn } from "@/lib/cn";

const MEAL_META = [
  { key: "cafe", label: "Café", icon: Coffee },
  { key: "almoco", label: "Almoço", icon: Sun },
  { key: "jantar", label: "Jantar", icon: Moon },
  { key: "lanche", label: "Lanche", icon: Apple },
] as const;

export default function Cardapio() {
  const router = useRouter();
  const [week, setWeek] = useState(1);
  const [tab, setTab] = useState<"menu" | "lista">("menu");

  const menu = useMemo(() => menuForWeek(week), [week]);
  const list = useMemo(
    () => buildShoppingList(recipesForWeek(week)),
    [week]
  );

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3 pt-5">
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-display text-[1.6rem] font-semibold tracking-tight text-ink">
          Seu cardápio
        </h1>
      </header>

      {/* Seletor de semana */}
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {WEEKS.map((w) => (
          <button
            key={w.week}
            onClick={() => setWeek(w.week)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all",
              week === w.week
                ? "bg-ink text-cream"
                : "border border-line bg-surface text-ink-soft"
            )}
          >
            {w.label}
          </button>
        ))}
      </div>

      {/* Abas Menu / Lista */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("menu")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all",
            tab === "menu" ? "bg-rose-tint text-rose-dark" : "bg-cream-deep text-ink-soft"
          )}
        >
          <UtensilsCrossed className="size-4" /> Cardápio
        </button>
        <button
          onClick={() => setTab("lista")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all",
            tab === "lista" ? "bg-rose-tint text-rose-dark" : "bg-cream-deep text-ink-soft"
          )}
        >
          <ShoppingCart className="size-4" /> Lista de compras
        </button>
      </div>

      {tab === "menu" ? (
        <div className="space-y-3">
          {menu.map((d) => (
            <DayMenuCard key={d.day} dia={d} />
          ))}
          <p className="px-1 text-xs leading-relaxed text-ink-faint">
            Em destaque, a opção principal de cada refeição. Toque pra ver as
            variações — todas seguem a fase do seu dia.
          </p>
        </div>
      ) : (
        <ShoppingListView week={week} list={list} />
      )}
    </div>
  );
}

function DayMenuCard({
  dia,
}: {
  dia: ReturnType<typeof menuForWeek>[number];
}) {
  const [open, setOpen] = useState(false);
  return (
    <Card elevation="soft" className="overflow-hidden p-0">
      <div className="flex items-center gap-3 px-4 pt-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-cream-deep text-sm font-bold text-ink-soft">
          {dia.weekday}
        </span>
        <p className="font-semibold tracking-tight text-ink">Dia {dia.day}</p>
      </div>
      <div className="space-y-2 px-4 py-3">
        {MEAL_META.map((m) => {
          const opts = dia[m.key];
          if (!opts.length) return null;
          const Icon = m.icon;
          return (
            <div key={m.key} className="flex items-start gap-2.5 text-[15px]">
              <Icon className="mt-0.5 size-4 shrink-0 text-rose-deep" />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  {m.label}
                </span>
                <p className="text-ink">{opts[0]}</p>
                <AnimatePresence initial={false}>
                  {open && opts.length > 1 && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {opts.slice(1).map((o, i) => (
                        <li key={i} className="mt-1 text-sm text-ink-soft">
                          ou {o}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-center gap-1 border-t border-line py-2 text-xs font-semibold text-ink-faint"
      >
        {open ? "Esconder variações" : "Ver variações"}
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
    </Card>
  );
}

function ShoppingListView({
  week,
  list,
}: {
  week: number;
  list: ReturnType<typeof buildShoppingList>;
}) {
  const flags = useAppStore((s) => s.data.flags);
  const update = useAppStore((s) => s.update);

  function toggle(slug: string) {
    const key = `compras:${week}:${slug}`;
    void update((d) => {
      d.flags[key] = !d.flags[key];
    });
  }

  return (
    <div className="space-y-4">
      <p className="px-1 text-sm text-ink-soft">
        Tudo que você precisa pra seguir o cardápio da semana sem pensar. Marque
        conforme compra.
      </p>
      {CATEGORY_ORDER.map((cat) => {
        const items = list[cat];
        if (!items.length) return null;
        const meta = CATEGORY_LABEL[cat];
        return (
          <Card key={cat} elevation="soft">
            <h3 className="mb-2 flex items-center gap-2 font-semibold tracking-tight text-ink">
              <span>{meta.emoji}</span> {meta.nome}
            </h3>
            <ul className="space-y-1">
              {items.map((it) => {
                const slug = itemSlug(it.item);
                const checked = !!flags[`compras:${week}:${slug}`];
                return (
                  <li key={slug}>
                    <button
                      onClick={() => toggle(slug)}
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors active:bg-cream-deep/40"
                    >
                      <span
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded-md border-2 transition-all",
                          checked ? "border-rose bg-rose" : "border-line"
                        )}
                      >
                        {checked && (
                          <svg viewBox="0 0 24 24" className="size-3 text-white" fill="none" stroke="currentColor" strokeWidth={4}>
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span
                        className={cn(
                          "flex-1 text-[15px]",
                          checked ? "text-ink-faint line-through" : "text-ink"
                        )}
                      >
                        {it.item}
                        {it.qtys.length > 0 && (
                          <span className="text-ink-faint">
                            {" "}
                            — {it.qtys.join(", ")}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}
