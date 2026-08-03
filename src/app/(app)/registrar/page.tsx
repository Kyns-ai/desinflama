"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Camera, Check, TrendingUp, Plus, X, Coffee, Sun, Moon, Apple } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { PerguntaDoPrazer } from "@/components/PerguntaDoPrazer";
import { useAppStore } from "@/store/useAppStore";
import { todayKey } from "@/lib/date";
import { logInsight } from "@/lib/insight";
import { foodFeedback, type FoodFeedback } from "@/lib/foodFeedback";
import { TIER_STYLE } from "@/content/semaforo";
import { getDay } from "@/content/journey";
import { Art } from "@/components/Art";
import { artId } from "@/content/cardArt";
import type { DailyLog, MealEntry, Mood, SymptomKey } from "@/types/domain";
import { cn } from "@/lib/cn";

const SINTOMAS = [
  { key: "inchaco", emoji: "🎈", label: "Inchaço" },
  { key: "gases", emoji: "💨", label: "Gases" },
  { key: "intestino", emoji: "🚽", label: "Intestino" },
  { key: "energia", emoji: "⚡", label: "Energia" },
  { key: "pele", emoji: "✨", label: "Pele" },
] as const;

const HUMORES = [
  { v: 1, emoji: "😣", label: "Difícil" },
  { v: 2, emoji: "😐", label: "Ok" },
  { v: 3, emoji: "😌", label: "Leve" },
] as const;

const MEAL_TYPES = [
  { key: "cafe", label: "Café", icon: Coffee },
  { key: "almoco", label: "Almoço", icon: Sun },
  { key: "jantar", label: "Jantar", icon: Moon },
  { key: "lanche", label: "Lanche", icon: Apple },
] as const;

type MealType = (typeof MEAL_TYPES)[number]["key"];

function defaultMeal(): MealType {
  const h = new Date().getHours();
  if (h < 11) return "cafe";
  if (h < 15) return "almoco";
  if (h < 18) return "lanche";
  return "jantar";
}

export default function Registrar() {
  const addLog = useAppStore((s) => s.addLog);
  const logs = useAppStore((s) => s.data.logs);
  const currentDay = useAppStore((s) => s.data.progress?.currentDay ?? 1);

  // registrar de novo EDITA o dia (addLog substitui o log da data) — sem
  // pré-carregar, o segundo registro apagaria as refeições da manhã.
  const todayLog = logs.find((l) => l.date === todayKey()) ?? null;
  const [meals, setMeals] = useState<MealEntry[]>(() => todayLog?.meals ?? []);
  const [mealType, setMealType] = useState<MealType>(defaultMeal);
  const [mealText, setMealText] = useState("");
  const [valores, setValores] = useState<Record<string, number>>(
    () => ({ ...(todayLog?.symptoms ?? {}) }) as Record<string, number>
  );
  const [humor, setHumor] = useState<number | null>(() => todayLog?.mood ?? null);
  const [hidratacao, setHidratacao] = useState<boolean>(
    () => todayLog?.hydrationOk ?? false
  );
  const [salvo, setSalvo] = useState(false);
  const [insight, setInsight] = useState("");
  const [feedback, setFeedback] = useState<FoodFeedback | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    },
    []
  );

  const suggestions = useMemo(() => {
    const d = getDay(currentDay);
    return d?.meals[mealType]?.slice(0, 3) ?? [];
  }, [currentDay, mealType]);

  const completo = SINTOMAS.every((s) => valores[s.key]) && humor !== null;

  function addMeal(descricao: string) {
    const text = descricao.trim();
    if (!text) return;
    setMeals((m) => [...m, { refeicao: mealType, descricao: text }]);
    setMealText("");
    // feedback imediato: o registro responde na hora (anti-culpa, pró-mapa)
    setFeedback(foodFeedback(text));
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 3500);
  }

  async function salvar() {
    const hoje = todayKey();
    const log: DailyLog = {
      id: `${hoje}-${Date.now()}`,
      date: hoje,
      meals,
      symptoms: valores as Partial<Record<SymptomKey, number>>,
      mood: (humor as Mood) ?? null,
      hydrationOk: hidratacao,
      createdAt: new Date().toISOString(),
    };
    const msg = logInsight([...logs.filter((l) => l.date !== hoje), log], log);
    setInsight(msg);
    await addLog(log);
    setSalvo(true);
  }

  if (salvo) {
    return (
      <div className="flex min-h-[72vh] flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="grid size-20 place-items-center rounded-full bg-rose text-white shadow-[var(--shadow-rose)]"
        >
          <Check className="size-10" strokeWidth={3} />
        </motion.div>
        <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink">
          Registrado!
        </h2>
        <p className="mt-3 flex max-w-xs items-start gap-1.5 text-[15px] leading-relaxed text-ink-soft">
          <TrendingUp className="mt-0.5 size-4 shrink-0 text-rose-deep" />
          {insight}
        </p>
        <Button
          variant="secondary"
          className="mt-8"
          onClick={() => setSalvo(false)}
        >
          Completar o registro de hoje
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* A pergunta do prazer vem ANTES de tudo: é a única coisa aqui
          que o app prometeu em voz alta e precisa cumprir. */}
      <PerguntaDoPrazer />

      <header className="pt-5">
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-ink">
          Como você está hoje?
        </h1>
        <p className="mt-1 text-[15px] text-ink-soft">
          Rápido — e alimenta seu Índice Intestinal.
        </p>
      </header>

      {/* Refeições (opcional) */}
      <Card elevation="card">
        <p className="mb-3 font-semibold tracking-tight text-ink">
          O que você comeu?{" "}
          <span className="font-normal text-ink-faint">(opcional)</span>
        </p>

        <div className="mb-3 flex gap-1.5">
          {MEAL_TYPES.map((m) => {
            const Icon = m.icon;
            const active = mealType === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setMealType(m.key)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs font-medium transition-all active:scale-95",
                  active ? "bg-rose-tint text-rose-dark" : "bg-cream-deep text-ink-soft"
                )}
              >
                <Icon className="size-4" />
                {m.label}
              </button>
            );
          })}
        </div>

        {suggestions.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => addMeal(s)}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-soft transition-colors active:bg-rose-tint/40"
              >
                + {s.length > 28 ? s.slice(0, 28) + "…" : s}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={mealText}
            onChange={(e) => setMealText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMeal(mealText)}
            placeholder="Adicionar à mão…"
            className="h-11 flex-1 rounded-xl border border-line bg-surface px-3.5 text-[15px] text-ink placeholder:text-ink-faint focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/30"
          />
          {/* Atalho da foto ao lado do registro: é assim que pontuar o prato
              vira hábito diário em vez de novidade de uma vez só. Vai pro
              Prato, não mais para uma conversa com a "nutri". */}
          <Link
            href="/prato"
            aria-label="Registrar o prato e ver a Nota Desinflama"
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-rose/40 bg-rose-tint text-rose-dark transition-transform active:scale-95"
          >
            <Camera className="size-5" />
          </Link>
          <button
            onClick={() => addMeal(mealText)}
            aria-label="Adicionar refeição"
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-rose text-white transition-transform active:scale-95"
          >
            <Plus className="size-5" />
          </button>
        </div>
        {/* O app não é "uma nutricionista de IA" — a copy antiga dizia que "a
            nutri olha a foto e responde". Agora fala do que a tela faz: dá uma
            nota calculada com o mapa DELA. */}
        <p className="mt-2 text-[13px] leading-relaxed text-ink-faint">
          Na dúvida se o prato cai bem, toque na câmera: você vê a Nota
          Desinflama dele antes de comer.
        </p>

        <AnimatePresence>
          {feedback && (
            <motion.p
              key={feedback.message}
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className={cn(
                "mt-3 inline-flex items-start gap-1.5 rounded-2xl px-3.5 py-2 text-sm font-medium leading-snug",
                feedback.tier === "neutro"
                  ? "bg-cream-deep text-ink-soft"
                  : TIER_STYLE[feedback.tier].chip
              )}
            >
              {feedback.message}
            </motion.p>
          )}
        </AnimatePresence>

        {meals.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {meals.map((m, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-xl bg-cream-deep/50 px-3 py-2 text-sm"
              >
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-ink-soft">
                  {MEAL_TYPES.find((t) => t.key === m.refeicao)?.label}
                </span>
                <span className="min-w-0 flex-1 truncate text-ink">
                  {m.descricao}
                </span>
                <button
                  onClick={() => setMeals((arr) => arr.filter((_, j) => j !== i))}
                  aria-label="Remover"
                  className="text-ink-faint"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Sintomas */}
      <Card elevation="card">
        <p className="mb-4 font-semibold tracking-tight text-ink">
          Como está cada sintoma?
        </p>
        <div className="space-y-5">
          {SINTOMAS.map((s) => (
            <div key={s.key}>
              <div className="mb-2 flex items-center gap-2">
                <Art
                  id={artId(s.emoji) ?? ""}
                  emoji={s.emoji}
                  className="size-7 rounded-lg text-xl"
                />
                <span className="font-semibold tracking-tight text-ink">
                  {s.label}
                </span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = valores[s.key] === n;
                  return (
                    <button
                      key={n}
                      onClick={() => setValores((v) => ({ ...v, [s.key]: n }))}
                      className={cn(
                        "h-10 flex-1 rounded-xl text-sm font-semibold transition-all active:scale-95",
                        active
                          ? "bg-rose text-white shadow-[var(--shadow-rose)]"
                          : "bg-cream-deep text-ink-soft hover:bg-line"
                      )}
                      aria-pressed={active}
                      aria-label={`${s.label} nível ${n}`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Hidratação */}
      <Card elevation="card">
        <button
          onClick={() => setHidratacao((v) => !v)}
          className="flex w-full items-center gap-3 text-left"
          aria-pressed={hidratacao}
        >
          <span
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-lg border-2 transition-all",
              hidratacao ? "border-rose bg-rose text-white" : "border-line"
            )}
          >
            {hidratacao && <Check className="size-4" strokeWidth={3} />}
          </span>
          <span className="flex-1">
            <span className="block font-semibold tracking-tight text-ink">
              Bebi ~2L de água hoje
            </span>
            <span className="text-sm text-ink-soft">
 Hidratação conta pro seu Índice
            </span>
          </span>
        </button>
      </Card>

      {/* Humor */}
      <Card elevation="card">
        <p className="mb-3 font-semibold tracking-tight text-ink">E seu humor?</p>
        <div className="flex gap-3">
          {HUMORES.map((h) => {
            const active = humor === h.v;
            return (
              <button
                key={h.v}
                onClick={() => setHumor(h.v)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-2xl py-4 transition-all active:scale-95",
                  active ? "bg-coral-tint ring-2 ring-coral" : "bg-cream-deep hover:bg-line"
                )}
                aria-pressed={active}
              >
                <Art
                  id={artId(h.emoji) ?? ""}
                  emoji={h.emoji}
                  className="size-11 rounded-2xl text-3xl"
                />
                <span className="text-xs font-medium text-ink-soft">{h.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Button fullWidth size="lg" disabled={!completo} onClick={salvar}>
        {completo ? "Salvar registro" : "Marque os sintomas e o humor"}
      </Button>
    </div>
  );
}
