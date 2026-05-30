"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, TrendingUp } from "lucide-react";
import { Button, Card } from "@/components/ui";
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

export default function Registrar() {
  const [valores, setValores] = useState<Record<string, number>>({});
  const [humor, setHumor] = useState<number | null>(null);
  const [salvo, setSalvo] = useState(false);

  const completo = SINTOMAS.every((s) => valores[s.key]) && humor !== null;

  if (salvo) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="grid size-20 place-items-center rounded-full bg-sage text-white shadow-[var(--shadow-sage)]"
        >
          <Check className="size-10" strokeWidth={3} />
        </motion.div>
        <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink">
          Registrado!
        </h2>
        <p className="mt-2 flex items-center gap-1.5 text-[15px] text-ink-soft">
          <TrendingUp className="size-4 text-sage-deep" /> Seu padrão está
          melhorando
        </p>
        <Button
          variant="secondary"
          className="mt-8"
          onClick={() => {
            setSalvo(false);
            setValores({});
            setHumor(null);
          }}
        >
          Registrar de novo
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="pt-5">
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-ink">
          Como você está hoje?
        </h1>
        <p className="mt-1 text-[15px] text-ink-soft">
          Toque para registrar. É rápido — e alimenta seu Gut Score.
        </p>
      </header>

      <Card elevation="card">
        <div className="space-y-5">
          {SINTOMAS.map((s) => (
            <div key={s.key}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl">{s.emoji}</span>
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
                      onClick={() =>
                        setValores((v) => ({ ...v, [s.key]: n }))
                      }
                      className={cn(
                        "h-10 flex-1 rounded-xl text-sm font-semibold transition-all active:scale-95",
                        active
                          ? "bg-sage text-white shadow-[var(--shadow-sage)]"
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

      <Card elevation="card">
        <p className="mb-3 font-semibold tracking-tight text-ink">
          E seu humor?
        </p>
        <div className="flex gap-3">
          {HUMORES.map((h) => {
            const active = humor === h.v;
            return (
              <button
                key={h.v}
                onClick={() => setHumor(h.v)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-2xl py-4 transition-all active:scale-95",
                  active
                    ? "bg-coral-tint ring-2 ring-coral"
                    : "bg-cream-deep hover:bg-line"
                )}
                aria-pressed={active}
              >
                <span className="text-3xl">{h.emoji}</span>
                <span className="text-xs font-medium text-ink-soft">
                  {h.label}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            fullWidth
            size="lg"
            disabled={!completo}
            onClick={() => setSalvo(true)}
          >
            {completo ? "Salvar registro" : "Preencha tudo para salvar"}
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
