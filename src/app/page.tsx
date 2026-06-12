"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Sparkles, PlayCircle } from "lucide-react";
import { buttonStyles } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { isFullyMocked } from "@/lib/env";
import { PROJECTION, PROJECTION_NOTE } from "@/content/promise";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Welcome() {
  const router = useRouter();
  const ready = useAppStore((s) => s.ready);
  const user = useAppStore((s) => s.user);
  const onboarding = useAppStore((s) => s.data.user?.onboarding ?? null);
  const enterDemo = useAppStore((s) => s.enterDemo);
  const [demoLoading, setDemoLoading] = useState(false);

  // Usuária que já entrou e concluiu o onboarding vai direto pro app.
  useEffect(() => {
    if (ready && user && onboarding) router.replace("/inicio");
  }, [ready, user, onboarding, router]);

  async function verDemo() {
    setDemoLoading(true);
    await enterDemo();
    router.replace("/inicio");
  }

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden bg-cream px-7 pt-safe pb-safe">
      {/* atmosfera: halos suaves de sálvia e coral */}
      <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-sage-tint/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 size-64 rounded-full bg-coral-tint/60 blur-3xl" />

      <div className="relative flex flex-1 flex-col justify-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease }}
          className="mb-8"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon.svg"
            alt="Desinflama"
            className="size-16 rounded-[1.1rem] shadow-[var(--shadow-soft)]"
          />
        </motion.div>

        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
          className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1 text-xs font-semibold text-sage-dark"
        >
          <Sparkles className="size-3.5" /> Desafio Desincha · 14 dias
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease }}
          className="font-display text-[2.6rem] font-semibold leading-[1.08] tracking-tight text-ink"
        >
          Sua barriga leve
          <br />
          começa aqui.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.26, ease }}
          className="mt-4 max-w-sm text-[17px] leading-relaxed text-ink-soft"
        >
          Descubra o que te incha e desinflame de verdade — sem contar caloria,
          sem dieta da moda. Só você, sua digestão e um plano que te mostra o
          que funciona pra você.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.34, ease }}
          className="mt-8 flex items-stretch gap-2"
        >
          {PROJECTION.map((p) => (
            <div
              key={p.when}
              className="flex-1 rounded-2xl border border-line bg-surface/70 px-3 py-3 text-center"
            >
              <div className="font-display text-lg font-semibold text-sage-deep">
                {p.when}
              </div>
              <div className="mt-0.5 text-[11px] leading-tight text-ink-soft">
                {p.label}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.42, ease }}
          className="mt-3 text-xs leading-relaxed text-ink-faint"
        >
          {PROJECTION_NOTE}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.42, ease }}
        className="relative space-y-3 pb-6"
      >
        <Link
          href="/auth?mode=signup"
          className={buttonStyles({ size: "lg", fullWidth: true })}
        >
          Começar agora <ArrowRight className="size-5" />
        </Link>
        <Link
          href="/auth?mode=login"
          className={buttonStyles({
            variant: "ghost",
            size: "md",
            fullWidth: true,
          })}
        >
          Já sou assinante · Entrar
        </Link>

        {isFullyMocked && (
          <button
            onClick={verDemo}
            disabled={demoLoading}
            className="flex w-full items-center justify-center gap-1.5 pt-1 text-sm font-medium text-sage-deep disabled:opacity-50"
          >
            <PlayCircle className="size-4" />
            {demoLoading ? "Abrindo demonstração…" : "Ver demonstração"}
          </button>
        )}
      </motion.div>
    </div>
  );
}
