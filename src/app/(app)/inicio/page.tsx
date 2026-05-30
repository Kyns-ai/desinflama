"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Flame,
  ArrowRight,
  PlayCircle,
  HeartPulse,
  ChevronRight,
} from "lucide-react";
import { ScoreRing, Card, Badge, IconCircle, buttonStyles } from "@/components/ui";

// Conteúdo-semente para a Fase 0 (a Fase 3 conecta ao estado real).
const SEED = {
  nome: "Marina",
  score: 68,
  delta: 5,
  dia: 3,
  totalDias: 14,
  fase: "Choque",
  foco: "Cortar os maiores fermentadores",
  streak: 3,
  aula: "Por que você vive estufada (não é o quanto você come)",
};

const ease = [0.22, 1, 0.36, 1] as const;

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Inicio() {
  const microcopy =
    SEED.delta > 0
      ? "Seu intestino está respondendo. Continua assim 🌱"
      : "Todo dia conta. Vamos com calma hoje.";

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between pt-5">
        <div>
          <p className="text-[15px] text-ink-soft">{saudacao()},</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            {SEED.nome}
          </h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-tint px-3 py-1.5 text-sm font-semibold text-coral-dark">
          <Flame className="size-4" /> {SEED.streak}
        </span>
      </header>

      {/* Gut Score */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
      >
        <Card className="flex flex-col items-center py-7" elevation="lift">
          <ScoreRing value={SEED.score} from={SEED.score - SEED.delta} delta={SEED.delta} />
          <p className="mt-4 max-w-[15rem] text-center text-[15px] leading-relaxed text-ink-soft">
            {microcopy}
          </p>
        </Card>
      </motion.div>

      {/* Seu dia de hoje */}
      <Link href="/jornada" className="block">
        <Card className="transition-transform active:scale-[0.99]" elevation="card">
          <div className="flex items-center justify-between">
            <Badge tone="coral">Fase {SEED.fase}</Badge>
            <span className="text-sm font-medium text-ink-faint">
              Dia {SEED.dia} de {SEED.totalDias}
            </span>
          </div>
          <h2 className="mt-3 font-display text-xl font-semibold tracking-tight text-ink">
            Seu dia de hoje
          </h2>
          <p className="mt-1 text-[15px] text-ink-soft">{SEED.foco}</p>
          <div
            className={buttonStyles({
              variant: "sage",
              size: "md",
              fullWidth: true,
              className: "mt-4",
            })}
          >
            Ver meu dia <ArrowRight className="size-4" />
          </div>
        </Card>
      </Link>

      {/* Como você está hoje? */}
      <Link href="/registrar" className="block">
        <Card
          elevation="soft"
          className="flex items-center gap-4 bg-gradient-to-br from-surface to-sage-tint/40 transition-transform active:scale-[0.99]"
        >
          <IconCircle icon={HeartPulse} tone="sage" size="lg" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold tracking-tight text-ink">
              Como você está hoje?
            </h3>
            <p className="text-sm text-ink-soft">
              30 segundos que melhoram seu Gut Score
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-ink-faint" />
        </Card>
      </Link>

      {/* Aula do dia */}
      <div>
        <h2 className="mb-3 text-base font-semibold tracking-tight text-ink">
          Aula de hoje
        </h2>
        <Card elevation="card" className="overflow-hidden p-0">
          <div className="relative grid h-36 place-items-center bg-gradient-to-br from-sage-deep to-sage-dark">
            <PlayCircle className="size-12 text-white/90" strokeWidth={1.6} />
            <span className="absolute bottom-3 right-3 rounded-full bg-black/25 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
              3 min
            </span>
          </div>
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Entenda seu corpo
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold leading-snug tracking-tight text-ink">
              {SEED.aula}
            </h3>
          </div>
        </Card>
      </div>
    </div>
  );
}
