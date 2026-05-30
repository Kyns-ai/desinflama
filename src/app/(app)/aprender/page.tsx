"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  PlayCircle,
  ArrowLeftRight,
  Clock,
} from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { lessonsByTheme, type Lesson } from "@/content/library";
import { TRIGGER_FOODS } from "@/content/foods";
import { SWAPS } from "@/content/swaps";
import { RECIPES, type Recipe } from "@/content/recipes";
import { cn } from "@/lib/cn";

const TABS = ["Aulas", "Gatilhos", "Trocas", "Receitas"] as const;
type Tab = (typeof TABS)[number];

export default function Aprender() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Aulas");

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
          Aprender
        </h1>
      </header>

      {/* Tabs */}
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all",
              tab === t
                ? "bg-ink text-cream"
                : "bg-surface text-ink-soft border border-line"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {tab === "Aulas" && <Aulas />}
          {tab === "Gatilhos" && <Gatilhos />}
          {tab === "Trocas" && <Trocas />}
          {tab === "Receitas" && <Receitas />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------- Aulas ------------------------------- */

function Aulas() {
  const byTheme = lessonsByTheme();
  return (
    <div className="space-y-6">
      {Object.entries(byTheme).map(([tema, lessons]) => (
        <section key={tema}>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {tema}
          </h2>
          <div className="space-y-3">
            {lessons.map((l) => (
              <LessonCard key={l.id} lesson={l} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function LessonCard({ lesson }: { lesson: Lesson }) {
  const [open, setOpen] = useState(false);
  return (
    <Card elevation="soft" className="overflow-hidden p-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sage-deep to-sage-dark text-white">
          <PlayCircle className="size-6" strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-snug tracking-tight text-ink">
            {lesson.title}
          </span>
          <span className="text-xs text-ink-faint">{lesson.durationLabel}</span>
        </span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-ink-faint transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-[15px] leading-relaxed text-ink-soft">
              {lesson.body}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/* ------------------------------ Gatilhos ------------------------------ */

function Gatilhos() {
  return (
    <div className="space-y-3">
      <p className="text-[15px] text-ink-soft">
        Alimentos que parecem saudáveis e te incham. Não é proibição — é saber o
        que observar.
      </p>
      {TRIGGER_FOODS.map((f) => (
        <Card key={f.nome} elevation="soft">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{f.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold tracking-tight text-ink">
                  {f.nome}
                </h3>
                <Badge tone="coral">{f.grupo}</Badge>
              </div>
              <p className="mt-1.5 text-[15px] leading-snug text-ink-soft">
                {f.porque}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-sage-dark">
                <ArrowLeftRight className="size-4 shrink-0" /> {f.troca}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------- Trocas ------------------------------- */

function Trocas() {
  return (
    <div className="space-y-5">
      {SWAPS.map((cat) => (
        <section key={cat.categoria}>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-tight text-ink">
            <span className="text-lg">{cat.emoji}</span> {cat.categoria}
          </h2>
          <Card elevation="soft" className="space-y-3">
            {cat.itens.map((s, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 text-[15px]">
                  <span className="text-ink-faint line-through">{s.de}</span>
                  <ArrowLeftRight className="size-4 shrink-0 text-coral" />
                  <span className="font-medium text-ink">{s.para}</span>
                </div>
                <p className="mt-0.5 text-sm text-ink-soft">{s.motivo}</p>
                {i < cat.itens.length - 1 && (
                  <div className="mt-3 h-px bg-line" />
                )}
              </div>
            ))}
          </Card>
        </section>
      ))}
    </div>
  );
}

/* ------------------------------ Receitas ------------------------------ */

function Receitas() {
  return (
    <div className="space-y-3">
      {RECIPES.map((r) => (
        <RecipeCard key={r.id} recipe={r} />
      ))}
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [open, setOpen] = useState(false);
  return (
    <Card elevation="soft" className="overflow-hidden p-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="text-3xl">{recipe.emoji}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-snug tracking-tight text-ink">
            {recipe.nome}
          </span>
          <span className="mt-0.5 flex items-center gap-2 text-xs text-ink-faint">
            <Badge tone="sage">{recipe.phase}</Badge>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" /> {recipe.tempo}
            </span>
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-ink-faint transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-4 pb-4">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  Ingredientes
                </p>
                <ul className="space-y-1">
                  {recipe.ingredientes.map((ing, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-[15px] leading-snug text-ink-soft"
                    >
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sage/60" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  Modo de fazer
                </p>
                <ol className="space-y-1.5">
                  {recipe.modo.map((step, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-[15px] leading-snug text-ink-soft"
                    >
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-sage-tint text-xs font-semibold text-sage-dark">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
