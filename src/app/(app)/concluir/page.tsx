"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Infinity as InfinityIcon, Rocket } from "lucide-react";
import { Card, Button } from "@/components/ui";
import { ToleranceMapCard } from "@/components/ToleranceMapCard";
import { useAppStore } from "@/store/useAppStore";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Concluir() {
  const router = useRouter();
  const ready = useAppStore((s) => s.ready);
  const challenge = useAppStore((s) => s.data.progress?.challengeType);
  const completedDays = useAppStore(
    (s) => s.data.progress?.completedDays ?? null
  );
  const startResetProfundo = useAppStore((s) => s.startResetProfundo);
  const enterMaintenance = useAppStore((s) => s.enterMaintenance);
  const [busy, setBusy] = useState<string | null>(null);

  // Esta tela é só para quem FECHOU o programa — aberta antes da hora, ela
  // afirmaria uma conclusão falsa e a Manutenção (irreversível) abandonaria
  // a jornada no meio.
  const earned =
    (challenge === "main14" && (completedDays?.includes(14) ?? false)) ||
    (challenge === "reset21" && (completedDays?.includes(21) ?? false));
  useEffect(() => {
    if (ready && !earned && !busy) router.replace("/inicio");
  }, [ready, earned, busy, router]);
  if (!earned) return null;

  const canReset = challenge === "main14";

  async function goReset() {
    setBusy("reset");
    await startResetProfundo();
    router.replace("/jornada");
  }
  async function goMaintenance() {
    setBusy("manut");
    await enterMaintenance();
    router.replace("/inicio");
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md px-6 pt-safe pb-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="pt-10 text-center"
      >
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-gold text-white shadow-[var(--shadow-rose)]">
          <Sparkles className="size-10" />
        </div>
        <h1 className="mt-6 font-display text-[2rem] font-semibold leading-tight tracking-tight text-ink">
 {canReset?"Você fechou os 14 dias":"Reset Profundo concluído"}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-ink-soft">
          Seu intestino está em outro lugar. Agora a pergunta é: como manter — e
          até onde ir.
        </p>
      </motion.div>

      {/* O payoff tangível: o mapa pessoal que ela construiu */}
      <div className="mt-6">
        <ToleranceMapCard />
      </div>

      <div className="mt-8 space-y-4">
        {canReset && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
          >
            <Card elevation="lift" className="border border-rose/30">
              <div className="flex items-center gap-2">
                <Rocket className="size-5 text-rose-deep" />
                <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                  Reset Profundo · +7 dias
                </h2>
              </div>
              <p className="mt-1.5 text-[15px] text-ink-soft">
                Aprofunda a reintrodução e ajusta sono, estresse e movimento.
                Pra quem quer consolidar de vez.
              </p>
              <Button
                fullWidth
                size="lg"
                className="mt-4"
                loading={busy === "reset"}
                onClick={goReset}
              >
                Continuar pro Reset <ArrowRight className="size-5" />
              </Button>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease }}
        >
          <Card elevation={canReset ? "soft" : "lift"} className={canReset ? "" : "border border-rose/30"}>
            <div className="flex items-center gap-2">
              <InfinityIcon className="size-5 text-rose-deep" />
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                Modo Manutenção
              </h2>
            </div>
            <p className="mt-1.5 text-[15px] text-ink-soft">
              Rotina leve do dia a dia + desafios mensais pra você nunca mais
              voltar a inchar. É o que segura a leveza a longo prazo.
            </p>
            <Button
              fullWidth
              size="lg"
              variant={canReset ? "secondary" : "primary"}
              className="mt-4"
              loading={busy === "manut"}
              onClick={goMaintenance}
            >
              Ativar manutenção
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
