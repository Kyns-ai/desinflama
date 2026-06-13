"use client";

/**
 * Bônus do Dia 7 — trancado até completedDays.includes(7). Visível desde o
 * Dia 0 como âncora de futuro (pedir reembolso = perder o que está chegando).
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, Lock } from "lucide-react";
import { Card, ProgressBar, Badge } from "@/components/ui";
import { Art } from "@/components/Art";
import { useAppStore } from "@/store/useAppStore";
import { BONUS_D7, type BonusDica } from "@/content/bonusD7";
import { cn } from "@/lib/cn";

export default function BonusPage() {
  const router = useRouter();
  const completedDays = useAppStore(
    (s) => s.data.progress?.completedDays ?? []
  );
  const unlocked = completedDays.includes(BONUS_D7.desbloqueiaNoDia);
  const diasFeitos = completedDays.filter(
    (d) => d <= BONUS_D7.desbloqueiaNoDia
  ).length;

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
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Bônus do Dia 7
          </p>
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink">
            {BONUS_D7.titulo}
          </h1>
        </div>
      </header>

      <Card elevation="card" className="flex items-center gap-4">
        <Art
          id="bonus-comerfora"
          emoji="🍽️"
          className="size-16 shrink-0 rounded-2xl text-3xl"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] leading-snug text-ink-soft">
            {BONUS_D7.subtitulo}
          </p>
          {unlocked ? (
            <Badge tone="sage" className="mt-2">
              Desbloqueado 🎉
            </Badge>
          ) : (
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-ink-soft">
                  <Lock className="size-3" /> Desbloqueia no seu Dia 7
                </span>
                <span className="font-semibold text-sage-deep">
                  {diasFeitos}/7 dias
                </span>
              </div>
              <ProgressBar value={diasFeitos / 7} />
            </div>
          )}
        </div>
      </Card>

      {unlocked ? (
        <div className="space-y-3">
          {BONUS_D7.dicas.map((d, i) => (
            <DicaCard key={i} dica={d} index={i + 1} />
          ))}
        </div>
      ) : (
        <Card elevation="soft" className="bg-cream-deep/40">
          <p className="text-[15px] leading-relaxed text-ink-soft">
            São <strong className="font-semibold text-ink">10 estratégias
            práticas</strong> pra você ir a restaurante, churrasco, pizzaria e
            bar sem desfazer o seu progresso — e sem virar “a chata da mesa”.
            Continue fechando seus dias que ele abre sozinho. 💛
          </p>
          <ul className="mt-3 space-y-1.5">
            {BONUS_D7.dicas.slice(0, 4).map((d, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-ink-faint">
                <Lock className="size-3.5 shrink-0" />
                {d.emoji} {d.heading}
              </li>
            ))}
            <li className="text-sm text-ink-faint">… e mais 6</li>
          </ul>
        </Card>
      )}
    </div>
  );
}

function DicaCard({ dica, index }: { dica: BonusDica; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Card elevation="soft" className="overflow-hidden p-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cream-deep text-xl">
          {dica.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-snug tracking-tight text-ink">
            {index}. {dica.heading}
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
            <p className="px-4 pb-4 text-[15px] leading-relaxed text-ink-soft">
              {dica.body}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
